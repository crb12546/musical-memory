const API_URL = import.meta.env.VITE_API_URL || 'https://musical-memory-api-v1.fly.dev';

const defaultHeaders: Record<string, string> = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'Origin': window.location.origin
};

export type OnSuccessCallback<T> = (value: T[]) => void | Promise<void>;

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
  parsed_content: any | null;
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
  parsed_content?: any;
  created_at: string;
  updated_at?: string;
}

export type InterviewCreate = Omit<Interview, 'id' | 'created_at' | 'updated_at'>

export const api = {
  // Candidates
  async createCandidate(data: Omit<Candidate, 'id' | 'created_at'>) {
    const response = await fetch(`${API_URL}/api/candidates/`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async getCandidates(): Promise<Candidate[]> {
    const response = await fetch(`${API_URL}/api/candidates/`, {
      headers: defaultHeaders
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `获取候选人失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  // Resumes
  async uploadResume(file: File, candidateId: string): Promise<Resume> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('candidate_id', candidateId);

    const headers: HeadersInit = {
      'Accept': 'application/json',
      'Origin': window.location.origin,
      'X-Requested-With': 'XMLHttpRequest'
    };

    const response = await fetch(`${API_URL}/api/resumes/`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `上传简历失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  async getResumes(): Promise<Resume[]> {
    const response = await fetch(`${API_URL}/api/resumes/`, {
      headers: defaultHeaders
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `获取简历失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  // Tags
  async getTags(): Promise<Tag[]> {
    const response = await fetch(`${API_URL}/api/tags/`, {
      headers: defaultHeaders
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async createProject(data: Omit<Project, 'id' | 'status' | 'created_at'>): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },
  
  async getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/projects/`, {
      headers: defaultHeaders
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
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
      headers: defaultHeaders
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `删除失败: HTTP错误 ${response.status}`);
    }
  },

  async createRequirement(data: Omit<Requirement, 'id' | 'created_at' | 'tags'>): Promise<Requirement> {
    const response = await fetch(`${API_URL}/api/requirements/`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `创建需求失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  async createInterview(data: InterviewCreate): Promise<Interview> {
    const response = await fetch(`${API_URL}/api/interviews/`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `创建面试失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  async getInterviews(): Promise<Interview[]> {
    const response = await fetch(`${API_URL}/api/interviews/`, {
      headers: defaultHeaders
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `获取面试列表失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  },

  async updateInterview(id: string, data: Partial<Interview>): Promise<Interview> {
    const response = await fetch(`${API_URL}/api/interviews/${id}`, {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || `更新面试失败: HTTP错误 ${response.status}`);
    }
    return response.json();
  }
};
