/**
 * Configuración de la API del backend.
 * 
 * Este archivo centraliza todas las URLs y configuraciones
 * relacionadas con la comunicación con el servidor.
 */

// URL base del backend (ajustar según el entorno)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Endpoints principales
export const API_ENDPOINTS = {
  // Autenticación
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },

  // Estudiante
  STUDENT: {
    PLANS: '/v1/student/plans',
    PLAN_BY_ID: (id: number) => `/v1/student/plans/${id}`,
    SUBMIT_PLAN: (id: number) => `/v1/student/plans/${id}/submit`,
    CANCEL_PLAN: (id: number) => `/v1/student/plans/${id}/cancel`,
    TIME_ENTRIES: '/v1/student/time-entries',
    TIME_ENTRY_BY_ID: (id: number) => `/v1/student/time-entries/${id}`,
    EVIDENCES: '/v1/student/evidences',
    MY_ASSIGNMENT: '/v1/student/my-assignment',
  },

  // Tutor
  TUTOR: {
    STUDENTS: '/v1/tutor/students',
    STUDENT_DETAIL: (id: number) => `/v1/tutor/students/${id}`,
    STUDENT_PLANS: (id: number) => `/v1/tutor/plans/student/${id}`,
    STUDENT_TIME_ENTRIES: (id: number) => `/v1/tutor/time-entries/student/${id}`,
    STUDENT_EVIDENCES: (id: number) => `/v1/tutor/students/${id}/evidences`,
    DOWNLOAD_EVIDENCE: (id: number) => `/v1/tutor/evidences/${id}/download`,
    APPROVE_EVIDENCE: (id: number) => `/v1/tutor/evidences/${id}/approve`,
    REJECT_EVIDENCE: (id: number) => `/v1/tutor/evidences/${id}/reject`,
    STUDENT_EVALUATIONS: (id: number) => `/v1/tutor/students/${id}/evaluations`,
    PENDING_PLANS: '/v1/tutor/plans/pending',
    APPROVE_PLAN: (id: number) => `/v1/tutor/plans/${id}/approve`,
    REJECT_PLAN: (id: number) => `/v1/tutor/plans/${id}/reject`,
    PENDING_TIME_ENTRIES: '/v1/tutor/time-entries/pending',
    APPROVE_TIME_ENTRY: (id: number) => `/v1/tutor/time-entries/${id}/approve`,
    REJECT_TIME_ENTRY: (id: number) => `/v1/tutor/time-entries/${id}/reject`,
    BULK_APPROVE_TIME_ENTRIES: '/v1/tutor/time-entries/bulk-approve',
    EVALUATIONS: '/v1/tutor/evaluations',
    EVALUATION_BY_ID: (id: number) => `/v1/tutor/evaluations/${id}`,
    MY_STUDENTS: '/v1/tutor/my-students',
  },

  // Admin
  ADMIN: {
    STUDENTS: '/v1/admin/students',
    STUDENT_BY_ID: (id: number) => `/v1/admin/students/${id}`,
    TUTORS: '/v1/admin/tutors',
    TUTOR_BY_ID: (id: number) => `/v1/admin/tutors/${id}`,
    AVAILABLE_TUTORS: '/v1/admin/tutors/available',
    PERIODS: '/v1/admin/periods',
    PERIOD_BY_ID: (id: number) => `/v1/admin/periods/${id}`,
    OPEN_PERIOD: (id: number) => `/v1/admin/periods/${id}/open`,
    CLOSE_PERIOD: (id: number) => `/v1/admin/periods/${id}/close`,
    COMPANIES: '/v1/admin/companies',
    AGREEMENTS: '/v1/admin/agreements',
    ASSIGNMENTS: '/v1/admin/assignments',
    ASSIGNMENT_BY_ID: (id: number) => `/v1/admin/assignments/${id}`,
  },

  // Carreras (público - sin autenticación)
  CAREERS: {
    ALL: '/v1/careers',
    BY_ID: (id: number) => `/v1/careers/${id}`,
  },

  // Dashboard/Estadísticas
  DASHBOARD: {
    STUDENT_STATS: '/v1/student/dashboard/stats',
    TUTOR_STATS: '/v1/tutor/dashboard/stats',
    TUTOR_RECENT_ACTIVITIES: '/v1/tutor/dashboard/recent-activities',
    ADMIN_STATS: '/v1/admin/dashboard/stats',
  },
} as const;

// Configuración de timeouts
export const API_CONFIG = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// Keys para localStorage
export const STORAGE_KEYS = {
  JWT_TOKEN: 'ppps_jwt_token',
  REFRESH_TOKEN: 'ppps_refresh_token',
  USER_DATA: 'ppps_user_data',
} as const;
