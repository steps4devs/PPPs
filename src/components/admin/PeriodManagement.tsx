import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Plus, Play, Pause, Edit } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.service';
import type { Period } from '../../types';

export function PeriodManagement() {
  const [openDialog, setOpenDialog] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    quota: 0,
    open: true
  });

  useEffect(() => {
    loadPeriods();
  }, []);

  const loadPeriods = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllPeriods();
      setPeriods(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error('Error al cargar períodos');
      console.error(error);
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (period: Period) => {
    setEditingPeriod(period);
    setFormData({
      name: period.name,
      startDate: period.startDate,
      endDate: period.endDate,
      quota: period.quota,
      open: period.open
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPeriod(null);
    setFormData({
      name: '',
      startDate: '',
      endDate: '',
      quota: 0,
      open: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (editingPeriod) {
        await adminService.updatePeriod(editingPeriod.id, formData);
        toast.success('Período actualizado exitosamente');
      } else {
        await adminService.createPeriod(formData);
        toast.success('Período creado exitosamente');
      }
      await loadPeriods();
      handleCloseDialog();
    } catch (error: any) {
      toast.error(error.message || `Error al ${editingPeriod ? 'actualizar' : 'crear'} período`);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePeriod = async (period: Period) => {
    try {
      if (period.open) {
        await adminService.closePeriod(period.id);
        toast.success('Período cerrado exitosamente');
      } else {
        await adminService.openPeriod(period.id);
        toast.success('Período abierto exitosamente');
      }
      await loadPeriods();
    } catch (error: any) {
      toast.error(error.message || `Error al ${period.open ? 'cerrar' : 'abrir'} período`);
    }
  };

  // Calcular estadísticas
  const activePeriods = periods.filter(p => p.open).length;
  const totalEnrolled = periods.reduce((acc, p) => acc + (p.enrolled || 0), 0);
  const availableQuota = periods
    .filter(p => p.open)
    .reduce((acc, p) => acc + (p.quota - (p.enrolled || 0)), 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Gestión de Periodos</h1>
          <p className="text-gray-600">Administra periodos académicos y convocatorias</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-900">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Periodo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingPeriod ? 'Editar Período' : 'Crear Período'}</DialogTitle>
              <DialogDescription>
                {editingPeriod ? 'Actualiza la información del período' : 'Completa la información del nuevo período académico'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Periodo</Label>
                <Input
                  id="name"
                  placeholder="Ej: 2025-II"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha Inicio</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha Fin</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quota">Cupos Disponibles</Label>
                <Input
                  id="quota"
                  type="number"
                  placeholder="Ej: 150"
                  min="1"
                  value={formData.quota}
                  onChange={(e) => setFormData({ ...formData, quota: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={loading}>
                  {loading ? 'Guardando...' : (editingPeriod ? 'Actualizar' : 'Guardar')}
                </Button>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Periodos Activos</p>
              <p className="text-3xl text-blue-800">{activePeriods}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Estudiantes Inscritos</p>
              <p className="text-3xl text-emerald-600">{totalEnrolled}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Cupos Disponibles</p>
              <p className="text-3xl text-purple-600">{availableQuota}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Periodos</CardTitle>
          <CardDescription>Todos los periodos académicos registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Fecha Inicio</TableHead>
                  <TableHead>Fecha Fin</TableHead>
                  <TableHead>Inscritos / Cupos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Cargando períodos...
                    </TableCell>
                  </TableRow>
                ) : periods.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No hay períodos registrados
                    </TableCell>
                  </TableRow>
                ) : (
                  periods.map((period) => (
                    <TableRow key={period.id}>
                      <TableCell>{period.name}</TableCell>
                      <TableCell>{formatDate(period.startDate)}</TableCell>
                      <TableCell>{formatDate(period.endDate)}</TableCell>
                      <TableCell>
                        <span className={(period.enrolled || 0) >= period.quota ? 'text-red-600' : 'text-gray-900'}>
                          {period.enrolled || 0} / {period.quota}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          style={{ 
                            backgroundColor: period.open ? '#059669' : '#6b7280',
                            color: 'white'
                          }}
                        >
                          {period.open ? 'Abierto' : 'Cerrado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTogglePeriod(period)}
                          >
                            {period.open ? (
                              <>
                                <Pause className="w-4 h-4 mr-1" />
                                Cerrar
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Abrir
                              </>
                            )}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(period)}>
                            <Edit className="w-4 h-4" />
                          </Button>
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
  );
}
