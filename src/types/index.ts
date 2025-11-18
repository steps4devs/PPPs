/**
 * Tipos base y comunes del sistema.
 * 
 * Estos tipos representan las estructuras de datos que vienen del backend.
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  ADMIN = 'ROLE_ADMIN',
  STUDENT = 'ROLE_STUDENT',
  TUTOR = 'ROLE_TUTOR',
}

export enum PlanStatus {
  DRAFT = 'DRAFT',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum TimeEntryStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum EvaluationType {
  PARTIAL = 'PARTIAL',
  FINAL = 'FINAL',
}

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  type: string; // "Bearer"
  id: number; // usuarios.id (NO profileId)
  username: string;
  email: string;
  nombre: string; // Nombre del backend
  apellido: string; // Apellido del backend
  roles: string[]; // Array de roles del backend
}

export interface JwtPayload {
  sub: string; // username
  userId: number; // usuarios.id
  role: UserRole;
  exp: number;
  iat: number;
}

// ============================================================================
// USUARIO Y PERFILES
// ============================================================================

export interface User {
  id: number; // usuarios.id
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  active: boolean;
}

export interface Career {
  id: number; // careers.id
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfile {
  id: number; // student_profiles.id
  userId: number; // usuarios.id
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  fullName: string;
  code: string;
  phone?: string;
  careerId?: number;
  careerName?: string;
  semester: number;
  tutorId?: number;
  tutorName?: string;
  companyId?: number;
  companyName?: string;
  periodId?: number;
  periodName?: string;
  assignmentId?: number; // ID de la asignación activa
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TutorProfile {
  id: number; // tutor_profiles.id
  userId: number; // usuarios.id
  username: string;
  email: string;
  nombre: string;
  apellido: string;
  fullName: string;
  specialty: string;
  maxStudents?: number;
  activeStudents?: number;
  careerId?: number;
  careerName?: string;
  activo?: boolean;
  students?: Array<{
    id: number;
    code: string;
    username: string;
    fullName: string;
    career: string;
    semester: number;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// PLAN DE PRÁCTICAS
// ============================================================================

export interface PlanRequest {
  companyId: number;
  periodId: number;
  objectives: string;
  activities: string;
  startDate: string; // ISO 8601 format
  endDate: string;
}

export interface PlanResponse {
  id: number;
  studentId: number; // student_profiles.id
  studentName: string;
  studentCode: string;
  companyId: number;
  companyName: string;
  periodId: number;
  periodName: string;
  objectives: string;
  activities: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  rejectionReason?: string;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REGISTRO DE HORAS
// ============================================================================

export interface TimeEntryRequest {
  entryDate: string; // ISO 8601 format
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  activity: string;
}

export interface TimeEntryResponse {
  id: number;
  studentId: number; // student_profiles.id
  studentName: string;
  planId: number;
  entryDate: string;
  startTime: string;
  endTime: string;
  hours: number; // Decimal calculado automáticamente
  activity: string;
  status: TimeEntryStatus;
  rejectionReason?: string;
  reviewedBy?: number; // tutor_profiles.id
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ASIGNACIONES
// ============================================================================

export interface AssignmentRequest {
  tutorId: number; // tutor_profiles.id
  studentId: number; // student_profiles.id
  periodId: number;
}

export interface AssignmentResponse {
  id: number;
  tutorId: number;
  tutorName: string;
  studentId: number;
  studentName: string;
  studentCode: string;
  periodId: number;
  periodName: string;
  assignedAt: string;
  active: boolean;
}

// ============================================================================
// PERIODOS ACADÉMICOS
// ============================================================================

export interface PeriodRequest {
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  open: boolean;
}

export interface PeriodResponse {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  enrolled: number;
  open: boolean;
  availableQuota?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// EMPRESAS
// ============================================================================

// ============================================================================
// EMPRESAS Y CONVENIOS
// ============================================================================

export interface AgreementBasic {
  id: number;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  active: boolean;
  status: 'vigente' | 'por_vencer' | 'vencido'; // Estado calculado del convenio
}

export interface CompanyProfile {
  id: number;
  companyName: string;
  ruc: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  active: boolean;
  agreements?: AgreementBasic[]; // Lista de convenios de la empresa
}

export interface CompanyRequest {
  companyName: string;
  ruc: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export interface CompanyResponse {
  id: number;
  name: string;
  ruc: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EVIDENCIAS
// ============================================================================

export interface EvidenceRequest {
  planId: number;
  title: string;
  description: string;
  fileUrl: string; // URL del archivo subido
  fileType: string; // image, document, video
}

export interface EvidenceResponse {
  id: number;
  planId: number;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

// ============================================================================
// EVALUACIONES
// ============================================================================

export interface Evaluation {
  id: number;
  studentId: number;
  studentName: string;
  tutorId: number;
  tutorName: string;
  planId: number;
  type: EvaluationType;
  punctuality: number;
  teamwork: number;
  technicalKnowledge: number;
  initiative: number;
  averageScore: number;
  comments?: string;
  evaluationDate: string;
}

// ============================================================================
// CONVENIOS
// ============================================================================

export interface Agreement {
  id: number;
  agreementNumber: string;
  companyId: number;
  companyName: string;
  description: string;
  startDate: string;
  endDate: string;
  documentUrl?: string;
  active: boolean;
}

// ============================================================================
// PAGINACIÓN Y RESPUESTAS GENÉRICAS
// ============================================================================

export interface PageRequest {
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

// ============================================================================
// DASHBOARD/ESTADÍSTICAS
// ============================================================================

export interface StudentStats {
  totalPlans: number;
  plansInDraft: number;
  plansInReview: number;
  plansApproved: number;
  plansRejected: number;
  totalHours: number;
  approvedHours: number;
  pendingHours: number;
  currentPlanId?: number;
}

export interface TutorStats {
  totalStudents: number;
  pendingPlans: number;
  pendingTimeEntries: number;
  totalApprovedPlans: number;
  totalApprovedHours: number;
}

export interface AdminDashboardStats {
  overview: {
    students: number;
    tutors: number;
    companies: number;
    periods: number;
  };
  plans: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  assignments: {
    active: number;
  };
  agreements: {
    active: number;
  };
  hours: {
    totalApproved: number;
  };
  currentPeriod: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    open: boolean;
    quota: number;
  } | null;
}

export interface AdminStats {
  totalStudents: number;
  totalTutors: number;
  totalCompanies: number;
  activePeriods: number;
  totalPlans: number;
  plansInReview: number;
  totalHours: number;
  pendingTimeEntries: number;
}

// ============================================================================
// ALIAS PARA COMPATIBILIDAD
// ============================================================================

export type Company = CompanyProfile;
export type Period = PeriodResponse;
export type Assignment = AssignmentResponse;
