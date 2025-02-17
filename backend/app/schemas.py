from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List
from uuid import UUID

class TagBase(BaseModel):
    name: str
    category: str

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: UUID
    
    class Config:
        from_attributes = True

class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class ExperienceEntry(BaseModel):
    company: str
    title: str
    duration: str
    start_date: str
    end_date: str
    achievements: List[str]
    technologies: List[str]

class EducationEntry(BaseModel):
    institution: str
    degree: str
    field: str
    graduation_date: str
    gpa: Optional[str] = None

class CertificationEntry(BaseModel):
    name: str
    issuer: str
    date: str
    expires: Optional[str] = None

class Skills(BaseModel):
    technical: List[str]
    soft: List[str]
    languages: List[str]

class ParsedResumeContent(BaseModel):
    skills: Skills
    experience: List[ExperienceEntry]
    education: List[EducationEntry]
    certifications: List[CertificationEntry] = []
    total_years_experience: float
    career_level: str
    suggested_roles: List[str]
    suggested_tags: List[str]

class ResumeBase(BaseModel):
    candidate_id: UUID
    file_type: str

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: UUID
    file_path: str
    parsed_content: Optional[ParsedResumeContent] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[Tag] = []
    
    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    department: str
    headcount: int
    job_type: str  # full-time, part-time, contract
    job_level: str  # entry, mid, senior, lead
    location: str
    remote_policy: str  # office, hybrid, remote
    salary_range: Optional[str] = None
    description: str
    responsibilities: str  # JSON string
    qualifications: str  # JSON string
    benefits: Optional[str] = None  # JSON string
    priority: str = 'normal'  # low, normal, high, urgent
    target_date: datetime

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(ProjectBase):
    status: Optional[str] = None
    
class Project(ProjectBase):
    id: UUID
    status: str  # draft, open, in-progress, on-hold, closed
    created_at: datetime
    
    class Config:
        from_attributes = True

class RequirementBase(BaseModel):
    project_id: UUID
    description: str
    is_required: bool = True

class RequirementCreate(RequirementBase):
    pass

class Requirement(RequirementBase):
    id: UUID
    created_at: datetime
    tags: List[Tag] = []
    
    class Config:
        from_attributes = True

class InterviewFeedback(BaseModel):
    technical_score: int = Field(ge=1, le=5)
    communication_score: int = Field(ge=1, le=5)
    culture_fit_score: int = Field(ge=1, le=5)
    strengths: List[str]
    areas_for_improvement: List[str]
    recommendation: str
    overall_rating: float = Field(ge=1.0, le=5.0)
    interviewer_notes: Optional[str] = None

class InterviewBase(BaseModel):
    project_id: UUID
    candidate_id: UUID
    scheduled_time: datetime
    interview_type: str = Field(default="technical")  # technical, behavioral, culture
    status: str = Field(default="scheduled")  # scheduled, completed, cancelled, no_show

class InterviewCreate(InterviewBase):
    pass

class Interview(InterviewBase):
    id: UUID
    feedback: Optional[InterviewFeedback] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
