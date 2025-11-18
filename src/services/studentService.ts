import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import {
  Plan,
  CreatePlanRequest,
  TimeEntry,
  CreateTimeEntryRequest,
  Evidence,
  Evaluation,
  StudentDashboardStats,
  StudentAssignment,
} from '../types/student';

// Types for public endpoints
interface PublicCompany {
  id: number;
  companyName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
  active: boolean;
}

interface PublicPeriod {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  open: boolean;
}

// ==================== PLANS ====================
export const getMyPlans = async (): Promise<Plan[]> => {
  const response = await apiClient.get<{ data: Plan[] }>(API_ENDPOINTS.STUDENT.PLANS);
  return response.data.data;
};

export const createPlan = async (data: CreatePlanRequest): Promise<Plan> => {
  const response = await apiClient.post<{ id: number; status: string; message: string }>(API_ENDPOINTS.STUDENT.PLANS, data);
  // After creating, fetch the plan to get full details
  const plansResponse = await apiClient.get<{ data: Plan[] }>(API_ENDPOINTS.STUDENT.PLANS);
  const createdPlan = plansResponse.data.data.find(p => p.id === response.data.id);
  if (!createdPlan) throw new Error('Plan creado pero no encontrado');
  return createdPlan;
};

export const updatePlan = async (id: number, data: CreatePlanRequest): Promise<Plan> => {
  await apiClient.put(`${API_ENDPOINTS.STUDENT.PLANS}/${id}`, data);
  // After updating, fetch the plan to get full details
  const plansResponse = await apiClient.get<{ data: Plan[] }>(API_ENDPOINTS.STUDENT.PLANS);
  const updatedPlan = plansResponse.data.data.find(p => p.id === id);
  if (!updatedPlan) throw new Error('Plan actualizado pero no encontrado');
  return updatedPlan;
};

export const submitPlan = async (id: number): Promise<void> => {
  await apiClient.put(`${API_ENDPOINTS.STUDENT.PLANS}/${id}/submit`);
};

export const cancelPlanSubmission = async (id: number): Promise<void> => {
  await apiClient.put(API_ENDPOINTS.STUDENT.CANCEL_PLAN(id));
};

export const deletePlan = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.STUDENT.PLANS}/${id}`);
};

// ==================== TIME ENTRIES ====================
export const getMyTimeEntries = async (): Promise<TimeEntry[]> => {
  const response = await apiClient.get<{ content: TimeEntry[]; totalElements: number; totalPages: number; currentPage: number }>(API_ENDPOINTS.STUDENT.TIME_ENTRIES);
  return response.data.content;
};

export const createTimeEntry = async (data: CreateTimeEntryRequest): Promise<TimeEntry> => {
  const response = await apiClient.post<{ id: number; hours: number; status: string; message: string }>(API_ENDPOINTS.STUDENT.TIME_ENTRIES, data);
  // Backend returns minimal response, fetch the full list to get the created entry
  const entriesResponse = await apiClient.get<{ content: TimeEntry[] }>(API_ENDPOINTS.STUDENT.TIME_ENTRIES);
  const createdEntry = entriesResponse.data.content.find(e => e.id === response.data.id);
  if (!createdEntry) throw new Error('Registro creado pero no encontrado');
  return createdEntry;
};

export const updateTimeEntry = async (id: number, data: CreateTimeEntryRequest): Promise<TimeEntry> => {
  const response = await apiClient.put<{ id: number; hours: number; status: string; message: string }>(`${API_ENDPOINTS.STUDENT.TIME_ENTRIES}/${id}`, data);
  // Backend returns minimal response, fetch the full list to get the updated entry
  const entriesResponse = await apiClient.get<{ content: TimeEntry[] }>(API_ENDPOINTS.STUDENT.TIME_ENTRIES);
  const updatedEntry = entriesResponse.data.content.find(e => e.id === id);
  if (!updatedEntry) throw new Error('Registro actualizado pero no encontrado');
  return updatedEntry;
};

export const deleteTimeEntry = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.STUDENT.TIME_ENTRIES}/${id}`);
};

// ==================== EVIDENCES ====================
export const getMyEvidences = async (): Promise<Evidence[]> => {
  const response = await apiClient.get<{ data: Evidence[] }>(API_ENDPOINTS.STUDENT.EVIDENCES);
  return response.data.data;
};

export const uploadEvidence = async (file: File, description: string, planId?: number): Promise<Evidence> => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }
  if (planId) {
    formData.append('planId', planId.toString());
  }

  const response = await apiClient.post<{ id: number; filename: string; originalFilename: string; fileSize: number; status: string; message: string }>(`${API_ENDPOINTS.STUDENT.EVIDENCES}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Fetch updated list to get full evidence details
  const evidencesResponse = await apiClient.get<{ data: Evidence[] }>(API_ENDPOINTS.STUDENT.EVIDENCES);
  const uploadedEvidence = evidencesResponse.data.data.find(e => e.id === response.data.id);
  if (!uploadedEvidence) throw new Error('Evidencia subida pero no encontrada');
  return uploadedEvidence;
};

export const downloadEvidence = async (id: number): Promise<Blob> => {
  const response = await apiClient.get<Blob>(`${API_ENDPOINTS.STUDENT.EVIDENCES}/${id}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deleteEvidence = async (id: number): Promise<void> => {
  await apiClient.delete(`${API_ENDPOINTS.STUDENT.EVIDENCES}/${id}`);
};

// ==================== EVALUATIONS ====================
export const getMyEvaluations = async (): Promise<{ data: Evaluation[]; averageScore: number; totalEvaluations: number }> => {
  const response = await apiClient.get<{ data: Evaluation[]; averageScore: number; totalEvaluations: number }>('/v1/student/evaluations');
  return response.data;
};

// ==================== DASHBOARD ====================
export const getDashboardStats = async (): Promise<StudentDashboardStats> => {
  const response = await apiClient.get<StudentDashboardStats>('/v1/student/dashboard/stats');
  return response.data;
};

// ==================== TUTOR INFO ====================
export const getMyTutor = async (): Promise<StudentAssignment> => {
  const response = await apiClient.get<{ data: StudentAssignment }>('/v1/student/my-tutor');
  return response.data.data; // Backend envuelve en { data: {...} }
};

// ==================== PUBLIC ENDPOINTS (No Auth Required) ====================
export const getActiveCompanies = async (): Promise<PublicCompany[]> => {
  const response = await apiClient.get<any>('/v1/companies/active');
  // Backend may return several shapes:
  // 1) { data: { content: [ ... ], ... } }
  // 2) { data: [ ... ] }
  // 3) [ ... ]
  if (Array.isArray(response.data?.data?.content)) {
    return response.data.data.content as PublicCompany[];
  }
  if (Array.isArray(response.data?.data)) {
    return response.data.data as PublicCompany[];
  }
  if (Array.isArray(response.data)) {
    return response.data as PublicCompany[];
  }
  return [];
};

export const getActivePeriods = async (): Promise<PublicPeriod[]> => {
  const response = await apiClient.get<any>('/v1/periods/active');
  // Backend may return { data: [...] } or [...]
  if (Array.isArray(response.data?.data)) {
    return response.data.data as PublicPeriod[];
  }
  if (Array.isArray(response.data)) {
    return response.data as PublicPeriod[];
  }
  return [];
};
