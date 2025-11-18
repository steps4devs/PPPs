import { useState, useEffect, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Search, Plus, Edit, Trash2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.service';
import type { TutorProfile, Career } from '../../types';

export function TutorManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTutor, setEditingTutor] = useState<TutorProfile | null>(null);
  const [expandedTutor, setExpandedTutor] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    specialty: '',
    maxStudents: 10,
    careerId: 0,
  });

  useEffect(() => {
    loadTutors();
    loadCareers();
  }, []);

  const loadTutors = async () => {
    setIsLoading(true);
    try {
      const data: any = await adminService.getAllTutors();
      // El backend puede devolver diferentes formatos
      const tutorsData = Array.isArray(data) ? data : (data.content || data.data || []);
      setTutors(tutorsData);
    } catch (error: any) {
      toast.error('Error al cargar tutores');
      console.error(error);
      setTutors([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoading(false);
    }
  };

  const loadCareers = async () => {
    try {
      const careersData = await adminService.getAllCareers();
      setCareers(careersData);
    } catch (error: any) {
      console.error('Error al cargar carreras:', error);
      toast.error('Error al cargar carreras');
      setCareers([]);
    }
  };

  const handleEdit = (tutor: TutorProfile): void => {
    setEditingTutor(tutor);
    setFormData({
      username: tutor.username || '',
      email: tutor.email || '',
      password: '', // No precargamos password por seguridad
      nombre: tutor.nombre || '',
      apellido: tutor.apellido || '',
      specialty: tutor.specialty || '',
      maxStudents: tutor.maxStudents || 10,
      careerId: tutor.careerId || 0,
    });
    setOpenDialog(true);
  };

  const handleSaveTutor = async () => {
    try {
      // Validaciones
      if (!formData.nombre?.trim()) {
        toast.error('El nombre es obligatorio');
        return;
      }
      if (!formData.apellido?.trim()) {
        toast.error('El apellido es obligatorio');
        return;
      }
      if (!formData.email?.trim()) {
        toast.error('El email es obligatorio');
        return;
      }
      if (!formData.specialty?.trim()) {
        toast.error('La especialidad es obligatoria');
        return;
      }
      if (!formData.maxStudents || formData.maxStudents < 1) {
        toast.error('El máximo de estudiantes debe ser al menos 1');
        return;
      }

      if (editingTutor) {
        // Actualizar tutor existente
        const updateData: any = {
          specialty: formData.specialty.trim(),
          maxStudents: formData.maxStudents,
          careerId: formData.careerId > 0 ? formData.careerId : undefined,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
        };
        
        await adminService.updateTutor(editingTutor.id, updateData);
        toast.success('Tutor actualizado exitosamente');
      } else {
        // Validaciones adicionales para creación
        if (!formData.username?.trim()) {
          toast.error('El nombre de usuario es obligatorio');
          return;
        }
        if (!formData.password?.trim()) {
          toast.error('La contraseña es obligatoria');
          return;
        }
        if (formData.password.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
          return;
        }

        // Crear nuevo tutor
        const createData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          specialty: formData.specialty.trim(),
          maxStudents: formData.maxStudents,
          careerId: formData.careerId > 0 ? formData.careerId : undefined,
        };
        
        await adminService.createTutor(createData);
        toast.success('Tutor creado exitosamente');
      }
      
      handleCloseDialog();
      loadTutors();
    } catch (error: any) {
      toast.error(error.message || `Error al ${editingTutor ? 'actualizar' : 'crear'} tutor`);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTutor(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      specialty: '',
      maxStudents: 10,
      careerId: 0,
    });
  };

  const handleDelete = async (tutorId: number, tutorName: string) => {
    if (!confirm(`¿Desactivar al tutor ${tutorName}?`)) {
      return;
    }
    
    try {
      await adminService.deleteTutor(tutorId);
      toast.success('Tutor desactivado exitosamente');
      loadTutors();
    } catch (error: any) {
      // Mostrar el mensaje de error específico del backend
      const errorMessage = error.message || 'Error al desactivar tutor';
      if (errorMessage.includes('estudiante')) {
        toast.error(errorMessage, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
      console.error('Error al desactivar tutor:', error);
    }
  };

  const activateTutor = async (tutorId: number, tutorName: string) => {
    if (!confirm(`¿Activar al tutor ${tutorName}?`)) {
      return;
    }
    
    try {
      await adminService.activateTutor(tutorId);
      toast.success('Tutor activado exitosamente');
      loadTutors();
    } catch (error: any) {
      const errorMessage = error.message || 'Error al activar tutor';
      toast.error(errorMessage);
      console.error('Error al activar tutor:', error);
    }
  };

  const filteredTutors = Array.isArray(tutors) ? tutors.filter(tutor =>
    tutor.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tutor.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Gestión de Tutores</h1>
            <p className="text-gray-600">Administra tutores y sus especializaciones</p>
          </div>
          <Button 
            className="bg-blue-800 hover:bg-blue-900"
            onClick={() => setOpenDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tutor
          </Button>
        </div>

      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTutor ? 'Editar Tutor' : 'Agregar Tutor'}</DialogTitle>
            <DialogDescription>
              {editingTutor ? 'Actualiza la información del tutor' : 'Completa la información del nuevo tutor'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleSaveTutor(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                  <Input 
                    id="nombre" 
                    placeholder="Ej: Roberto" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido <span className="text-red-500">*</span></Label>
                  <Input 
                    id="apellido" 
                    placeholder="Ej: Gómez Silva" 
                    value={formData.apellido}
                    onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Usuario <span className="text-red-500">*</span></Label>
                <Input 
                  id="username" 
                  placeholder="Ej: rgomez" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!editingTutor}
                  className={editingTutor ? "bg-gray-100 cursor-not-allowed" : ""}
                  required={!editingTutor}
                />
                {editingTutor && (
                  <p className="text-xs text-gray-500">El nombre de usuario no puede modificarse</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="tutor@universidad.edu" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              {/* Campo contraseña solo visible al CREAR (no al editar) */}
              {!editingTutor && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña <span className="text-red-500">*</span></Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad <span className="text-red-500">*</span></Label>
                <Input 
                  id="specialty" 
                  placeholder="Ej: Desarrollo de Software" 
                  value={formData.specialty}
                  onChange={(e) => setFormData({...formData, specialty: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Máximo de Estudiantes <span className="text-red-500">*</span></Label>
                <Input 
                  id="maxStudents" 
                  type="number" 
                  min="1" 
                  max="50"
                  value={formData.maxStudents}
                  onChange={(e) => setFormData({...formData, maxStudents: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">Carrera (Opcional)</Label>
                <Select 
                  value={formData.careerId > 0 ? formData.careerId.toString() : "0"} 
                  onValueChange={(value: string) => setFormData({...formData, careerId: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Sin carrera específica</SelectItem>
                    {careers.map((career) => (
                      <SelectItem key={career.id} value={career.id.toString()}>
                        {career.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </form>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleCloseDialog} type="button">
                Cancelar
              </Button>
              <Button 
                className="bg-blue-800 hover:bg-blue-900" 
                onClick={handleSaveTutor}
                type="button"
              >
                {editingTutor ? 'Actualizar' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tutores</CardTitle>
          <CardDescription>
            {filteredTutors.length} tutor{filteredTutors.length !== 1 ? 'es' : ''} encontrado{filteredTutors.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, email o especialidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Estudiantes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Cargando tutores...
                    </TableCell>
                  </TableRow>
                ) : filteredTutors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No se encontraron tutores
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTutors.map((tutor) => (
                    <Fragment key={tutor.id}>
                      <TableRow>
                        <TableCell className="font-medium">{tutor.nombre} {tutor.apellido}</TableCell>
                        <TableCell>{tutor.email}</TableCell>
                        <TableCell>{tutor.specialty}</TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {tutor.careerName || 'Todas las carreras'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">
                              {tutor.students?.length || 0}/{tutor.maxStudents || 0}
                            </span>
                            {tutor.students && tutor.students.length > 0 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedTutor(expandedTutor === tutor.id ? null : tutor.id)}
                              >
                                {expandedTutor === tutor.id ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            style={{ 
                              backgroundColor: tutor.activo === false ? '#dc2626' : '#059669',
                              color: 'white'
                            }}
                          >
                            {tutor.activo === false ? 'Inactivo' : 'Activo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Botón Editar - solo si está ACTIVO */}
                            {tutor.activo !== false && (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="w-9 h-9"
                                onClick={() => handleEdit(tutor)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )}
                            
                            {/* Botón Desactivar/Activar según estado */}
                            {tutor.activo === false ? (
                              // Si está inactivo, mostrar botón Activar
                              <Button 
                                variant="ghost" 
                                size="icon"
                                style={{ color: '#059669' }}
                                className="w-9 h-9 hover:text-white hover:bg-emerald-600 transition-all"
                                onClick={() => activateTutor(tutor.id, `${tutor.nombre} ${tutor.apellido}`)}
                                title="Activar tutor"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            ) : (
                              // Si está activo, mostrar botón Desactivar SOLO si NO tiene estudiantes
                              tutor.students && tutor.students.length > 0 ? null : (
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  className="w-9 h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(tutor.id, `${tutor.nombre} ${tutor.apellido}`)}
                                  title="Desactivar tutor"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      
                      {/* Fila expandible con estudiantes */}
                      {expandedTutor === tutor.id && tutor.students && tutor.students.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="bg-gray-50">
                            <div className="p-4">
                              <h4 className="font-semibold mb-3 text-sm text-gray-700">Estudiantes Asignados:</h4>
                              <div className="space-y-2">
                                {tutor.students.map((student) => (
                                  <div key={student.id} className="flex items-center gap-4 text-sm bg-white p-3 rounded border border-gray-200">
                                    <span className="font-mono text-blue-600 font-medium">{student.code}</span>
                                    <span className="font-semibold text-gray-800">{student.fullName}</span>
                                    <span className="text-gray-600">• {student.career}</span>
                                    <span className="text-gray-500">• Semestre {student.semester}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      </div>
    </>
  );
}
