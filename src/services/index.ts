/**
 * Exportación centralizada de todos los servicios.
 * 
 * Permite importar servicios desde un solo lugar:
 * import { authService, planService, ... } from '@/services'
 */

export { default as authService } from './auth.service';
export { default as planService } from './plan.service';
export { default as timeEntryService } from './timeEntry.service';
export { default as adminService } from './admin.service';
export { default as evaluationService } from './evaluation.service';

// Re-exportar tipos de servicios
export type { CreateTimeEntryRequest, TimeEntryListResponse, RejectTimeEntryRequest } from './timeEntry.service';
export type { 
  CreateStudentRequest, 
  UpdateStudentRequest, 
  CreateTutorRequest, 
  UpdateTutorRequest,
  CreateCompanyRequest,
  CreatePeriodRequest,
  CreateAssignmentRequest,
  CreateAgreementRequest,
  PageResponse
} from './admin.service';
export type { CreateEvaluationRequest } from './evaluation.service';
