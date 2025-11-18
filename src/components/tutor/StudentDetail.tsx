import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  getStudentDetail,
  getStudentPlans,
  getStudentTimeEntries,
  approvePlan,
  rejectPlan,
  approveTimeEntry,
  rejectTimeEntry,
  createEvaluation,
  getStudentEvidences,
  downloadEvidence
} from '../../services/tutorService';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Download, FileText, FileIcon, ImageIcon, Eye } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';
import { toast } from 'sonner';

interface StudentDetailProps {
  studentId: number;
  onBack: () => void;
}

export function StudentDetail({ studentId, onBack }: StudentDetailProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [evaluationForm, setEvaluationForm] = useState({
    puntualidad: '',
    trabajo: '',
    conocimientos: '',
    iniciativa: '',
    comentarios: ''
  });

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      console.log('📥 Cargando datos del estudiante:', studentId);
      
      const [studentData, plansData, entriesData, evidencesData] = await Promise.all([
        getStudentDetail(studentId),
        getStudentPlans(studentId),
        getStudentTimeEntries(studentId),
        getStudentEvidences(studentId).catch(err => {
          console.error('❌ Error cargando evidencias:', err);
          return [];
        })
      ]);
      
      console.log('✅ Datos cargados:', { studentData, plansData, entriesData, evidencesData });
      
      setStudent(studentData);
      
      // Planes ya vienen filtrados por periodo de la asignación activa
      const studentPlan = Array.isArray(plansData) && plansData.length > 0 ? plansData[0] : null;
      setPlan(studentPlan);
      
      // Time entries ya vienen filtradas por periodo
      setTimeEntries(Array.isArray(entriesData) ? entriesData : []);
      
      // Evidencias ya vienen filtradas por estudiante
      console.log('📁 Evidencias recibidas:', evidencesData);
      setEvidences(evidencesData || []);
    } catch (error) {
      console.error('Error loading student data:', error);
      toast.error('Error al cargar datos del estudiante');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!plan) return;
    try {
      await approvePlan(plan.id);
      toast.success('Plan aprobado', {
        description: 'El estudiante ha sido notificado'
      });
      loadStudentData();
    } catch (error) {
      console.error('Error approving plan:', error);
      toast.error('Error al aprobar el plan');
    }
  };

  const handleRejectPlan = async () => {
    if (!plan) return;
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      await rejectPlan(plan.id, reason);
      toast.success('Plan rechazado', {
        description: 'El estudiante deberá hacer correcciones'
      });
      loadStudentData();
    } catch (error) {
      console.error('Error rejecting plan:', error);
      toast.error('Error al rechazar el plan');
    }
  };

  const handleApproveHours = async (id: number) => {
    try {
      await approveTimeEntry(id);
      toast.success('Horas aprobadas');
      loadStudentData();
    } catch (error) {
      console.error('Error approving hours:', error);
      toast.error('Error al aprobar horas');
    }
  };

  const handleRejectHours = async (id: number) => {
    const reason = prompt('Motivo del rechazo:');
    if (!reason) return;
    
    try {
      await rejectTimeEntry(id, reason);
      toast.success('Horas rechazadas');
      loadStudentData();
    } catch (error) {
      console.error('Error rejecting hours:', error);
      toast.error('Error al rechazar horas');
    }
  };

  const submitEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plan) {
      toast.error('El estudiante debe tener un plan aprobado');
      return;
    }
    
    try {
      await createEvaluation({
        assignmentId: student.assignmentId || 1, // Necesitarás obtener esto del detalle
        punctuality: parseFloat(evaluationForm.puntualidad),
        workQuality: parseFloat(evaluationForm.trabajo),
        technicalKnowledge: parseFloat(evaluationForm.conocimientos),
        initiative: parseFloat(evaluationForm.iniciativa),
        comments: evaluationForm.comentarios
      });
      
      const promedio = (
        (parseFloat(evaluationForm.puntualidad) +
        parseFloat(evaluationForm.trabajo) +
        parseFloat(evaluationForm.conocimientos) +
        parseFloat(evaluationForm.iniciativa)) / 4
      ).toFixed(1);
      
      toast.success('Evaluación guardada', {
        description: `Promedio: ${promedio} - El estudiante ha sido notificado`
      });
      
      setEvaluationForm({
        puntualidad: '',
        trabajo: '',
        conocimientos: '',
        iniciativa: '',
        comentarios: ''
      });
    } catch (error) {
      console.error('Error creating evaluation:', error);
      toast.error('Error al guardar la evaluación');
    }
  };

  const handleDownloadEvidence = async (evidenceId: number, filename: string) => {
    try {
      const blob = await downloadEvidence(evidenceId);
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Descarga iniciada');
    } catch (error) {
      console.error('Error downloading evidence:', error);
      toast.error('Error al descargar el archivo');
    }
  };

  const handleViewEvidence = async (evidenceId: number, filename: string) => {
    try {
      const blob = await downloadEvidence(evidenceId);
      
      // Crear URL temporal y abrir en nueva pestaña
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpiar después de un tiempo
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error('Error viewing evidence:', error);
      toast.error('Error al visualizar el archivo');
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    } else if (fileType === 'application/pdf') {
      return <FileText className="w-5 h-5 text-red-600" />;
    }
    return <FileIcon className="w-5 h-5 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No se encontró información del estudiante</p>
        <Button onClick={onBack} className="mt-4">Volver</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-gray-900 mb-1">{student.studentName || 'N/A'}</h1>
          <p className="text-gray-600">{student.studentCode || 'N/A'} • {student.studentEmail || 'N/A'}</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Empresa</p>
              <p className="text-gray-900">{plan?.company?.name || 'Sin empresa'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Periodo</p>
              <p className="text-gray-900">{plan?.period?.name || 'Sin periodo'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="plan" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="hours">Bitácora</TabsTrigger>
          <TabsTrigger value="evidence">Evidencias</TabsTrigger>
          <TabsTrigger value="evaluation">Evaluación</TabsTrigger>
        </TabsList>

        <TabsContent value="plan" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Plan de Prácticas</CardTitle>
                  <CardDescription>Revisa y gestiona el plan del estudiante</CardDescription>
                </div>
                {plan && (
                  <Badge 
                         className={
                           plan.status === 'APPROVED' 
                             ? 'bg-emerald-600' 
                             : plan.status === 'REJECTED' 
                               ? 'bg-red-600' 
                               : 'bg-amber-600 text-white'
                         }>
                    {plan.status === 'APPROVED' ? 'Aprobado' : plan.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {plan ? (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Empresa</p>
                      <p className="text-gray-900">{plan.company?.name || 'Sin empresa'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Periodo</p>
                      <p className="text-gray-900">{plan.period?.name || 'Sin periodo'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Objetivos</p>
                      <p className="text-gray-900">{plan.objectives || 'Sin objetivos definidos'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Actividades</p>
                      <p className="text-gray-900">{plan.activities || 'Sin actividades definidas'}</p>
                    </div>
                  </div>

                  {(plan.status === 'PENDING' || plan.status === 'IN_REVIEW') && (
                    <div className="flex gap-3 pt-4 border-t">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprobar Plan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Aprobar este plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              El estudiante será notificado y podrá comenzar a registrar horas de prácticas.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleApprovePlan} className="bg-emerald-600 hover:bg-emerald-700">
                              Aprobar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive">
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar Plan
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Rechazar este plan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              El estudiante deberá realizar correcciones antes de volver a enviarlo.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRejectPlan} className="bg-red-600 hover:bg-red-700">
                              Rechazar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay plan pendiente de revisión</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Bitácora de Horas</CardTitle>
              <CardDescription>Valida los registros de horas del estudiante</CardDescription>
            </CardHeader>
            <CardContent>
              {timeEntries.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Actividad</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{new Date(entry.date).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{entry.hours}h</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.activity}</TableCell>
                        <TableCell>
                          <Badge 
                                 className={
                                   entry.status === 'APPROVED' 
                                     ? 'bg-emerald-600' 
                                     : entry.status === 'REJECTED' 
                                       ? 'bg-red-600' 
                                       : 'bg-amber-600 text-white'
                                 }>
                            {entry.status === 'APPROVED' ? 'Aprobado' : entry.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {entry.status === 'PENDING' && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-emerald-600 hover:text-emerald-700"
                                onClick={() => handleApproveHours(entry.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleRejectHours(entry.id)}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay registros de horas pendientes</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence">
          <Card>
            <CardHeader>
              <CardTitle>Evidencias</CardTitle>
              <CardDescription>Archivos subidos por el estudiante</CardDescription>
            </CardHeader>
            <CardContent>
              {evidences.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Archivo</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tamaño</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {evidences.map((evidence) => (
                      <TableRow key={evidence.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getFileIcon(evidence.fileType)}
                            <span className="truncate max-w-xs">{evidence.originalFilename || evidence.filename}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {evidence.uploadedAt ? new Date(evidence.uploadedAt).toLocaleDateString('es-ES') : 'N/A'}
                        </TableCell>
                        <TableCell>{formatFileSize(evidence.fileSize || 0)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleViewEvidence(evidence.id, evidence.originalFilename || evidence.filename)}
                              title="Ver archivo"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleDownloadEvidence(evidence.id, evidence.originalFilename || evidence.filename)}
                              title="Descargar archivo"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-gray-500 py-8">No hay evidencias subidas</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evaluation">
          <Card>
            <CardHeader>
              <CardTitle>Evaluación del Estudiante</CardTitle>
              <CardDescription>Completa la evaluación de desempeño</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitEvaluation} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="puntualidad">Puntualidad (0-20)</Label>
                    <Input
                      id="puntualidad"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={evaluationForm.puntualidad}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, puntualidad: e.target.value })}
                      placeholder="Ej: 18"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="trabajo">Trabajo en Equipo (0-20)</Label>
                    <Input
                      id="trabajo"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={evaluationForm.trabajo}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, trabajo: e.target.value })}
                      placeholder="Ej: 17"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conocimientos">Conocimientos Técnicos (0-20)</Label>
                    <Input
                      id="conocimientos"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={evaluationForm.conocimientos}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, conocimientos: e.target.value })}
                      placeholder="Ej: 19"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iniciativa">Iniciativa (0-20)</Label>
                    <Input
                      id="iniciativa"
                      type="number"
                      min="0"
                      max="20"
                      step="0.5"
                      value={evaluationForm.iniciativa}
                      onChange={(e) => setEvaluationForm({ ...evaluationForm, iniciativa: e.target.value })}
                      placeholder="Ej: 18"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comentarios">Comentarios</Label>
                  <Textarea
                    id="comentarios"
                    rows={4}
                    value={evaluationForm.comentarios}
                    onChange={(e) => setEvaluationForm({ ...evaluationForm, comentarios: e.target.value })}
                    placeholder="Observaciones generales sobre el desempeño del estudiante..."
                  />
                </div>
                <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
                  Guardar Evaluación
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
