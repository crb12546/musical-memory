const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  state: 'available' | 'interviewing' | 'hired';
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
  async uploadResume(
    file: File, 
    candidateId: string, 
    onProgress?: (progress: number) => void
  ): Promise<Resume> {
    // Validate file size (10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('文件大小超过限制（最大10MB）');
    }

    // Validate file type
    const validTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain' // Allow text files for testing
    ];
    if (!validTypes.includes(file.type)) {
      throw new Error('文件类型不支持：请上传 PDF 或 Word 文档（.pdf, .doc, .docx）');
    }

    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('candidate_id', candidateId);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/resumes/`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch {
            reject(new Error('服务器响应格式错误'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            if (xhr.status === 404) {
              reject(new Error('候选人不存在：请确认候选人信息已正确录入系统'));
            } else {
              reject(new Error(error.detail || `上传失败：服务器返回错误 ${xhr.status}，请稍后重试或联系技术支持`));
            }
          } catch {
            reject(new Error('上传失败：请稍后重试或联系技术支持'));
          }
        }
      };

      xhr.onerror = () => reject(new Error('网络错误，请稍后重试'));
      xhr.send(formData);
    });
  },

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
