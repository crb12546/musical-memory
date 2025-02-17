import { UUID } from "crypto"

export interface Project {
  id: UUID
  title: string
  department: string
  headcount: number
  job_type: string
  job_level: string
  location: string
  remote_policy: string
  salary_range: string
  description: string
  responsibilities: string
  qualifications: string
  benefits?: string
  priority: string
  target_date: string
  status: string
  created_at: string
  updated_at: string
}

export interface Candidate {
  id: UUID
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  updated_at: string
}

export interface Resume {
  id: UUID
  candidate_id: UUID
  file_path: string
  parsed_content: string
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface Interview {
  id: UUID
  project_id: UUID
  candidate_id: UUID
  scheduled_time: string
  interview_type: string
  status: string
  rating?: number
  feedback?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: UUID
  name: string
}
