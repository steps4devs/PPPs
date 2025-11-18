import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Search, Plus, Edit, UserPlus, Trash2, UserMinus, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.service';
import type { StudentProfile, TutorProfile, Career } from '../../types';

export function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [assignDialog, setAssignDialog] = useState<number | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [selectedTutor, setSelectedTutor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    code: '',
    careerId: 0,
    semester: 8,
    phone: '',
  });

  useEffect(() => {
    loadStudents();
    loadTutors();
    loadCareers();
  }, [currentPage, searchQuery]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const response = await adminService.getAllStudents(currentPage, 20, searchQuery || undefined);
      // El backend devuelve PageResponse con estructura {data, currentPage, totalPages, totalItems}
      const studentsData = Array.isArray(response) ? response : (response.content || (response as any).data || []);
      setStudents(studentsData);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error('Error al cargar estudiantes');
      console.error(error);
      setStudents([]); // Asegurar que siempre sea un array
    } finally {
      setIsLoading(false);
    }
  };

  const loadTutors = async () => {
    try {
      const response: any = await adminService.getAllTutors();
      // El backend devuelve PageResponse<TutorProfile>
      const tutorsData = Array.isArray(response) ? response : (response.data || []);
      setTutors(tutorsData);
    } catch (error: any) {
      console.error('Error al cargar tutores:', error);
      setTutors([]); // Asegurar que siempre sea un array
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

  const handleEdit = (student: StudentProfile) => {
    setEditingStudent(student);
    setFormData({
      username: student.username,
      email: student.email,
      password: '', // No mostrar contraseña existente
      nombre: student.nombre,
      apellido: student.apellido,
      code: student.code,
      careerId: student.careerId || 0,
      semester: student.semester,
      phone: student.phone || '',
    });
    setOpenDialog(true);
  };

  const handleSaveStudent = async () => {
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
      if (!formData.code?.trim()) {
        toast.error('El código de estudiante es obligatorio');
        return;
      }
      if (!formData.careerId || formData.careerId === 0) {
        toast.error('La carrera es obligatoria');
        return;
      }
      if (!formData.semester || formData.semester < 1) {
        toast.error('El semestre debe ser al menos 1');
        return;
      }

      if (editingStudent) {
        // Modo edición
        const updateData: any = {
          code: formData.code.trim(),
          careerId: formData.careerId,
          semester: formData.semester,
          phone: formData.phone?.trim() || undefined,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
        };
        
        // Solo enviar password si se cambió
        if (formData.password?.trim()) {
          if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres');
            return;
          }
          updateData.password = formData.password;
        }
        
        await adminService.updateStudent(editingStudent.id, updateData);
        toast.success('Estudiante actualizado exitosamente');
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

        // Modo creación
        const createData = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          code: formData.code.trim(),
          careerId: formData.careerId,
          semester: formData.semester,
          phone: formData.phone?.trim() || undefined,
        };
        
        await adminService.createStudent(createData);
        toast.success('Estudiante creado exitosamente');
      }
      
      setOpenDialog(false);
      setEditingStudent(null);
      loadStudents();
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        code: '',
        careerId: 0,
        semester: 8,
        phone: '',
      });
    } catch (error: any) {
      toast.error(error.message || `Error al ${editingStudent ? 'actualizar' : 'crear'} estudiante`);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingStudent(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre: '',
      apellido: '',
      code: '',
      careerId: 0,
      semester: 8,
      phone: '',
    });
  };

  const filteredStudents = Array.isArray(students) ? students : [];

  const assignTutor = async (studentId: number) => {
    try {
      if (!selectedTutor) {
        toast.error('Selecciona un tutor');
        return;
      }

      // El periodo se asigna automáticamente (el que esté abierto)
      await adminService.createAssignment({
        studentId: studentId,
        tutorId: parseInt(selectedTutor)
        // periodId se omite - el backend usa el periodo activo
      });
      
      toast.success('Tutor asignado exitosamente al periodo activo');
      setAssignDialog(null);
      setSelectedTutor('');
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Error al asignar tutor');
    }
  };

  const handleUnassign = async (student: StudentProfile) => {
    if (!confirm(`¿Desasignar tutor de ${student.nombre} ${student.apellido}?`)) {
      return;
    }
    
    try {
      if (!student.assignmentId) {
        toast.error('No se encontró asignación activa para este estudiante');
        return;
      }

      await adminService.deleteAssignment(student.assignmentId);
      toast.success('Tutor desasignado exitosamente');
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Error al desasignar tutor');
    }
  };

  const deleteStudent = async (studentId: number, studentName: string) => {
    if (!confirm(`¿Desactivar al estudiante ${studentName}? (El usuario quedará inactivo)`)) {
      return;
    }
    
    try {
      await adminService.deleteStudent(studentId);
      toast.success('Estudiante desactivado exitosamente');
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar estudiante');
    }
  };

  const activateStudent = async (studentId: number, studentName: string) => {
    if (!confirm(`¿Activar al estudiante ${studentName}?`)) {
      return;
    }
    
    try {
      await adminService.activateStudent(studentId);
      toast.success('Estudiante activado exitosamente');
      loadStudents();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar estudiante');
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-gray-900 mb-1">Gestión de Estudiantes</h1>
            <p className="text-gray-600">Administra estudiantes y asigna tutores</p>
          </div>
          <Button 
            className="bg-blue-800 hover:bg-blue-900"
            onClick={() => setOpenDialog(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Estudiante
          </Button>
        </div>

      <Dialog open={openDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}</DialogTitle>
              <DialogDescription>
                {editingStudent ? 'Actualiza la información del estudiante' : 'Completa la información del nuevo estudiante'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre <span className="text-red-500">*</span></Label>
                  <Input 
                    id="nombre" 
                    placeholder="Ej: Juan" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apellido">Apellido <span className="text-red-500">*</span></Label>
                  <Input 
                    id="apellido" 
                    placeholder="Ej: Pérez García" 
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
                  placeholder="Ej: jperez" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  disabled={!!editingStudent}
                  className={editingStudent ? "bg-gray-100 cursor-not-allowed" : ""}
                  required={!editingStudent}
                />
                {editingStudent && (
                  <p className="text-xs text-gray-500">El nombre de usuario no puede modificarse</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="estudiante@universidad.edu" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              
              {/* Campo contraseña solo visible al CREAR (no al editar) */}
              {!editingStudent && (
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
                <Label htmlFor="codigo">Código <span className="text-red-500">*</span></Label>
                <Input 
                  id="codigo" 
                  placeholder="Ej: E20201234" 
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="career">Carrera <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.careerId.toString()} 
                  onValueChange={(value: string) => setFormData({...formData, careerId: parseInt(value)})}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una carrera" />
                  </SelectTrigger>
                  <SelectContent>
                    {careers.map((career) => (
                      <SelectItem key={career.id} value={career.id.toString()}>
                        {career.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Ciclo <span className="text-red-500">*</span></Label>
                  <Input 
                    id="semester" 
                    type="number" 
                    min="1" 
                    max="12"
                    value={formData.semester}
                    onChange={(e) => setFormData({...formData, semester: parseInt(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono (opcional)</Label>
                  <Input 
                    id="phone" 
                    placeholder="987654321" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-blue-800 hover:bg-blue-900" onClick={handleSaveStudent}>
                  {editingStudent ? 'Actualizar' : 'Guardar'}
                </Button>
                <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Estudiantes</CardTitle>
          <CardDescription>
            {filteredStudents.length} estudiante{filteredStudents.length !== 1 ? 's' : ''} encontrado{filteredStudents.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, código o email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Carrera</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Cargando estudiantes...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No se encontraron estudiantes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium">{student.nombre} {student.apellido}</div>
                      </TableCell>
                      <TableCell>{student.code}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.careerName || '-'}</TableCell>
                      <TableCell>{student.semester || '-'}</TableCell>
                      <TableCell>
                        {student.tutorName || (
                          <Badge variant="secondary">Sin asignar</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: student.activo === false ? '#dc2626' : '#059669',
                            color: 'white'
                          }}
                        >
                          {student.activo === false ? 'Inactivo' : 'Activo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Solo mostrar botones de asignación si el estudiante está ACTIVO */}
                          {student.activo !== false && (
                            <>
                              {student.tutorId ? (
                                // Si ya tiene tutor asignado, mostrar botón Desasignar (naranja con texto blanco)
                                <Button 
                                  size="sm"
                                  style={{ 
                                    backgroundColor: '#f97316', 
                                    color: 'white', 
                                    borderColor: '#f97316'                                   
                                  }}
                                  className="hover:opacity-90"
                                  onClick={() => handleUnassign(student)}
                                >
                                  <UserMinus className="w-4 h-4 mr-1" />
                                  Desasignar
                                </Button>
                              ) : (
                                // Si no tiene tutor, mostrar diálogo para asignar (verde)
                                <Dialog open={assignDialog === student.id} onOpenChange={(open: boolean) => setAssignDialog(open ? student.id : null)}>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-green-300 text-green-700 hover:bg-green-50"
                                    >
                                      <UserPlus className="w-4 h-4 mr-1" />
                                      Asignar
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Asignar Tutor</DialogTitle>
                                      <DialogDescription>
                                        Selecciona un tutor para {student.nombre} {student.apellido}. Se asignará al periodo académico activo.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="space-y-2">
                                        <Label htmlFor="tutor">Tutor</Label>
                                        <Select value={selectedTutor} onValueChange={setSelectedTutor}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar tutor" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {tutors.map((tutor) => (
                                              <SelectItem key={tutor.id} value={tutor.id.toString()}>
                                                {tutor.nombre} {tutor.apellido} - {tutor.specialty}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <Button 
                                        onClick={() => assignTutor(student.id)}
                                        className="w-full bg-blue-800 hover:bg-blue-900"
                                        disabled={!selectedTutor}
                                      >
                                        Asignar
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </>
                          )}
                          
                          {/* Botón Editar - solo si está ACTIVO */}
                          {student.activo !== false && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="w-9 h-9"
                              onClick={() => handleEdit(student)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {/* Botón Desactivar/Activar según estado */}
                          {student.activo === false ? (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              style={{ color: '#059669' }}
                              className="w-9 h-9 hover:text-white hover:bg-emerald-600 transition-all"
                              onClick={() => activateStudent(student.id, `${student.nombre} ${student.apellido}`)}
                              title="Activar estudiante"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="w-9 h-9 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => deleteStudent(student.id, `${student.nombre} ${student.apellido}`)}
                              title="Desactivar estudiante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
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
      </div>
    </>
  );
}
