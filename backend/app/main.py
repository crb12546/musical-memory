from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import json
from . import models, schemas, database
from typing import List
import shutil
from pathlib import Path
from uuid import UUID
from datetime import datetime

app = FastAPI()

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://slack-language-app-ky3hcdvq.devinapps.com",
        "http://localhost:5173"  # For local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create uploads directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@app.on_event("startup")
async def startup_event():
    print("Starting application...")
    print("Creating database tables...")
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print("Database tables created successfully")
        # Verify route registration
        print("Registered routes:")
        for route in app.routes:
            print(f"  {route.methods} {route.path}")
    except Exception as e:
        print(f"Error during startup: {str(e)}")

@app.get("/healthz")
async def healthz():
    return {"status": "ok"}

# Project endpoints
@app.post("/api/projects/", response_model=schemas.Project)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db)):
    db_project = models.Project(**project.dict(), status="open")
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.get("/api/projects/", response_model=List[schemas.Project])
def list_projects(db: Session = Depends(database.get_db)):
    return db.query(models.Project).all()

@app.put("/api/projects/{project_id}", response_model=schemas.Project)
def update_project(project_id: UUID, project: schemas.ProjectUpdate, db: Session = Depends(database.get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="项目不存在")
    for key, value in project.dict(exclude_unset=True).items():
        setattr(db_project, key, value)
    db.commit()
    db.refresh(db_project)
    return db_project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: UUID, db: Session = Depends(database.get_db)):
    db_project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="项目不存在")
    db.delete(db_project)
    db.commit()
    return {"status": "success"}

# Requirement endpoints
@app.post("/api/requirements/", response_model=schemas.Requirement)
def create_requirement(requirement: schemas.RequirementCreate, db: Session = Depends(database.get_db)):
    db_requirement = models.Requirement(**requirement.dict())
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

@app.get("/api/requirements/", response_model=List[schemas.Requirement])
def list_requirements(db: Session = Depends(database.get_db)):
    return db.query(models.Requirement).all()

# Interview endpoints
@app.post("/api/interviews/", response_model=schemas.Interview)
def create_interview(interview: schemas.InterviewCreate, db: Session = Depends(database.get_db)):
    db_interview = models.Interview(**interview.dict())
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)
    return db_interview

@app.get("/api/interviews/", response_model=List[schemas.Interview])
def list_interviews(db: Session = Depends(database.get_db)):
    return db.query(models.Interview).all()

@app.put("/api/interviews/{interview_id}", response_model=schemas.Interview)
def update_interview(
    interview_id: UUID,
    interview: schemas.Interview,
    db: Session = Depends(database.get_db)
):
    db_interview = db.query(models.Interview).filter(models.Interview.id == interview_id).first()
    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    update_data = interview.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interview, key, value)
    
    db_interview.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_interview)
    return db_interview

# Candidate endpoints
@app.post("/api/candidates/", response_model=schemas.Candidate)
def create_candidate(candidate: schemas.CandidateCreate, db: Session = Depends(database.get_db)):
    db_candidate = models.Candidate(**candidate.dict())
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate

@app.get("/api/candidates/", response_model=List[schemas.Candidate])
def list_candidates(db: Session = Depends(database.get_db)):
    return db.query(models.Candidate).all()

# Resume endpoints
@app.post("/api/resumes/", response_model=schemas.Resume)
async def upload_resume(
    file: UploadFile = File(...),
    candidate_id: str = Form(...),
    db: Session = Depends(database.get_db)
):
    if not candidate_id:
        raise HTTPException(status_code=400, detail="Candidate ID is required")
    
    try:
        candidate_uuid = UUID(candidate_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid candidate ID format")
    
    # Check if candidate exists
    candidate = db.query(models.Candidate).filter(models.Candidate.id == candidate_uuid).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Create uploads directory if it doesn't exist
    UPLOAD_DIR.mkdir(exist_ok=True)
    
    # Save the file
    file_path = UPLOAD_DIR / f"{candidate_id}_{file.filename}"
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create resume record
    db_resume = models.Resume(
        candidate_id=candidate_uuid,
        file_path=str(file_path),
        file_type=file.content_type
    )
    db.add(db_resume)
    
    # Parse resume using LLM
    try:
        from . import llm
        parsed_data = llm.parse_resume(str(file_path), file.content_type)
        db_resume.parsed_content = json.dumps(parsed_data)
        
        # Create tags from parsed data
        if "suggested_tags" in parsed_data:
            for tag_name in parsed_data["suggested_tags"]:
                # Check if tag exists
                existing_tag = db.query(models.Tag).filter(models.Tag.name == tag_name).first()
                if not existing_tag:
                    tag = models.Tag(name=tag_name, category="skill")
                    db.add(tag)
                    db.flush()  # Ensure tag has an ID before association
                    db_resume.tags.append(tag)
                else:
                    db_resume.tags.append(existing_tag)
    except Exception as e:
        print(f"Error parsing resume: {str(e)}")
    
    db.commit()
    db.refresh(db_resume)
    
    return db_resume

@app.get("/api/resumes/", response_model=List[schemas.Resume])
def list_resumes(db: Session = Depends(database.get_db)):
    return db.query(models.Resume).all()

# Tag endpoints
@app.post("/api/tags/", response_model=schemas.Tag)
def create_tag(tag: schemas.TagCreate, db: Session = Depends(database.get_db)):
    db_tag = models.Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@app.get("/api/tags/", response_model=List[schemas.Tag])
def list_tags(db: Session = Depends(database.get_db)):
    return db.query(models.Tag).all()
