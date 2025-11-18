import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FileText, Plus, Loader2, Pencil, Trash2, Send, AlertCircle, Copy, X } from 'lucide-react';
import { toast } from 'sonner';
import { getMyPlans, deletePlan, submitPlan, cancelPlanSubmission, getActivePeriods } from '../../services/studentService';
import { Plan } from '../../types/student';
import { PlanForm } from './PlanForm';

export function PlanList() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | undefined>(undefined);
  const [duplicatingPlan, setDuplicatingPlan] = useState<Plan | undefined>(undefined);
  const [submitting, setSubmitting] = useState<number | null>(null);

  useEffect(() => {
    loadPlans();
    loadCurrentPeriod();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const data = await getMyPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar los planes');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentPeriod = async () => {
    try {
      const periods = await getActivePeriods();
      if (periods && periods.length > 0) {
        setCurrentPeriod(periods[0]);
      }
    } catch (error) {
      console.error('Error loading current period:', error);
    }
  };

  const handleEdit = (plan: Plan) => {
    if (plan.status !== 'DRAFT') {
      toast.error('Solo puedes editar planes en borrador');
      return;
    }
    setEditingPlan(plan);
    setDuplicatingPlan(undefined);
    setShowForm(true);
  };

  const handleDuplicate = (plan: Plan) => {
    setDuplicatingPlan(plan);
    setEditingPlan(undefined);
    setShowForm(true);
  };

  const handleDelete = async (planId: number, status: string) => {
    if (status === 'APPROVED') {
      toast.error('No puedes eliminar un plan aprobado');
      return;
    }

    const confirmMessage = status === 'IN_REVIEW' 
      ? '¿Cancelar el envío de este plan? Volverá a borrador.'
      : '¿Estás seguro de eliminar este plan?';
    
    if (!confirm(confirmMessage)) return;

    try {
      if (status === 'IN_REVIEW') {
        await cancelPlanSubmission(planId);
        toast.success('Envío cancelado. El plan volvió a borrador');
      } else {
        await deletePlan(planId);
        toast.success('Plan eliminado');
      }
      loadPlans();
    } catch (error: any) {
      console.error('Error processing plan:', error);
      toast.error(error.response?.data?.message || 'Error al procesar el plan');
    }
  };

  const handleSubmit = async (planId: number) => {
    if (!confirm('¿Enviar este plan a revisión? No podrás editarlo después.')) return;

    try {
      setSubmitting(planId);
      await submitPlan(planId);
      toast.success('Plan enviado a revisión exitosamente');
      loadPlans();
    } catch (error) {
      console.error('Error submitting plan:', error);
      toast.error('Error al enviar el plan');
    } finally {
      setSubmitting(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPlan(undefined);
    setDuplicatingPlan(undefined);
    loadPlans();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPlan(undefined);
    setDuplicatingPlan(undefined);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'Borrador', className: 'bg-gray-600' },
      IN_REVIEW: { label: 'En revisión', className: 'bg-amber-600' },
      APPROVED: { label: 'Aprobado', className: 'bg-emerald-600' },
      REJECTED: { label: 'Rechazado', className: 'bg-red-600' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Separar planes: actual (del período actual) vs históricos
  const currentPeriodId = currentPeriod?.id;
  const currentPlanInPeriod = plans.find(p => p.period?.id === currentPeriodId);
  const hasApprovedPlanInCurrentPeriod = currentPlanInPeriod?.status === 'APPROVED';
  const hasInReviewPlanInCurrentPeriod = currentPlanInPeriod?.status === 'IN_REVIEW';
  const historicalPlans = plans.filter(p => p.period?.id !== currentPeriodId);

  // Determinar si mostrar botón "Crear Plan"
  const showCreateButton = !hasApprovedPlanInCurrentPeriod && !hasInReviewPlanInCurrentPeriod;

  if (showForm) {
    return (
      <PlanForm 
        plan={editingPlan || (duplicatingPlan ? {
          ...duplicatingPlan,
          id: 0, // Nuevo plan
          status: 'DRAFT'
        } as any : undefined)}
        onCancel={handleFormCancel}
        onSuccess={handleFormSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Mi Plan de Prácticas</h1>
          <p className="text-gray-600">Registra y gestiona tu plan de prácticas profesionales</p>
        </div>
        {showCreateButton && (
          <Button 
            onClick={() => {
              setEditingPlan(undefined);
              setDuplicatingPlan(undefined);
              setShowForm(true);
            }} 
            className="bg-blue-800 hover:bg-blue-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Registrar Plan
          </Button>
        )}
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          </CardContent>
        </Card>
      ) : plans.length === 0 ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-1">No has registrado un plan aún</p>
                <p className="text-sm text-blue-800">Completa el formulario para comenzar tus prácticas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Plan Actual del Período */}
          {currentPlanInPeriod && (
            <Card>
              <CardHeader>
                <CardTitle>Estado del Plan</CardTitle>
                <CardDescription>Información actual de tu plan de prácticas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b">
                    <h3 className="text-gray-900 font-semibold">
                      Plan de Prácticas {currentPlanInPeriod.period?.name}
                    </h3>
                    {getStatusBadge(currentPlanInPeriod.status)}
                  </div>

                  {currentPlanInPeriod.status === 'IN_REVIEW' && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-amber-900 mb-1">Plan en revisión</p>
                        <p className="text-sm text-amber-800">
                          Tu plan está siendo revisado por el tutor. Recibirás una notificación cuando sea aprobado o rechazado.
                        </p>
                      </div>
                    </div>
                  )}

                  {currentPlanInPeriod.status === 'APPROVED' && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-emerald-900 mb-1">Plan Aprobado</p>
                        <p className="text-sm text-emerald-800">
                          Tu plan ha sido aprobado. Ya puedes comenzar a registrar tus horas de prácticas.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Empresa</p>
                      <p className="text-gray-900">{currentPlanInPeriod.company?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Período</p>
                      <p className="text-gray-900">
                        {new Date(currentPlanInPeriod.startDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })} - {' '}
                        {new Date(currentPlanInPeriod.endDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Objetivos</p>
                      <p className="text-gray-900">{currentPlanInPeriod.objectives}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Actividades</p>
                      <p className="text-gray-900">{currentPlanInPeriod.activities}</p>
                    </div>
                  </div>

                  {currentPlanInPeriod.status === 'REJECTED' && currentPlanInPeriod.rejectionReason && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-900 mb-1">Motivo del rechazo:</p>
                        <p className="text-red-800">{currentPlanInPeriod.rejectionReason}</p>
                      </div>
                    </div>
                  )}

                  {currentPlanInPeriod.submittedAt && (
                    <div className="text-sm text-gray-600">
                      Enviado el: {new Date(currentPlanInPeriod.submittedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}

                  {currentPlanInPeriod.reviewedAt && (
                    <div className="text-sm text-gray-600">
                      Revisado el: {new Date(currentPlanInPeriod.reviewedAt).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  )}

                  {/* Botones según estado */}
                  <div className="flex gap-2 pt-4 border-t">
                    {currentPlanInPeriod.status === 'DRAFT' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(currentPlanInPeriod)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          className="bg-blue-800 hover:bg-blue-900"
                          onClick={() => handleSubmit(currentPlanInPeriod.id)}
                          disabled={submitting === currentPlanInPeriod.id}
                        >
                          {submitting === currentPlanInPeriod.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          Enviar a Revisión
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(currentPlanInPeriod.id, currentPlanInPeriod.status)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </>
                    )}

                    {currentPlanInPeriod.status === 'IN_REVIEW' && (
                      <Button
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(currentPlanInPeriod.id, currentPlanInPeriod.status)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar Envío
                      </Button>
                    )}

                    {currentPlanInPeriod.status === 'REJECTED' && (
                      <>
                        <Button
                          className="bg-blue-800 hover:bg-blue-900"
                          onClick={() => handleDuplicate(currentPlanInPeriod)}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar y Corregir
                        </Button>
                        <Button
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(currentPlanInPeriod.id, currentPlanInPeriod.status)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de Planes Anteriores */}
          {historicalPlans.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historial de Planes</CardTitle>
                <CardDescription>Planes de períodos anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {historicalPlans.map((plan) => (
                    <div key={plan.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {plan.period?.name} - {plan.company?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(plan.startDate).toLocaleDateString('es-ES')} - {' '}
                          {new Date(plan.endDate).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      {getStatusBadge(plan.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
