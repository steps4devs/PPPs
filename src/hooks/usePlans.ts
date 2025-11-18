/**
 * Hook personalizado para gestionar planes.
 * 
 * Proporciona estado y funciones para operaciones CRUD de planes.
 */

import { useState, useEffect } from 'react';
import planService from '../services/plan.service';
import type { PlanResponse } from '../types';
import { PlanStatus } from '../types';
import { toast } from 'sonner';

export function usePlans() {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Carga los planes del estudiante autenticado.
   */
  const loadMyPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await planService.getMyPlans();
      setPlans(data);
    } catch (err: any) {
      setError(err.message);
      toast.error('Error al cargar planes');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crea un nuevo plan.
   */
  const createPlan = async (planData: {
    companyId: number;
    periodId: number;
    objectives: string;
    activities: string;
    startDate: string;
    endDate: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newPlan = await planService.createPlan(planData);
      setPlans([...plans, newPlan]);
      toast.success('Plan creado exitosamente');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error al crear plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualiza un plan existente (solo DRAFT).
   */
  const updatePlan = async (
    id: number,
    planData: {
      companyId: number;
      periodId: number;
      objectives: string;
      activities: string;
      startDate: string;
      endDate: string;
    }
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const updatedPlan = await planService.updatePlan(id, planData);
      setPlans(plans.map(p => p.id === id ? updatedPlan : p));
      toast.success('Plan actualizado');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error al actualizar plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Envía un plan para revisión.
   */
  const submitPlan = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      const submittedPlan = await planService.submitPlan(id);
      setPlans(plans.map(p => p.id === id ? submittedPlan : p));
      toast.success('Plan enviado para revisión');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Elimina un plan (solo DRAFT).
   */
  const deletePlan = async (id: number): Promise<boolean> => {
    setIsLoading(true);
    try {
      await planService.deletePlan(id);
      setPlans(plans.filter(p => p.id !== id));
      toast.success('Plan eliminado');
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar plan');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filtra planes por estado.
   */
  const filterByStatus = (status: PlanStatus): PlanResponse[] => {
    return plans.filter(p => p.status === status);
  };

  /**
   * Obtiene el plan actual (aprobado más reciente).
   */
  const getCurrentPlan = (): PlanResponse | undefined => {
    const approvedPlans = plans.filter(p => p.status === PlanStatus.APPROVED);
    return approvedPlans[approvedPlans.length - 1];
  };

  return {
    plans,
    isLoading,
    error,
    loadMyPlans,
    createPlan,
    updatePlan,
    submitPlan,
    deletePlan,
    filterByStatus,
    getCurrentPlan,
  };
}
