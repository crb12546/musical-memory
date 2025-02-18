const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  category: string;
}

export interface Resume {
  id: string;
  candidate_id: string;
  file_path: string;
  file_type: string;
  parsed_content: string | null;
  created_at: string;
  tags: Tag[];
}

export interface Project {
  id: string;
  title: string;
  department: string;
  headcount: number;
  job_type: string;  // full-time, part-time, contract
  job_level: string;  // entry, mid, senior, lead
  location: string;
  remote_policy: string;  // office, hybrid, remote
  salary_range?: string;
  description: string;
  responsibilities: string;  // JSON string
  qualifications: string;  // JSON string
  benefits?: string;  // JSON string
  priority: string;  // low, normal, high, urgent
  status: string;  // draft, open, in-progress, on-hold, closed
  current_stage?: string;  // sourcing, interviewing, offer, onboarding
  completed_stages?: string[];  // Array of completed stage IDs
  target_date: string;
  created_at: string;
  updated_at?: string;
}

export interface Requirement {
  id: string;
  project_id: string;
  description: string;
  is_required: boolean;
  created_at: string;
  tags: Tag[];
}

export interface InterviewFeedback {
  technical_score: number;
  communication_score: number;
  culture_fit_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  recommendation: string;
  overall_rating: number;
  interviewer_notes?: string;
}

export interface Interview {
  id: string;
  project_id: string;
  candidate_id: string;
  scheduled_time: string;
  interview_type: string;
  status: string;
  feedback?: InterviewFeedback;
  created_at: string;
  updated_at?: string;
}

export type InterviewCreate = Omit<Interview, 'id' | 'created_at' | 'updated_at'>

export const api = {
  // Candidates
  async createCandidate(data: Omit<Candidate, 'id' | 'created_at'>) {
    const response = await fetch(`${API_URL}/api/candidates/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async getCandidates(): Promise<Candidate[]> {
    const response = await fetch(`${API_URL}/api/candidates/`);
    return response.json();
  },

  // Resumes
  async uploadResume(file: File, candidateId: string): Promise<Resume> {
    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('msword') && !file.type.includes('openxmlformats-officedocument.wordprocessingml')) {
      throw new Error('仅支持 PDF 和 Word 文档');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidate_id', candidateId);

    const response = await fetch(`${API_URL}/api/resumes/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `上传失败: HTTP错误 ${response.status}`);
    }

    return response.json();
  },</old_str>


  async getResumes(): Promise<Resume[]> {
    const response = await fetch(`${API_URL}/api/resumes/`);
    return response.json();
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const response = await fetch(`${API_URL}/api/tags/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async createProject(data: Omit<Project, 'id' | 'status' | 'created_at'>): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/projects/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `更新失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  async deleteProject(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `删除失败: HTTP错误 ${response.status}`);
    }
  },

  async createRequirement(data: Omit<Requirement, 'id' | 'created_at' | 'tags'>): Promise<Requirement> {
    const response = await fetch(`${API_URL}/api/requirements/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async createInterview(data: InterviewCreate): Promise<Interview> {
    const response = await fetch(`${API_URL}/api/interviews/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async getInterviews(): Promise<Interview[]> {
    const response = await fetch(`${API_URL}/api/interviews/`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async updateInterview(id: string, data: Partial<Interview>): Promise<Interview> {
    const response = await fetch(`${API_URL}/api/interviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error(`Failed to update interview: ${response.status}`);
    return response.json();
  }
};
