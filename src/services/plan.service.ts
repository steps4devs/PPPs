/**
 * Servicio de Planes de Práctica.
 * 
 * Maneja todas las operaciones CRUD de planes tanto para estudiantes como tutores.
 */

import apiClient, { getErrorMessage } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import type { PlanRequest, PlanResponse, PageResponse } from '../types';

// ============================================================================
// SERVICIO DE PLANES
// ============================================================================

class PlanService {
  // ==========================================================================
  // ESTUDIANTE - Gestión de planes
  // ==========================================================================

  /**
   * Obtiene todos los planes del estudiante autenticado.
   */
  async getMyPlans(): Promise<PlanResponse[]> {
    try {
      const response = await apiClient.get<{ data: PlanResponse[] }>(
        API_ENDPOINTS.STUDENT.PLANS
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Obtiene un plan específico por ID.
   */
  async getPlanById(id: number): Promise<PlanResponse> {
    try {
      const response = await apiClient.get<{ data: PlanResponse }>(
        API_ENDPOINTS.STUDENT.PLAN_BY_ID(id)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Crea un nuevo plan de práctica (estado DRAFT).
   */
  async createPlan(data: PlanRequest): Promise<PlanResponse> {
    try {
      const response = await apiClient.post<{ data: PlanResponse }>(
        API_ENDPOINTS.STUDENT.PLANS,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Actualiza un plan existente (solo si está en DRAFT).
   */
  async updatePlan(id: number, data: PlanRequest): Promise<PlanResponse> {
    try {
      const response = await apiClient.put<{ data: PlanResponse }>(
        API_ENDPOINTS.STUDENT.PLAN_BY_ID(id),
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Envía un plan a revisión (DRAFT → IN_REVIEW).
   */
  async submitPlan(id: number): Promise<PlanResponse> {
    try {
      const response = await apiClient.put<{ data: PlanResponse }>(
        API_ENDPOINTS.STUDENT.SUBMIT_PLAN(id)
      );
      return response.data.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Elimina un plan (solo si está en DRAFT).
   */
  async deletePlan(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.STUDENT.PLAN_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // TUTOR - Revisión de planes
  // ==========================================================================

  /**
   * Obtiene los planes pendientes de revisión del tutor.
   */
  async getPendingPlans(): Promise<PlanResponse[]> {
    try {
      const response = await apiClient.get<{ data: PlanResponse[] }>(
        API_ENDPOINTS.TUTOR.PENDING_PLANS
      );
      return response.data.data || [];
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Aprueba un plan (IN_REVIEW → APPROVED).
   */
  async approvePlan(id: number): Promise<PlanResponse> {
    try {
      const response = await apiClient.put<PlanResponse>(
        API_ENDPOINTS.TUTOR.APPROVE_PLAN(id)
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Rechaza un plan con un motivo (IN_REVIEW → REJECTED).
   */
  async rejectPlan(id: number, reason: string): Promise<PlanResponse> {
    try {
      const response = await apiClient.put<PlanResponse>(
        API_ENDPOINTS.TUTOR.REJECT_PLAN(id),
        { reason }
      );
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }
}

// Exportar instancia única (Singleton)
export default new PlanService();
