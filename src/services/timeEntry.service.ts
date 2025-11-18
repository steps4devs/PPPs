/**
 * Servicio de Registro de Horas.
 * 
 * Maneja el CRUD de time entries (registros de horas de práctica).
 */

import apiClient, { getErrorMessage } from '../utils/apiClient';
import { API_ENDPOINTS } from '../config/api.config';
import type { TimeEntry, TimeEntryStatus } from '../types';

// ============================================================================
// TIPOS PARA PETICIONES
// ============================================================================

export interface CreateTimeEntryRequest {
  entryDate: string; // formato: "YYYY-MM-DD"
  startTime: string; // formato: "HH:mm:ss"
  endTime: string; // formato: "HH:mm:ss"
  activity: string;
}

export interface TimeEntryListResponse {
  content: TimeEntry[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface RejectTimeEntryRequest {
  reason: string;
}

// ============================================================================
// SERVICIO DE TIME ENTRIES
// ============================================================================

class TimeEntryService {
  // ==========================================================================
  // ESTUDIANTE - Gestión de horas
  // ==========================================================================

  /**
   * Obtiene los registros de horas del estudiante autenticado.
   * 
   * @param page Número de página (0-indexed)
   * @param size Tamaño de página
   * @param status Filtro opcional por estado
   */
  async getMyTimeEntries(
    page: number = 0,
    size: number = 10,
    status?: TimeEntryStatus
  ): Promise<TimeEntryListResponse> {
    try {
      const params: any = { page, size };
      if (status) params.status = status;

      const response = await apiClient.get<TimeEntryListResponse>(
        API_ENDPOINTS.STUDENT.TIME_ENTRIES,
        { params }
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Registra nuevas horas de práctica.
   * 
   * @param data Datos del registro de horas
   */
  async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
    try {
      const response = await apiClient.post<TimeEntry>(
        API_ENDPOINTS.STUDENT.TIME_ENTRIES,
        data
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Elimina un registro de horas (solo si está en estado PENDING).
   * 
   * @param id ID del registro
   */
  async deleteTimeEntry(id: number): Promise<void> {
    try {
      await apiClient.delete(API_ENDPOINTS.STUDENT.TIME_ENTRY_BY_ID(id));
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  // ==========================================================================
  // TUTOR - Aprobación de horas
  // ==========================================================================

  /**
   * Obtiene los registros de horas pendientes de aprobación (tutor).
   * 
   * @param page Número de página
   * @param size Tamaño de página
   */
  async getPendingTimeEntries(
    page: number = 0,
    size: number = 10
  ): Promise<TimeEntryListResponse> {
    try {
      const response = await apiClient.get<TimeEntryListResponse>(
        API_ENDPOINTS.TUTOR.PENDING_TIME_ENTRIES,
        { params: { page, size } }
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Aprueba un registro de horas (tutor).
   * 
   * @param id ID del registro
   */
  async approveTimeEntry(id: number): Promise<TimeEntry> {
    try {
      const response = await apiClient.put<TimeEntry>(
        API_ENDPOINTS.TUTOR.APPROVE_TIME_ENTRY(id)
      );

      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }

  /**
   * Rechaza un registro de horas (tutor).
   * 
   * @param id ID del registro
   * @param reason Razón del rechazo
   */
  async rejectTimeEntry(id: number, reason: string): Promise<TimeEntry> {
    try {
      const response = await apiClient.put<TimeEntry>(
        API_ENDPOINTS.TUTOR.REJECT_TIME_ENTRY(id),
        { reason }
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
   * Calcula las horas totales trabajadas desde un array de time entries.
   * 
   * @param entries Array de registros
   * @returns Total de horas
   */
  calculateTotalHours(entries: TimeEntry[]): number {
    return entries.reduce((total, entry) => {
      if (entry.status === 'APPROVED') {
        return total + (entry.hoursWorked || 0);
      }
      return total;
    }, 0);
  }

  /**
   * Formatea la duración de horas trabajadas.
   * 
   * @param hours Número de horas
   * @returns String formateado (ej: "8.5 horas", "1 hora")
   */
  formatHours(hours: number): string {
    if (hours === 1) return '1 hora';
    return `${hours.toFixed(1)} horas`;
  }

  /**
   * Valida que la fecha no sea futura.
   * 
   * @param date Fecha en formato YYYY-MM-DD
   * @returns true si es válida
   */
  isValidEntryDate(date: string): boolean {
    const entryDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return entryDate <= today;
  }

  /**
   * Calcula las horas trabajadas desde startTime y endTime.
   * 
   * @param startTime Formato "HH:mm:ss"
   * @param endTime Formato "HH:mm:ss"
   * @returns Horas decimales
   */
  calculateHours(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return (endMinutes - startMinutes) / 60;
  }
}

// Exportar instancia única (Singleton)
export default new TimeEntryService();
