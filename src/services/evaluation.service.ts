/**
 * Servicio de Evaluaciones.
 * 
 * Maneja las operaciones relacionadas con evaluaciones de desempeño.
 */

import apiClient, { getErrorMessage } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import type { Evaluation, EvaluationType } from '../types';

// ============================================================================
// TIPOS PARA PETICIONES
// ============================================================================

export interface CreateEvaluationRequest {
  studentId: number;
  planId: number;
  type: EvaluationType;
  punctuality: number; // 0-20
  teamwork: number; // 0-20
  technicalKnowledge: number; // 0-20
  initiative: number; // 0-20
  comments?: string;
}

// ============================================================================
// SERVICIO DE EVALUACIONES
// ============================================================================

class EvaluationService {
  // ==========================================================================
  // ESTUDIANTE - Ver evaluaciones
  // ==========================================================================

  /**
   * Obtiene las evaluaciones del estudiante autenticado.
   */
  async getMyEvaluations(): Promise<Evaluation[]> {
    try {
      const response = await apiClient.get<Evaluation[]>(
        `${API_ENDPOINTS.STUDENT.TIME_ENTRIES.replace('/time-entries', '/evaluations')}`
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // TUTOR - Crear y gestionar evaluaciones
  // ==========================================================================

  /**
   * Obtiene todas las evaluaciones creadas por el tutor.
   */
  async getMyCreatedEvaluations(): Promise<Evaluation[]> {
    try {
      const response = await apiClient.get<Evaluation[]>(
        `${API_ENDPOINTS.TUTOR.PENDING_PLANS.replace('/plans/pending', '/evaluations')}`
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Crea una nueva evaluación (tutor).
   * 
   * @param data Datos de la evaluación
   */
  async createEvaluation(data: CreateEvaluationRequest): Promise<Evaluation> {
    try {
      const response = await apiClient.post<Evaluation>(
        `${API_ENDPOINTS.TUTOR.PENDING_PLANS.replace('/plans/pending', '/evaluations')}`,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // UTILIDADES
  // ==========================================================================

  /**
   * Calcula el promedio total de una evaluación.
   * 
   * @param evaluation Evaluación
   * @returns Promedio (0-20)
   */
  calculateAverage(evaluation: Evaluation): number {
    const { punctuality, teamwork, technicalKnowledge, initiative } = evaluation;
    return (punctuality + teamwork + technicalKnowledge + initiative) / 4;
  }

  /**
   * Obtiene el estado de aprobación según el promedio.
   * 
   * @param average Promedio
   * @returns Estado
   */
  getApprovalStatus(average: number): 'Aprobado' | 'Desaprobado' {
    return average >= 10.5 ? 'Aprobado' : 'Desaprobado';
  }

  /**
   * Valida que las notas estén en el rango correcto.
   * 
   * @param score Nota
   * @returns true si es válida
   */
  isValidScore(score: number): boolean {
    return score >= 0 && score <= 20;
  }

  /**
   * Formatea una nota con 2 decimales.
   * 
   * @param score Nota
   * @returns String formateado
   */
  formatScore(score: number): string {
    return score.toFixed(2);
  }
}

// Exportar instancia única (Singleton)
export default new EvaluationService();
