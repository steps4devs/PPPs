import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Plus, Eye, Trash2, Search, Award, TrendingUp, TrendingDown, Calendar, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { getMyEvaluations, getMyAssignedStudents, createEvaluation, deleteEvaluation } from '../../services/tutorService';
import type { Evaluation, AssignedStudent, EvaluationType, EvaluationCriterion, EvaluationFormData } from '../../types/tutor';

const evaluationTypeLabels: Record<EvaluationType, string> = {
  PARTIAL: 'Evaluación Parcial',
  MONTHLY: 'Evaluación Mensual',
  FINAL: 'Evaluación Final',
  PERFORMANCE: 'Evaluación de Desempeño',
  TECHNICAL: 'Evaluación Técnica'
};

interface EvaluationManagementProps {
  preselectedStudentId?: number;
  evaluationToEdit?: any;
}

export function EvaluationManagement({ preselectedStudentId, evaluationToEdit }: EvaluationManagementProps = {}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<EvaluationType | 'ALL'>('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState<EvaluationFormData>({
    studentId: 0,
    planId: 0,
    type: 'PARTIAL',
    evaluationDate: new Date().toISOString().split('T')[0],
    criteria: [
      { name: 'Puntualidad', score: 0 },
      { name: 'Trabajo en equipo', score: 0 },
      { name: 'Conocimientos técnicos', score: 0 },
      { name: 'Iniciativa', score: 0 },
    ],
    comments: ''
  });

  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [students, setStudents] = useState<AssignedStudent[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (evaluationToEdit) {
      // Si hay evaluación para editar, tiene prioridad
      handleEditEvaluation();
    } else if (preselectedStudentId && preselectedStudentId > 0) {
      // Si no, verificar si hay estudiante preseleccionado
      handlePreselectedStudent();
    }
  }, [preselectedStudentId, evaluationToEdit]);

  const handleEditEvaluation = async () => {
    try {
      await loadStudents();
      setFormData({
        studentId: evaluationToEdit.studentId,
        planId: evaluationToEdit.planId,
        type: evaluationToEdit.type,
        evaluationDate: new Date(evaluationToEdit.evaluationDate).toISOString().split('T')[0],
        criteria: evaluationToEdit.criteria.map((c: any) => ({
          name: c.name,
          score: c.score
        })),
        comments: evaluationToEdit.comments || ''
      });
      setSelectedEvaluation(evaluationToEdit);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error loading evaluation:', error);
      toast.error('Error al cargar la evaluación');
    }
  };

  const handlePreselectedStudent = async () => {
    try {
      const studentsData = await getMyAssignedStudents();
      const filteredStudents = Array.isArray(studentsData) 
        ? studentsData.filter(s => s.planStatus === 'APPROVED' && s.active) 
        : [];
      setStudents(filteredStudents);
      
      const assignment = filteredStudents.find(s => s.student.id === preselectedStudentId);
      if (assignment && assignment.planStatus === 'APPROVED' && assignment.planId) {
        setFormData(prev => ({
          ...prev,
          studentId: assignment.student.id,
          planId: assignment.planId
        }));
        setOpenDialog(true);
      } else if (assignment) {
        toast.error('El estudiante no tiene un plan aprobado');
      } else {
        toast.error('Estudiante no encontrado');
      }
    } catch (error) {
      console.error('Error preselecting student:', error);
      toast.error('Error al cargar los datos del estudiante');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const evaluationsData = await getMyEvaluations();
      setEvaluations(Array.isArray(evaluationsData) ? evaluationsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const studentsData = await getMyAssignedStudents();
      // Filtrar solo estudiantes con plan aprobado y activos
      const filteredStudents = Array.isArray(studentsData) 
        ? studentsData.filter(s => s.planStatus === 'APPROVED' && s.active) 
        : [];
      setStudents(filteredStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error al cargar los estudiantes');
    }
  };

  const calculateAverage = (criteria: EvaluationCriterion[]): string => {
    if (criteria.length === 0) return '0.0';
    const sum = criteria.reduce((acc, c: EvaluationCriterion) => acc + c.score, 0);
    return (sum / criteria.length).toFixed(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.planId || !formData.type || !formData.evaluationDate) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    if (formData.criteria.some(c => !c.name.trim())) {
      toast.error('Todos los criterios deben tener un nombre');
      return;
    }

    try {
      await createEvaluation(formData);
      toast.success('Evaluación creada correctamente');
      resetForm();
      setOpenDialog(false);
      loadData();
    } catch (error: any) {
      console.error('Error creating evaluation:', error);
      toast.error(error.response?.data?.message || 'Error al crear la evaluación');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteEvaluation(id);
      toast.success('Evaluación eliminada');
      loadData();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      toast.error('Error al eliminar la evaluación');
    }
  };

  const handleViewDetails = (evaluation: Evaluation) => {
    setSelectedEvaluation(evaluation);
    setOpenViewDialog(true);
  };

  const handleEdit = (evaluation: Evaluation) => {
    setFormData({
      studentId: evaluation.studentId,
      planId: evaluation.planId,
      type: evaluation.type,
      evaluationDate: evaluation.evaluationDate,
      criteria: evaluation.criteria.map(c => ({ name: c.name, score: c.score })),
      comments: evaluation.comments || ''
    });
    setSelectedEvaluation(evaluation);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      studentId: 0,
      planId: 0,
      type: 'PARTIAL',
      evaluationDate: new Date().toISOString().split('T')[0],
      criteria: [
        { name: 'Puntualidad', score: 0 },
        { name: 'Trabajo en equipo', score: 0 },
        { name: 'Conocimientos técnicos', score: 0 },
        { name: 'Iniciativa', score: 0 },
      ],
      comments: ''
    });
  };

  const updateCriterio = (index: number, score: number) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index].score = score;
    setFormData({ ...formData, criteria: newCriteria });
  };

  const addCriterio = () => {
    setFormData({
      ...formData,
      criteria: [...formData.criteria, { name: '', score: 0 }]
    });
  };

  const removeCriterio = (index: number) => {
    if (formData.criteria.length <= 1) {
      toast.error('Debe haber al menos un criterio');
      return;
    }
    const newCriteria = formData.criteria.filter((_: EvaluationCriterion, i: number) => i !== index);
    setFormData({ ...formData, criteria: newCriteria });
  };

  const updateCriterioName = (index: number, name: string) => {
    const newCriteria = [...formData.criteria];
    newCriteria[index].name = name;
    setFormData({ ...formData, criteria: newCriteria });
  };

  const handleStudentChange = (value: string) => {
    const assignment = students.find(s => s.student.id.toString() === value);
    if (assignment && assignment.planStatus === 'APPROVED' && assignment.planId) {
      setFormData({
        ...formData,
        studentId: assignment.student.id,
        planId: assignment.planId
      });
    }
  };

  // Filtrar evaluaciones
  const filteredEvaluations = evaluations.filter(ev => {
    const matchesSearch = 
      (ev.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (ev.studentCode?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || ev.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Estadísticas
  const totalEvaluations = evaluations.length;
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const evaluationsThisMonth = evaluations.filter(ev => {
    const evalDate = new Date(ev.evaluationDate);
    return evalDate.getMonth() === currentMonth && evalDate.getFullYear() === currentYear;
  }).length;
  
  const studentsWithExcellent = new Set(
    evaluations
      .filter(ev => ev.average >= 18)
      .map(ev => ev.studentCode)
  ).size;
  
  const studentsNeedingSupport = new Set(
    evaluations
      .filter(ev => ev.average > 0 && ev.average < 14)
      .map(ev => ev.studentCode)
  ).size;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Gestión de Evaluaciones</h1>
          <p className="text-gray-600">Administra todas las evaluaciones de tus estudiantes</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) {
            resetForm();
            setSelectedEvaluation(null);
          } else if (!selectedEvaluation && students.length === 0) {
            // Solo cargar estudiantes si estamos creando (no editando) y no están cargados
            loadStudents();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-900">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Evaluación</DialogTitle>
              <DialogDescription>
                Completa la información de la evaluación del estudiante
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="student">Estudiante <span className="text-red-600">*</span></Label>
                  <Select 
                    value={formData.studentId > 0 ? formData.studentId.toString() : ''} 
                    onValueChange={handleStudentChange}
                    disabled={!!selectedEvaluation}
                  >
                    <SelectTrigger id="student">
                      <SelectValue placeholder={selectedEvaluation ? selectedEvaluation.studentName : "Selecciona un estudiante"} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((assignment) => (
                        <SelectItem key={assignment.student.id} value={assignment.student.id.toString()}>
                          {assignment.student.name} - {assignment.student.studentCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de Evaluación <span className="text-red-600">*</span></Label>
                  <Select value={formData.type} onValueChange={(value: string) => setFormData({ ...formData, type: value as EvaluationType })}>
                    <SelectTrigger id="tipo">
                      <SelectValue placeholder="Selecciona el tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(evaluationTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha de Evaluación <span className="text-red-600">*</span></Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.evaluationDate}
                  onChange={(e) => setFormData({ ...formData, evaluationDate: e.target.value })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Criterios de Evaluación (0-20)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCriterio}>
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar Criterio
                  </Button>
                </div>
                
                {formData.criteria.map((criterio: EvaluationCriterion, index: number) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input
                        placeholder="Nombre del criterio"
                        value={criterio.name}
                        onChange={(e) => updateCriterioName(index, e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="Nota"
                        value={criterio.score || ''}
                        onChange={(e) => updateCriterio(index, parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="flex-shrink-0">
                      {formData.criteria.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCriterio(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                  <p className="text-sm text-blue-900">
                    Nota Promedio: <span className="font-semibold">{calculateAverage(formData.criteria)}/20</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comentarios">Comentarios y Retroalimentación</Label>
                <Textarea
                  id="comentarios"
                  placeholder="Escribe comentarios sobre el desempeño del estudiante..."
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                }}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-800 hover:bg-blue-900">
                  Guardar Evaluación
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Evaluaciones</p>
                <p className="text-3xl text-blue-800">{totalEvaluations}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded-lg">
                <Award className="w-5 h-5 text-blue-800" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Evaluaciones este mes</p>
                <p className="text-3xl text-emerald-600">{evaluationsThisMonth}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Estudiantes con excelente desempeño (≥18)</p>
                <p className="text-3xl text-purple-600">{studentsWithExcellent}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded-lg">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Estudiantes que necesitan apoyo (&lt;14)</p>
                <p className="text-3xl text-amber-600">{studentsNeedingSupport}</p>
              </div>
              <div className="bg-amber-50 p-2 rounded-lg">
                <TrendingDown className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Filtros</h3>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por estudiante, código o tipo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-64">
                <Select value={filterType} onValueChange={(value: string) => setFilterType(value as EvaluationType | 'ALL')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de evaluación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todos los tipos</SelectItem>
                    {Object.entries(evaluationTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de evaluaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Evaluaciones</CardTitle>
          <CardDescription>
            Mostrando {filteredEvaluations.length} de {totalEvaluations} evaluaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron evaluaciones
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">{evaluation.studentName}</TableCell>
                      <TableCell>{evaluation.studentCode}</TableCell>
                      <TableCell>{evaluationTypeLabels[evaluation.type]}</TableCell>
                      <TableCell>
                        {evaluation.evaluationDate && new Date(evaluation.evaluationDate).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${
                          evaluation.average >= 18 ? 'text-emerald-600' :
                          evaluation.average >= 14 ? 'text-blue-600' :
                          evaluation.average >= 11 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>
                          {evaluation.average.toFixed(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(evaluation)}
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Eliminar">
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar evaluación?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la evaluación de {evaluation.studentName}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(evaluation.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para ver detalles */}
      <Dialog open={openViewDialog} onOpenChange={setOpenViewDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Evaluación</DialogTitle>
            <DialogDescription>
              Información completa de la evaluación
            </DialogDescription>
          </DialogHeader>
          {selectedEvaluation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Estudiante</Label>
                  <p className="text-gray-900 font-medium">{selectedEvaluation.studentName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Código</Label>
                  <p className="text-gray-900">{selectedEvaluation.studentCode}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Tipo</Label>
                  <p className="text-gray-900">{evaluationTypeLabels[selectedEvaluation.type]}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Fecha</Label>
                  <p className="text-gray-900">{selectedEvaluation.evaluationDate && new Date(selectedEvaluation.evaluationDate).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">Criterios de Evaluación</Label>
                <div className="space-y-2">
                  {selectedEvaluation.criteria.map((criterio: EvaluationCriterion, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <span className="text-gray-900 font-medium">{criterio.name}</span>
                      <span className={`font-semibold ${
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

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <Label className="text-sm font-medium text-blue-900">Nota Promedio</Label>
                <p className="text-3xl font-bold text-blue-900 mt-1">{selectedEvaluation.average.toFixed(1)}/20</p>
              </div>

              {selectedEvaluation.comments && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Comentarios</Label>
                  <p className="text-gray-900 p-3 bg-gray-50 rounded-lg border border-gray-200">{selectedEvaluation.comments}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setOpenViewDialog(false)} className="bg-blue-800 hover:bg-blue-900">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
