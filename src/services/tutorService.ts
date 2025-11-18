import apiClient from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import { 
  TutorDashboardStats, 
  AssignedStudent, 
  StudentDetailData,
  TimeEntryForReview,
  PlanForReview,
  EvaluationFormData,
  Evaluation,
  RecentActivity
} from '../types/tutor';

// ============================================================================
// DASHBOARD
// ============================================================================

export const getTutorDashboardStats = async (): Promise<TutorDashboardStats> => {
  const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.TUTOR_STATS);
  return data;
};

export const getTutorRecentActivities = async (limit: number = 5): Promise<RecentActivity[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.DASHBOARD.TUTOR_RECENT_ACTIVITIES, {
    params: { limit }
  });
  return data;
};

// ============================================================================
// ESTUDIANTES ASIGNADOS
// ============================================================================

export const getMyAssignedStudents = async (): Promise<AssignedStudent[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.STUDENTS);
  return data;
};

export const getStudentDetail = async (studentId: number): Promise<StudentDetailData> => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.STUDENT_DETAIL(studentId));
  return data;
};

// ============================================================================
// PLANES
// ============================================================================

export const getPendingPlans = async (): Promise<PlanForReview[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.PENDING_PLANS);
  return data;
};

export const getStudentPlans = async (studentId: number) => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.STUDENT_PLANS(studentId));
  return data;
};

export const approvePlan = async (planId: number, comments?: string) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.APPROVE_PLAN(planId), { comments });
  return data;
};

export const rejectPlan = async (planId: number, reason: string) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.REJECT_PLAN(planId), { reason });
  return data;
};

// ============================================================================
// HORAS
// ============================================================================

export const getPendingTimeEntries = async (): Promise<TimeEntryForReview[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.PENDING_TIME_ENTRIES);
  return data;
};

export const getStudentTimeEntries = async (studentId: number) => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.STUDENT_TIME_ENTRIES(studentId));
  return data;
};

export const approveTimeEntry = async (entryId: number, comments?: string) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.APPROVE_TIME_ENTRY(entryId), { comments });
  return data;
};

export const rejectTimeEntry = async (entryId: number, reason: string) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.REJECT_TIME_ENTRY(entryId), { reason });
  return data;
};

export const bulkApproveTimeEntries = async (entryIds: number[]) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.BULK_APPROVE_TIME_ENTRIES, { entryIds });
  return data;
};

// ============================================================================
// EVIDENCIAS
// ============================================================================

export const getStudentEvidences = async (studentId: number) => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.STUDENT_EVIDENCES(studentId));
  return data;
};

export const downloadEvidence = async (evidenceId: number) => {
  const response = await apiClient.get(API_ENDPOINTS.TUTOR.DOWNLOAD_EVIDENCE(evidenceId), {
    responseType: 'blob'
  });
  return response.data;
};

export const approveEvidence = async (evidenceId: number) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.APPROVE_EVIDENCE(evidenceId));
  return data;
};

export const rejectEvidence = async (evidenceId: number, reason: string) => {
  const { data } = await apiClient.put(API_ENDPOINTS.TUTOR.REJECT_EVIDENCE(evidenceId), { reason });
  return data;
};

// ============================================================================
// EVALUACIONES
// ============================================================================

export const getMyEvaluations = async (): Promise<Evaluation[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.EVALUATIONS);
  return Array.isArray(data) ? data : (data?.data || []);
};

export const getStudentEvaluations = async (studentId: number): Promise<Evaluation[]> => {
  const { data } = await apiClient.get(API_ENDPOINTS.TUTOR.STUDENT_EVALUATIONS(studentId));
  return Array.isArray(data) ? data : (data?.data || []);
};

export const createEvaluation = async (evaluationData: EvaluationFormData): Promise<Evaluation> => {
  const { data } = await apiClient.post(API_ENDPOINTS.TUTOR.EVALUATIONS, evaluationData);
  return data;
};

export const deleteEvaluation = async (evaluationId: number): Promise<void> => {
  await apiClient.delete(API_ENDPOINTS.TUTOR.EVALUATION_BY_ID(evaluationId));
};
