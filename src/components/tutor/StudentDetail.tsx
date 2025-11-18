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
  getStudentEvaluations,
  getStudentEvidences,
  downloadEvidence
} from '../../services/tutorService';
import { Loader2, ArrowLeft, CheckCircle, XCircle, Download, FileText, FileIcon, ImageIcon, Eye, Plus, ChevronDown, ChevronUp, Edit } from 'lucide-react';
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
  onNavigateToEvaluations?: (studentId?: number, evaluationToEdit?: any) => void;
}

export function StudentDetail({ studentId, onBack, onNavigateToEvaluations }: StudentDetailProps) {
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [timeEntries, setTimeEntries] = useState<any[]>([]);
  const [evidences, setEvidences] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [expandedEvaluation, setExpandedEvaluation] = useState<number | null>(null);

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      
      console.log('📥 Cargando datos del estudiante:', studentId);
      
      const [studentData, plansData, entriesData, evidencesData, evaluationsData] = await Promise.all([
        getStudentDetail(studentId),
        getStudentPlans(studentId),
        getStudentTimeEntries(studentId),
        getStudentEvidences(studentId).catch(err => {
          console.error('❌ Error cargando evidencias:', err);
          return [];
        }),
        getStudentEvaluations(studentId).catch(err => {
          console.error('❌ Error cargando evaluaciones:', err);
          return [];
        })
      ]);
      
      console.log('✅ Datos cargados:', { studentData, plansData, entriesData, evidencesData, evaluationsData });
      
      setStudent(studentData);
      
      // Planes ya vienen filtrados por periodo de la asignación activa
      const studentPlan = Array.isArray(plansData) && plansData.length > 0 ? plansData[0] : null;
      setPlan(studentPlan);
      
      // Time entries ya vienen filtradas por periodo
      setTimeEntries(Array.isArray(entriesData) ? entriesData : []);
      
      // Evidencias ya vienen filtradas por estudiante
      console.log('📁 Evidencias recibidas:', evidencesData);
      setEvidences(evidencesData || []);
      
      // Evaluaciones del estudiante
      setEvaluations(Array.isArray(evaluationsData) ? evaluationsData : []);
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Evaluaciones del Estudiante</CardTitle>
                  <CardDescription>Historial de evaluaciones realizadas</CardDescription>
                </div>
                <Button 
                  className="bg-blue-800 hover:bg-blue-900"
                  onClick={() => onNavigateToEvaluations?.(studentId)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Evaluación
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {evaluations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No hay evaluaciones registradas</p>
                  <p className="text-sm mt-2">Haz clic en "Nueva Evaluación" para crear una</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {evaluations.map((evaluation: any) => (
                    <Card key={evaluation.id} className="border-l-4 border-l-blue-800">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <Badge variant="outline" className="text-blue-800 border-blue-800 text-xs">
                              {evaluation.type === 'PARTIAL' && 'Evaluación Parcial'}
                              {evaluation.type === 'MONTHLY' && 'Evaluación Mensual'}
                              {evaluation.type === 'FINAL' && 'Evaluación Final'}
                              {evaluation.type === 'PERFORMANCE' && 'Evaluación de Desempeño'}
                              {evaluation.type === 'TECHNICAL' && 'Evaluación Técnica'}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {new Date(evaluation.evaluationDate).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Nota Promedio</p>
                              <p className={`text-2xl font-bold ${
                                evaluation.average >= 18 ? 'text-emerald-600' :
                                evaluation.average >= 14 ? 'text-blue-600' :
                                evaluation.average >= 11 ? 'text-amber-600' :
                                'text-red-600'
                              }`}>
                                {evaluation.average.toFixed(1)}
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onNavigateToEvaluations?.(studentId, evaluation)}
                                className="h-8"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedEvaluation(expandedEvaluation === evaluation.id ? null : evaluation.id)}
                                className="h-8"
                              >
                                {expandedEvaluation === evaluation.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>

                        {expandedEvaluation === evaluation.id && (
                          <div className="mt-3 pt-3 border-t space-y-3">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-2">Criterios de Evaluación:</p>
                              <div className="space-y-2">
                                {evaluation.criteria.map((criterio: any, index: number) => (
                                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-900">{criterio.name}</span>
                                    <span className={`font-semibold text-sm ${
                                      criterio.score >= 18 ? 'text-emerald-600' :
                                      criterio.score >= 14 ? 'text-blue-600' :
                                      criterio.score >= 11 ? 'text-amber-600' :
                                      'text-red-600'
                                    }`}>
                                      {criterio.score.toFixed(1)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {evaluation.comments && (
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Comentarios:</p>
                                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded-lg">{evaluation.comments}</p>
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 pt-2">
                              Evaluado por: {evaluation.tutor.name} • {new Date(evaluation.evaluatedAt).toLocaleDateString('es-ES')}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
