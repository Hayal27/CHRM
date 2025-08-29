import axios from 'axios';

// Update API base URL to match your backend server
const API_BASE = 'http://localhost:5001/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface JobVacancy {
  id?: number;
  title: string;
  department: string;
  description: string;
  requirements?: string;
  responsibilities?: string;
  salary_range?: string;
  location?: string;
  employment_type?: string;
  experience_level?: string;
  education_required?: string;
  skills_required?: string;
  deadline?: string;
  status?: string;
}

export interface JobApplication {
  vacancy_id: number;
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  cover_letter?: string;
  expected_salary?: number;
  availability_date?: string;
}

export interface Interview {
  application_id: number;
  interview_date: string;
  interview_time: string;
  interview_type: string;
  location?: string;
  interviewer_id?: number;
  notes?: string;
}

export interface InterviewEvaluation {
  technical_skills?: number;
  communication_skills?: number;
  problem_solving?: number;
  cultural_fit?: number;
  overall_rating: number;
  strengths?: string;
  weaknesses?: string;
  recommendation: string;
  notes?: string;
}

export interface OfferLetter {
  position: string;
  department: string;
  salary: number;
  start_date: string;
  benefits?: string;
  terms_conditions?: string;
  offer_expiry_date?: string;
}

export interface HiringDecision {
  decision: string;
  employment_start_date: string;
  salary_confirmed?: number;
  department?: string;
  position?: string;
  notes?: string;
}

export interface RecruitmentParams { [key: string]: any; }
export interface VacancyData { [key: string]: any; }
export interface ApplicationData { [key: string]: any; }
export interface InterviewData { [key: string]: any; }
export interface EvaluationData { [key: string]: any; }
export interface OfferData { [key: string]: any; }
export interface DecisionData { [key: string]: any; }

export const recruitmentService = {
  // Job Vacancies
  getVacancies: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/vacancies`, { params, headers: getAuthHeaders() }),
  createVacancy: (data: VacancyData): Promise<any> => axios.post(`${API_BASE}/vacancies`, data, { headers: getAuthHeaders() }),
  updateVacancy: (id: number, data: VacancyData): Promise<any> => axios.put(`${API_BASE}/vacancies/${id}`, data, { headers: getAuthHeaders() }),

  // Applications
  getApplications: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/applications`, { params, headers: getAuthHeaders() }),
  submitApplication: (data: ApplicationData): Promise<any> => axios.post(`${API_BASE}/applications`, data, { headers: getAuthHeaders() }),
  uploadCV: (applicationId: number, file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('cv', file);
    return axios.post(`${API_BASE}/applications/${applicationId}/cv`, formData, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
  },

  // Interviews
  getInterviews: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/interviews`, { params, headers: getAuthHeaders() }),
  scheduleInterview: (data: InterviewData): Promise<any> => axios.post(`${API_BASE}/interviews`, data, { headers: getAuthHeaders() }),

  // Evaluations
  getEvaluations: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/evaluations`, { params, headers: getAuthHeaders() }),
  submitEvaluation: (interviewId: number, data: EvaluationData): Promise<any> => axios.post(`${API_BASE}/interviews/${interviewId}/evaluation`, data, { headers: getAuthHeaders() }),

  // Offers
  getOffers: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/offers`, { params, headers: getAuthHeaders() }),
  generateOffer: (applicationId: number, data: OfferData): Promise<any> => axios.post(`${API_BASE}/applications/${applicationId}/offer`, data, { headers: getAuthHeaders() }),

  // Hiring Decisions
  getDecisions: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/decisions`, { params, headers: getAuthHeaders() }),
  makeDecision: (applicationId: number, data: DecisionData): Promise<any> => axios.post(`${API_BASE}/applications/${applicationId}/decision`, data, { headers: getAuthHeaders() }),

  // Analytics
  getAnalytics: (params: RecruitmentParams): Promise<any> => axios.get(`${API_BASE}/analytics`, { params, headers: getAuthHeaders() }),

  // Utility functions
  downloadCV: async (cvPath: string) => {
    const response = await axios.get(`${API_BASE}/uploads/cv/${cvPath}`, {
      responseType: 'blob',
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Get available interviewers (mock data for now)
  getInterviewers: async () => {
    // This would typically fetch from an API
    return [
      { id: 1, name: 'John Doe', department: 'Engineering' },
      { id: 2, name: 'Jane Smith', department: 'Marketing' },
      { id: 3, name: 'Mike Johnson', department: 'Sales' },
      { id: 4, name: 'Sarah Wilson', department: 'HR' },
    ];
  },

  // Get departments
  getDepartments: async () => {
    return [
      'Engineering',
      'Marketing',
      'Sales',
      'HR',
      'Finance',
      'Operations',
      'Customer Support',
      'Product Management'
    ];
  },

  // Get employment types
  getEmploymentTypes: async () => {
    return [
      { value: 'full_time', label: 'Full Time' },
      { value: 'part_time', label: 'Part Time' },
      { value: 'contract', label: 'Contract' },
      { value: 'internship', label: 'Internship' }
    ];
  },

  // Get experience levels
  getExperienceLevels: async () => {
    return [
      { value: 'entry', label: 'Entry Level' },
      { value: 'mid', label: 'Mid Level' },
      { value: 'senior', label: 'Senior Level' },
      { value: 'executive', label: 'Executive Level' }
    ];
  },

  // Get interview types
  getInterviewTypes: async () => {
    return [
      { value: 'phone', label: 'Phone' },
      { value: 'video', label: 'Video' },
      { value: 'in_person', label: 'In Person' },
      { value: 'technical', label: 'Technical' },
      { value: 'panel', label: 'Panel' }
    ];
  },

  // Get application statuses
  getApplicationStatuses: async () => {
    return [
      { value: 'pending', label: 'Pending' },
      { value: 'reviewed', label: 'Reviewed' },
      { value: 'shortlisted', label: 'Shortlisted' },
      { value: 'interview_scheduled', label: 'Interview Scheduled' },
      { value: 'interviewed', label: 'Interviewed' },
      { value: 'offer_sent', label: 'Offer Sent' },
      { value: 'hired', label: 'Hired' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'on_hold', label: 'On Hold' }
    ];
  },

  // Get hiring decision options
  getHiringDecisionOptions: async () => {
    return [
      { value: 'hired', label: 'Hired' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'on_hold', label: 'On Hold' }
    ];
  },

  // Get recommendations
  getRecommendations: async () => {
    return [
      { value: 'hire', label: 'Hire' },
      { value: 'do_not_hire', label: 'Do Not Hire' },
      { value: 'consider', label: 'Consider' },
      { value: 'strong_hire', label: 'Strong Hire' }
    ];
  }
};

export default recruitmentService;