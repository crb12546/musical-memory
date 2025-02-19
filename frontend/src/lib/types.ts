export interface Project {
  id: string
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
  id: string
  name: string
  email: string
  phone: string
  status: string
  created_at: string
  updated_at: string
}

export interface Resume {
  id: string
  candidate_id: string
  file_path: string
  file_type: string
  parsed_content: string | null
  tags: Tag[]
  created_at: string
}

export interface Interview {
  id: string
  project_id: string
  candidate_id: string
  scheduled_time: string
  interview_type: string
  status: string
  rating?: number
  feedback?: string
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
}
