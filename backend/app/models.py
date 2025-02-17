from sqlalchemy import Column, String, DateTime, ForeignKey, Table, Integer, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime

Base = declarative_base()

# Association tables for many-to-many relationships
resume_tags = Table(
    'resume_tags',
    Base.metadata,
    Column('resume_id', UUID(as_uuid=True), ForeignKey('resumes.id')),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id'))
)

requirement_tags = Table(
    'requirement_tags',
    Base.metadata,
    Column('requirement_id', UUID(as_uuid=True), ForeignKey('requirements.id')),
    Column('tag_id', UUID(as_uuid=True), ForeignKey('tags.id'))
)

class Candidate(Base):
    __tablename__ = 'candidates'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    resumes = relationship("Resume", back_populates="candidate")
    interviews = relationship("Interview", back_populates="candidate")

class Resume(Base):
    __tablename__ = 'resumes'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id'))
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    parsed_content = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    candidate = relationship("Candidate", back_populates="resumes")
    tags = relationship("Tag", secondary=resume_tags, back_populates="resumes")

class Tag(Base):
    __tablename__ = 'tags'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    
    resumes = relationship("Resume", secondary=resume_tags, back_populates="tags")
    requirements = relationship("Requirement", secondary=requirement_tags, back_populates="tags")

class Project(Base):
    __tablename__ = 'projects'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    headcount = Column(Integer, nullable=False)
    job_type = Column(String, nullable=False)  # full-time, part-time, contract
    job_level = Column(String, nullable=False)  # entry, mid, senior, lead
    location = Column(String, nullable=False)
    remote_policy = Column(String, nullable=False)  # office, hybrid, remote
    salary_range = Column(String)
    description = Column(String, nullable=False)
    responsibilities = Column(String, nullable=False)  # JSON string
    qualifications = Column(String, nullable=False)  # JSON string
    benefits = Column(String)  # JSON string
    priority = Column(String, default='normal')  # low, normal, high, urgent
    status = Column(String, nullable=False, default='draft')  # draft, open, in-progress, on-hold, closed
    target_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    requirements = relationship("Requirement", back_populates="project")
    interviews = relationship("Interview", back_populates="project")

class Requirement(Base):
    __tablename__ = 'requirements'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'))
    description = Column(String, nullable=False)
    is_required = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="requirements")
    tags = relationship("Tag", secondary=requirement_tags, back_populates="requirements")

class Interview(Base):
    __tablename__ = 'interviews'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey('projects.id'))
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidates.id'))
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(String, nullable=False)  # scheduled, completed, cancelled
    feedback = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="interviews")
    candidate = relationship("Candidate", back_populates="interviews")
