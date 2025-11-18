import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Plus, Clock, AlertCircle, Loader2, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { getMyTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry, getDashboardStats } from '../../services/studentService';
import { TimeEntry } from '../../types/student';

interface TimeLogTableProps {
  onUpdate: () => void;
}

export function TimeLogTable({ onUpdate }: TimeLogTableProps) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [hasAssignment, setHasAssignment] = useState(false);
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    description: ''
  });

  const [calculatedHours, setCalculatedHours] = useState<number>(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, statsData] = await Promise.all([
        getMyTimeEntries(),
        getDashboardStats()
      ]);
      setTimeEntries(entriesData);
      setHasAssignment(statsData.hasAssignedTutor);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const [startHour, startMin] = formData.startTime.split(':').map(Number);
      const [endHour, endMin] = formData.endTime.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMin;
      const endInMinutes = endHour * 60 + endMin;
      const diffInMinutes = endInMinutes - startInMinutes;
      
      if (diffInMinutes > 0) {
        setCalculatedHours(Number((diffInMinutes / 60).toFixed(2)));
      } else {
        setCalculatedHours(0);
      }
    }
  }, [formData.startTime, formData.endTime]);

  const loadTimeEntries = async () => {
    try {
      setLoading(true);
      const data = await getMyTimeEntries();
      setTimeEntries(data);
    } catch (error) {
      console.error('Error loading time entries:', error);
      toast.error('Error al cargar registros de horas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasAssignment) {
      toast.error('Necesitas tener un tutor asignado primero');
      return;
    }

    if (!formData.date || !formData.startTime || !formData.endTime || !formData.description) {
      toast.error('Completa todos los campos');
      return;
    }

    if (calculatedHours <= 0) {
      toast.error('La hora de salida debe ser posterior a la hora de entrada');
      return;
    }

    if (calculatedHours > 12) {
      toast.error('No puedes registrar más de 12 horas en un día');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (formData.date > today) {
      toast.error('No puedes registrar horas futuras');
      return;
    }

    try {
      setSubmitting(true);
      const data = {
        entryDate: formData.date,
        startTime: formData.startTime + ':00',
        endTime: formData.endTime + ':00',
        activity: formData.description
      };

      if (editingEntry) {
        await updateTimeEntry(editingEntry.id, data);
        toast.success('Registro actualizado exitosamente');
      } else {
        await createTimeEntry(data);
        toast.success('Horas registradas exitosamente');
      }

      setFormData({ date: '', startTime: '', endTime: '', description: '' });
      setCalculatedHours(0);
      setEditingEntry(null);
      setOpen(false);
      loadData();
      onUpdate();
    } catch (error: any) {
      console.error('Error saving time entry:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el registro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setFormData({
      date: entry.entryDate,
      startTime: entry.startTime.substring(0, 5),
      endTime: entry.endTime.substring(0, 5),
      description: entry.activity
    });
    setOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return;

    try {
      await deleteTimeEntry(id);
      toast.success('Registro eliminado');
      loadData();
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting time entry:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar registro');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-emerald-600">Aprobado</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Rechazado</Badge>;
      case 'PENDING':
        return <Badge variant="secondary" className="bg-amber-600 text-white">Pendiente</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  const totalHours = timeEntries
    .filter(e => e.status === 'APPROVED')
    .reduce((acc, e) => acc + e.hours, 0);

  if (!hasAssignment) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-gray-900 mb-2">No tienes un tutor asignado</h3>
          <p className="text-gray-600">Primero debes esperar a que te asignen un tutor</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Bitácora de Horas</h1>
          <p className="text-gray-600">Registra y gestiona tus horas de prácticas</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingEntry(null);
            setFormData({ date: '', startTime: '', endTime: '', description: '' });
            setCalculatedHours(0);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-900">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Horas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Editar Registro' : 'Registrar Horas'}</DialogTitle>
              <DialogDescription>Completa la información de tu jornada</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Hora Inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">Hora Fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Actividad Realizada</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe las actividades realizadas..."
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editingEntry ? 'Actualizando...' : 'Guardando...'}
                    </>
                  ) : (
                    editingEntry ? 'Actualizar' : 'Guardar'
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => {
                  setOpen(false);
                  setEditingEntry(null);
                  setFormData({ date: '', startTime: '', endTime: '', description: '' });
                  setCalculatedHours(0);
                }} disabled={submitting}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registro de Horas</CardTitle>
              <CardDescription>Historial completo de tus horas de prácticas</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total aprobado</p>
              <p className="text-2xl font-bold text-blue-800">{totalHours.toFixed(1)} hrs</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
            </div>
          ) : timeEntries.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-gray-900 mb-2">No hay registros aún</h3>
              <p className="text-gray-600 mb-6">Comienza a registrar tus horas de prácticas</p>
              <Button onClick={() => setOpen(true)} className="bg-blue-800 hover:bg-blue-900">
                Registrar Primera Jornada
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Horas</TableHead>
                    <TableHead>Actividades</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{new Date(entry.entryDate).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>{entry.startTime?.substring(0, 5) || '-'}</TableCell>
                      <TableCell>{entry.endTime?.substring(0, 5) || '-'}</TableCell>
                      <TableCell>{entry.hours} hrs</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.activity}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        {entry.status === 'PENDING' ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(entry)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
