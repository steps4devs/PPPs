import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Search, ChevronRight, Loader2 } from 'lucide-react';
import { getMyAssignedStudents } from '../../services/tutorService';
import { AssignedStudent } from '../../types/tutor';
import { toast } from 'sonner';

interface StudentListProps {
  onSelectStudent: (id: number) => void;
}

export function StudentList({ onSelectStudent }: StudentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await getMyAssignedStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Error al cargar estudiantes');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const searchLower = searchQuery.toLowerCase();
    const studentName = student.student?.name?.toLowerCase() || '';
    const studentCode = student.student?.studentCode?.toLowerCase() || '';
    const company = student.company?.toLowerCase() || '';
    
    return studentName.includes(searchLower) ||
           studentCode.includes(searchLower) ||
           company.includes(searchLower);
  });

  const getStatusBadge = (status: string | null) => {
    if (!status) return <Badge variant="secondary">Sin plan</Badge>;
    
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-600">Aprobado</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="secondary" className="bg-amber-600 text-white">En revisión</Badge>;
      case 'DRAFT':
        return <Badge variant="secondary">Borrador</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rechazado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
      <div>
        <h1 className="text-gray-900 mb-1">Mis Estudiantes</h1>
        <p className="text-gray-600">Gestiona y supervisa a tus estudiantes asignados</p>
      </div>

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
              placeholder="Buscar por nombre, código o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Estudiante</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado Plan</TableHead>
                  <TableHead>Horas Pendientes</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No se encontraron estudiantes
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell>{student.student?.name || 'N/A'}</TableCell>
                      <TableCell>{student.student?.studentCode || 'N/A'}</TableCell>
                      <TableCell>{student.company || 'Sin empresa'}</TableCell>
                      <TableCell>{getStatusBadge(student.planStatus)}</TableCell>
                      <TableCell>
                        {student.pendingHours > 0 ? (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                            {student.pendingHours} pendientes
                          </Badge>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectStudent(student.student?.id || 0)}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
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
  );
}
