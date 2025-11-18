import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, FileText, Download, Trash2, Loader2, FolderOpen, File } from 'lucide-react';
import { toast } from 'sonner';
import { getMyEvidences, uploadEvidence, deleteEvidence, downloadEvidence, getMyPlans } from '../../services/studentService';
import { Evidence, Plan } from '../../types/student';

export function EvidenceList() {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');

  useEffect(() => {
    loadEvidences();
    loadPlans();
  }, []);

  const loadEvidences = async () => {
    try {
      setLoading(true);
      const data = await getMyEvidences();
      setEvidences(data);
    } catch (error) {
      console.error('Error loading evidences:', error);
      toast.error('Error al cargar evidencias');
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await getMyPlans();
      // Filtrar solo planes APROBADOS
      const approvedPlans = data.filter(p => p.status === 'APPROVED');
      setPlans(approvedPlans);
    } catch (error) {
      console.error('Error loading plans:', error);
      toast.error('Error al cargar planes');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo');
      return;
    }

    if (!description.trim()) {
      toast.error('Agrega una descripción');
      return;
    }

    if (!selectedPlanId) {
      toast.error('Selecciona un plan');
      return;
    }

    try {
      setUploading(true);
      await uploadEvidence(selectedFile, description, Number(selectedPlanId));
      toast.success('Evidencia subida exitosamente');
      setSelectedFile(null);
      setDescription('');
      setSelectedPlanId('');
      setOpen(false);
      loadEvidences();
    } catch (error: any) {
      console.error('Error uploading evidence:', error);
      toast.error(error.response?.data?.message || 'Error al subir evidencia');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: number, originalFilename: string) => {
    try {
      const blob = await downloadEvidence(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Descarga iniciada');
    } catch (error: any) {
      console.error('Error downloading evidence:', error);
      toast.error('Error al descargar archivo');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta evidencia?')) return;

    try {
      await deleteEvidence(id);
      toast.success('Evidencia eliminada');
      loadEvidences();
    } catch (error: any) {
      console.error('Error deleting evidence:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar evidencia');
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      PENDING: { label: 'Pendiente', className: 'bg-amber-100 text-amber-800' },
      APPROVED: { label: 'Aprobado', className: 'bg-emerald-100 text-emerald-800' },
      REJECTED: { label: 'Rechazado', className: 'bg-red-100 text-red-800' },
    };
    const statusConfig = config[status as keyof typeof config] || config.PENDING;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Evidencias</h1>
          <p className="text-gray-600">Gestiona tus archivos y documentos de prácticas</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-800 hover:bg-blue-900">
              <Upload className="w-4 h-4 mr-2" />
              Subir Evidencia
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Subir Evidencia</DialogTitle>
              <DialogDescription>
                Sube documentos, imágenes o archivos relacionados a tus prácticas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="planPractica">Plan de Práctica <span className="text-red-600">*</span></Label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger id="planPractica">
                    <SelectValue placeholder="Selecciona un plan aprobado" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.length === 0 ? (
                      <SelectItem value="none" disabled>No tienes planes aprobados</SelectItem>
                    ) : (
                      plans.map(plan => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.company.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="archivo">Archivo <span className="text-red-600">*</span></Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-800 transition-colors">
                  <Input
                    id="archivo"
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.jpg,.jpeg,.png"
                  />
                  <label htmlFor="archivo" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <File className="w-5 h-5 text-blue-800" />
                        <span className="text-sm text-gray-900">{selectedFile.name}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Seleccionar archivo</p>
                        <p className="text-xs text-gray-500 mt-1">Sin archivos seleccionados</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción <span className="text-red-600">*</span></Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe el contenido del archivo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setOpen(false);
                    setSelectedFile(null);
                    setDescription('');
                    setSelectedPlanId('');
                  }}
                  disabled={uploading}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpload} 
                  className="bg-blue-800 hover:bg-blue-900" 
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    'Subir'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Archivos Subidos</CardTitle>
          <CardDescription>Total: {evidences.length} evidencia{evidences.length !== 1 ? 's' : ''}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
            </div>
          ) : evidences.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-gray-900 mb-2">No hay evidencias aún</h3>
              <p className="text-gray-600 mb-6">Sube documentos relacionados a tus prácticas</p>
              <Button onClick={() => setOpen(true)} className="bg-blue-800 hover:bg-blue-900">
                Subir Primera Evidencia
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Subida</TableHead>
                    <TableHead>Revisado Por</TableHead>
                    <TableHead>Fecha Revisión</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidences.map((evidence) => (
                    <TableRow key={evidence.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <File className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate" title={evidence.originalFilename}>
                              {evidence.originalFilename}
                            </p>
                            <p className="text-xs text-gray-500">{evidence.fileType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {evidence.plan?.companyName || '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(evidence.status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(evidence.uploadedAt).toLocaleDateString('es-PE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {evidence.reviewedBy?.name || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {evidence.reviewedAt 
                          ? new Date(evidence.reviewedAt).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(evidence.id, evidence.originalFilename)}
                            title="Descargar"
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                          </Button>
                          {evidence.status === 'PENDING' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(evidence.id)}
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
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
