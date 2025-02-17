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

class ResumeBase(BaseModel):
    candidate_id: UUID
    file_type: str

class ResumeCreate(ResumeBase):
    pass

class Resume(ResumeBase):
    id: UUID
    file_path: str
    parsed_content: Optional[str] = None
    created_at: datetime
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

class InterviewBase(BaseModel):
    project_id: UUID
    candidate_id: UUID
    scheduled_time: datetime
    status: str

class InterviewCreate(InterviewBase):
    pass

class Interview(InterviewBase):
    id: UUID
    feedback: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
