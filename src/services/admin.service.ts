/**
 * Servicio de Administración.
 * 
 * Maneja las operaciones CRUD de admin para estudiantes, tutores, 
 * empresas, períodos, asignaciones y convenios.
 */

import apiClient, { getErrorMessage } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import type { StudentProfile, TutorProfile, Company, Period, Assignment, Agreement, Career } from '../types';

// ============================================================================
// TIPOS PARA PETICIONES
// ============================================================================

export interface CreateStudentRequest {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  code: string;
  careerId: number;
  semester: number;
  phone?: string;
  companyId?: number;
  tutorId?: number;
  periodId?: number;
}

export interface UpdateStudentRequest {
  code: string;
  careerId: number;
  semester: number;
  phone?: string;
  companyId?: number;
  tutorId?: number;
  periodId?: number;
}

export interface CreateTutorRequest {
  username: string;
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  specialty: string;
  maxStudents: number;
  careerId?: number;
}

export interface UpdateTutorRequest {
  specialty: string;
  maxStudents: number;
  careerId?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface CreateCompanyRequest {
  companyName: string;
  ruc: string;
  address: string;
  phone: string;
  email: string;
  contactPerson: string;
}

export interface CreatePeriodRequest {
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  open: boolean;
}

export interface CreateAssignmentRequest {
  studentId: number;
  tutorId: number;
  periodId?: number; // Opcional - backend usa periodo activo si no se proporciona
}

export interface CreateAgreementRequest {
  agreementNumber: string;
  companyId: number;
  description: string;
  startDate: string;
  endDate: string;
  documentUrl?: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ============================================================================
// SERVICIO DE ADMINISTRACIÓN
// ============================================================================

class AdminService {
  // ==========================================================================
  // ESTUDIANTES
  // ==========================================================================

  async getAllStudents(page: number = 0, size: number = 20, search?: string): Promise<PageResponse<StudentProfile>> {
    try {
      const params: any = { page, size };
      if (search) params.search = search;

      const response = await apiClient.get<PageResponse<StudentProfile>>(
        API_ENDPOINTS.ADMIN.STUDENTS,
        { params }
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getStudentById(id: number): Promise<StudentProfile> {
    try {
      const response = await apiClient.get<StudentProfile>(
        API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id)
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createStudent(data: CreateStudentRequest): Promise<StudentProfile> {
    try {
      const response = await apiClient.post<StudentProfile>(
        API_ENDPOINTS.ADMIN.STUDENTS,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updateStudent(id: number, data: UpdateStudentRequest): Promise<StudentProfile> {
    try {
      const response = await apiClient.put<StudentProfile>(
        API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id),
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteStudent(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async activateStudent(id: number): Promise<void> {
    try {
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.STUDENT_BY_ID(id)}/activate`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // TUTORES
  // ==========================================================================

  async getAllTutors(): Promise<TutorProfile[]> {
    try {
      const response = await apiClient.get<TutorProfile[]>(
        API_ENDPOINTS.ADMIN.TUTORS
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getAvailableTutors(): Promise<TutorProfile[]> {
    try {
      const response = await apiClient.get<TutorProfile[]>(
        API_ENDPOINTS.ADMIN.AVAILABLE_TUTORS
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getTutorById(id: number): Promise<TutorProfile> {
    try {
      const response = await apiClient.get<TutorProfile>(
        API_ENDPOINTS.ADMIN.TUTOR_BY_ID(id)
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createTutor(data: CreateTutorRequest): Promise<TutorProfile> {
    try {
      const response = await apiClient.post<TutorProfile>(
        API_ENDPOINTS.ADMIN.TUTORS,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updateTutor(id: number, data: UpdateTutorRequest): Promise<TutorProfile> {
    try {
      const response = await apiClient.put<TutorProfile>(
        API_ENDPOINTS.ADMIN.TUTOR_BY_ID(id),
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteTutor(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.TUTOR_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async activateTutor(id: number): Promise<void> {
    try {
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.TUTOR_BY_ID(id)}/activate`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // EMPRESAS
  // ==========================================================================

  async getAllCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get<Company[]>(
        API_ENDPOINTS.ADMIN.COMPANIES
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getActiveCompanies(): Promise<Company[]> {
    try {
      const response = await apiClient.get<Company[]>(
        `${API_ENDPOINTS.ADMIN.COMPANIES}/active`
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createCompany(data: CreateCompanyRequest): Promise<Company> {
    try {
      const response = await apiClient.post<Company>(
        API_ENDPOINTS.ADMIN.COMPANIES,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updateCompany(id: number, data: CreateCompanyRequest): Promise<Company> {
    try {
      const response = await apiClient.put<Company>(
        `${API_ENDPOINTS.ADMIN.COMPANIES}/${id}`,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteCompany(id: number): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.COMPANIES}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async activateCompany(id: number): Promise<void> {
    try {
      await apiClient.patch(`${API_ENDPOINTS.ADMIN.COMPANIES}/${id}/activate`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // CONVENIOS (AGREEMENTS)
  // ==========================================================================

  async createAgreement(data: {
    companyId: number;
    agreementNumber: string;
    startDate: string;
    endDate: string;
    terms?: string;
  }): Promise<Agreement> {
    try {
      const response = await apiClient.post<Agreement>(
        API_ENDPOINTS.ADMIN.AGREEMENTS,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updateAgreement(id: number, data: {
    agreementNumber?: string;
    startDate?: string;
    endDate?: string;
    terms?: string;
  }): Promise<Agreement> {
    try {
      const response = await apiClient.put<Agreement>(
        `${API_ENDPOINTS.ADMIN.AGREEMENTS}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteAgreement(id: number): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN.AGREEMENTS}/${id}`);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // PERÍODOS
  // ==========================================================================

  async getAllPeriods(): Promise<Period[]> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.ADMIN.PERIODS
      );

      return response.data.data || response.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getOpenPeriods(): Promise<Period[]> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.ADMIN.PERIODS}/open`
      );

      return response.data.data || response.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getCurrentPeriod(): Promise<Period> {
    try {
      const response = await apiClient.get<any>(
        `${API_ENDPOINTS.ADMIN.PERIODS}/current`
      );

      return response.data.data || response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createPeriod(data: CreatePeriodRequest): Promise<Period> {
    try {
      const response = await apiClient.post<Period>(
        API_ENDPOINTS.ADMIN.PERIODS,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async updatePeriod(id: number, data: CreatePeriodRequest): Promise<Period> {
    try {
      const response = await apiClient.put<Period>(
        API_ENDPOINTS.ADMIN.PERIOD_BY_ID(id),
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async openPeriod(id: number): Promise<Period> {
    try {
      const response = await apiClient.put<Period>(
        API_ENDPOINTS.ADMIN.OPEN_PERIOD(id)
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async closePeriod(id: number): Promise<Period> {
    try {
      const response = await apiClient.put<Period>(
        API_ENDPOINTS.ADMIN.CLOSE_PERIOD(id)
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deletePeriod(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.PERIOD_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // ASIGNACIONES
  // ==========================================================================

  async getAllAssignments(): Promise<Assignment[]> {
    try {
      const response = await apiClient.get<Assignment[]>(
        API_ENDPOINTS.ADMIN.ASSIGNMENTS
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getAssignmentsByPeriod(periodId: number): Promise<Assignment[]> {
    try {
      const response = await apiClient.get<Assignment[]>(
        `${API_ENDPOINTS.ADMIN.ASSIGNMENTS}/period/${periodId}`
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async createAssignment(data: CreateAssignmentRequest): Promise<Assignment> {
    try {
      const response = await apiClient.post<Assignment>(
        API_ENDPOINTS.ADMIN.ASSIGNMENTS,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async deleteAssignment(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN.ASSIGNMENT_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // CARRERAS
  // ==========================================================================

  async getAllCareers(): Promise<Career[]> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CAREERS.ALL
      );

      // Unwrap the response
      if (response.data?.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getCareerById(id: number): Promise<Career> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CAREERS.BY_ID(id)
      );

      // Unwrap the response
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // DASHBOARD STATS
  // ==========================================================================

  async getDashboardStats(): Promise<any> {
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.DASHBOARD.ADMIN_STATS
      );

      // Unwrap the response
      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getPlansByMonth(months: number = 6): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.REPORTS.ADMIN_REPORTS}/plans-by-month?months=${months}`
      );

      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getHoursByWeek(weeks: number = 6): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.REPORTS.ADMIN_REPORTS}/hours-by-week?weeks=${weeks}`
      );

      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  async getStudentsByCompany(): Promise<any[]> {
    try {
      const response = await apiClient.get(
        `${API_ENDPOINTS.REPORTS.ADMIN_REPORTS}/students-by-company`
      );

      if (response.data?.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

// Exportar instancia única (Singleton)
export default new AdminService();

