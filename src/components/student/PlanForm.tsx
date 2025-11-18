import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createPlan, updatePlan, submitPlan, getActiveCompanies, getActivePeriods } from '../../services/studentService';
import { Plan } from '../../types/student';

interface Company {
  id: number;
  companyName: string;
}

interface Period {
  id: number;
  name: string;
}

interface PlanFormProps {
  plan?: Plan;
  onCancel: () => void;
  onSuccess: () => void;
}

export function PlanForm({ plan, onCancel, onSuccess }: PlanFormProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    companyId: plan?.company?.id?.toString() || '',
    periodId: plan?.period?.id?.toString() || '',
    objectives: plan?.objectives || '',
    activities: plan?.activities || '',
    startDate: plan?.startDate || '',
    endDate: plan?.endDate || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [companiesData, periodsData] = await Promise.all([
        getActiveCompanies(),
        getActivePeriods()
      ]);
      setCompanies(companiesData);
      setPeriods(periodsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar empresas y períodos');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyId) newErrors.companyId = 'Selecciona una empresa';
    if (!formData.periodId) newErrors.periodId = 'Selecciona un período';
    if (!formData.objectives.trim()) newErrors.objectives = 'Los objetivos son requeridos';
    if (!formData.activities.trim()) newErrors.activities = 'Las actividades son requeridas';
    if (!formData.startDate) newErrors.startDate = 'La fecha de inicio es requerida';
    if (!formData.endDate) newErrors.endDate = 'La fecha de fin es requerida';

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, shouldSubmit: boolean = false) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const data = {
        companyId: parseInt(formData.companyId),
        periodId: parseInt(formData.periodId),
        objectives: formData.objectives,
        activities: formData.activities,
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      let createdPlan;
      if (plan) {
        createdPlan = await updatePlan(plan.id, data);
        toast.success('Plan actualizado exitosamente');
      } else {
        createdPlan = await createPlan(data);
        toast.success('Plan creado exitosamente');
      }

      if (shouldSubmit && createdPlan) {
        await submitPlan(createdPlan.id);
        toast.success('Plan enviado a revisión');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving plan:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el plan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-gray-900 mb-1">{plan ? 'Editar' : 'Registrar'} Plan de Prácticas</h1>
          <p className="text-gray-600">Completa la información de tu plan de prácticas profesionales</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del Plan</CardTitle>
          <CardDescription>Toda la información es requerida</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyId">Empresa *</Label>
                <select
                  id="companyId"
                  value={formData.companyId}
                  onChange={(e) => handleChange('companyId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.companyId ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={plan?.status === 'APPROVED'}
                >
                  <option value="">Selecciona una empresa</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.companyName}
                    </option>
                  ))}
                </select>
                {errors.companyId && (
                  <p className="text-sm text-red-500">{errors.companyId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodId">Período *</Label>
                <select
                  id="periodId"
                  value={formData.periodId}
                  onChange={(e) => handleChange('periodId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md ${errors.periodId ? 'border-red-500' : 'border-gray-300'}`}
                  disabled={plan?.status === 'APPROVED'}
                >
                  <option value="">Selecciona un período</option>
                  {periods.map(period => (
                    <option key={period.id} value={period.id}>
                      {period.name}
                    </option>
                  ))}
                </select>
                {errors.periodId && (
                  <p className="text-sm text-red-500">{errors.periodId}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={errors.startDate ? 'border-red-500' : ''}
                  disabled={plan?.status === 'APPROVED'}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">{errors.startDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={errors.endDate ? 'border-red-500' : ''}
                  disabled={plan?.status === 'APPROVED'}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">{errors.endDate}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="objectives">Objetivos *</Label>
              <Textarea
                id="objectives"
                placeholder="Describe los objetivos que esperas alcanzar..."
                rows={4}
                value={formData.objectives}
                onChange={(e) => handleChange('objectives', e.target.value)}
                className={errors.objectives ? 'border-red-500' : ''}
                disabled={plan?.status === 'APPROVED'}
              />
              {errors.objectives && (
                <p className="text-sm text-red-500">{errors.objectives}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Actividades *</Label>
              <Textarea
                id="activities"
                placeholder="Detalla las actividades que realizarás..."
                rows={5}
                value={formData.activities}
                onChange={(e) => handleChange('activities', e.target.value)}
                className={errors.activities ? 'border-red-500' : ''}
                disabled={plan?.status === 'APPROVED'}
              />
              {errors.activities && (
                <p className="text-sm text-red-500">{errors.activities}</p>
              )}
            </div>

            {plan?.status === 'APPROVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-900">
                  ✓ Este plan ha sido aprobado y no puede ser modificado
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancelar
              </Button>
              
              {plan?.status !== 'APPROVED' && (
                <>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      'Guardar Borrador'
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={(e) => handleSubmit(e, true)}
                    className="bg-blue-800 hover:bg-blue-900"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Guardar y Enviar'
                    )}
                  </Button>
                </>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
