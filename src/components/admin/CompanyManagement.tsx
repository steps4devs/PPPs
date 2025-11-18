import { useState, useEffect, Fragment } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronRight, Ban, CheckCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../services/admin.service';
import type { CompanyProfile, AgreementBasic } from '../../types';

interface AgreementFormData {
  agreementNumber: string;
  startDate: string;
  endDate: string;
  description: string;
  documentUrl?: string;
}

export function CompanyManagement() {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCompanyDialog, setOpenCompanyDialog] = useState(false);
  const [openAgreementDialog, setOpenAgreementDialog] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyProfile | null>(null);
  const [editingAgreement, setEditingAgreement] = useState<AgreementBasic | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const [companyFormData, setCompanyFormData] = useState({
    companyName: '',
    ruc: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: ''
  });

  const [agreementFormData, setAgreementFormData] = useState<AgreementFormData>({
    agreementNumber: '',
    startDate: '',
    endDate: '',
    description: '',
    documentUrl: ''
  });

  // Cargar empresas
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const response: any = await adminService.getAllCompanies();
      // El backend devuelve PageResponse con estructura {data, currentPage, totalPages, totalItems}
      const companiesData = Array.isArray(response) ? response : (response.data || []);
      setCompanies(companiesData);
    } catch (error) {
      toast.error('Error al cargar empresas');
      console.error(error);
      setCompanies([]); // Asegurar que siempre sea un array
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = Array.isArray(companies) 
    ? companies.filter(company =>
        company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.ruc.includes(searchQuery)
      )
    : [];

  // ============================================================================
  // COMPANY CRUD
  // ============================================================================

  const handleOpenCompanyDialog = (company?: CompanyProfile) => {
    if (company) {
      setEditingCompany(company);
      setCompanyFormData({
        companyName: company.companyName,
        ruc: company.ruc,
        address: company.address || '',
        phone: company.phone || '',
        email: company.email || '',
        contactPerson: company.contactPerson || ''
      });
    } else {
      setEditingCompany(null);
      setCompanyFormData({
        companyName: '',
        ruc: '',
        address: '',
        phone: '',
        email: '',
        contactPerson: ''
      });
    }
    setOpenCompanyDialog(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingCompany) {
        await adminService.updateCompany(editingCompany.id, companyFormData);
        toast.success('Empresa actualizada exitosamente');
      } else {
        await adminService.createCompany(companyFormData);
        toast.success('Empresa creada exitosamente');
      }
      await loadCompanies();
      setOpenCompanyDialog(false);
      setEditingCompany(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCompany = async (company: CompanyProfile) => {
    if (!company.active) {
      toast.error('Esta empresa ya está desactivada');
      return;
    }

    // Validación: no se puede desactivar si tiene convenios activos
    const activeAgreements = company.agreements?.filter(a => a.active && a.status !== 'vencido') || [];
    if (activeAgreements.length > 0) {
      toast.error(`No se puede desactivar: tiene ${activeAgreements.length} convenio(s) activo(s)`);
      return;
    }

    try {
      await adminService.deleteCompany(company.id);
      toast.success('Empresa desactivada exitosamente');
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar empresa');
    }
  };

  const handleActivateCompany = async (id: number) => {
    try {
      await adminService.activateCompany(id);
      toast.success('Empresa activada exitosamente');
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Error al activar empresa');
    }
  };

  // ============================================================================
  // AGREEMENT CRUD
  // ============================================================================

  const handleOpenAgreementDialog = (companyId: number, agreement?: AgreementBasic) => {
    setSelectedCompanyId(companyId);
    if (agreement) {
      setEditingAgreement(agreement);
      setAgreementFormData({
        agreementNumber: agreement.agreementNumber,
        startDate: agreement.startDate,
        endDate: agreement.endDate,
        description: '', // No viene en AgreementBasic
        documentUrl: ''
      });
    } else {
      setEditingAgreement(null);
      setAgreementFormData({
        agreementNumber: '',
        startDate: '',
        endDate: '',
        description: '',
        documentUrl: ''
      });
    }
    setOpenAgreementDialog(true);
  };

  const handleSaveAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;

    setLoading(true);
    try {
      const payload = {
        companyId: selectedCompanyId,
        ...agreementFormData
      };

      if (editingAgreement) {
        await adminService.updateAgreement(editingAgreement.id, payload);
        toast.success('Convenio actualizado exitosamente');
      } else {
        await adminService.createAgreement(payload);
        toast.success('Convenio creado exitosamente');
      }
      await loadCompanies();
      setOpenAgreementDialog(false);
      setEditingAgreement(null);
      setSelectedCompanyId(null);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar convenio');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAgreement = async (agreementId: number) => {
    try {
      await adminService.deleteAgreement(agreementId);
      toast.success('Convenio desactivado exitosamente');
      await loadCompanies();
    } catch (error: any) {
      toast.error(error.message || 'Error al desactivar convenio');
    }
  };

  // ============================================================================
  // EXPANDABLE ROW
  // ============================================================================

  const toggleRow = (companyId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedRows(newExpanded);
  };

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'vigente':
        return (
          <Badge style={{ backgroundColor: '#059669', color: 'white' }}>
            Vigente
          </Badge>
        );
      case 'por_vencer':
        return (
          <Badge style={{ backgroundColor: '#f59e0b', color: 'white' }}>
            Por vencer
          </Badge>
        );
      case 'vencido':
        return (
          <Badge style={{ backgroundColor: '#dc2626', color: 'white' }}>
            Vencido
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading && companies.length === 0) {
    return <div className="flex justify-center items-center h-64">Cargando empresas...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Gestión de Empresas</h1>
            <p className="text-gray-600">Administra empresas y sus convenios</p>
          </div>
          <Button 
            onClick={() => handleOpenCompanyDialog()}
            className="bg-blue-800 hover:bg-blue-900"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Empresa
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Empresas</CardTitle>
            <CardDescription>
              {filteredCompanies.length} empresa{filteredCompanies.length !== 1 ? 's' : ''} encontrada{filteredCompanies.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nombre o RUC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>RUC</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Convenios</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCompanies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        No se encontraron empresas
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCompanies.map((company) => (
                      <Fragment key={company.id}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            {company.agreements && company.agreements.length > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleRow(company.id)}
                                className="h-8 w-8"
                              >
                                {expandedRows.has(company.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </Button>
                            )}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{company.companyName}</div>
                              {company.address && (
                                <div className="text-sm text-gray-500">{company.address}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">{company.ruc}</TableCell>
                          <TableCell>
                            {company.contactPerson && (
                              <div className="text-sm">
                                <div>{company.contactPerson}</div>
                                {company.email && <div className="text-gray-500">{company.email}</div>}
                                {company.phone && <div className="text-gray-500">{company.phone}</div>}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {company.agreements?.length || 0} convenio{company.agreements?.length !== 1 ? 's' : ''}
                              </Badge>
                              {company.agreements && company.agreements.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenAgreementDialog(company.id)}
                                  className="h-8 px-2 text-xs"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Nuevo
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {company.active ? (
                              <Badge style={{ backgroundColor: '#059669', color: 'white' }}>Activo</Badge>
                            ) : (
                              <Badge style={{ backgroundColor: '#dc2626', color: 'white' }}>Inactivo</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenCompanyDialog(company)}
                                className="h-8 w-8"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </Button>
                              
                              {company.active ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCompany(company)}
                                  className="h-8 w-8"
                                  disabled={loading}
                                >
                                  <Ban className="w-4 h-4 text-red-600" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleActivateCompany(company.id)}
                                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                  disabled={loading}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>

                        {/* Fila Expandible - Convenios */}
                        {expandedRows.has(company.id) && company.agreements && company.agreements.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-gray-50 p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-sm text-gray-700">
                                    Convenios de {company.companyName}
                                  </h4>
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenAgreementDialog(company.id)}
                                    className="bg-blue-700 hover:bg-blue-800 h-8"
                                  >
                                    <Plus className="w-3 h-3 mr-1" />
                                    Nuevo Convenio
                                  </Button>
                                </div>
                                
                                <div className="space-y-2">
                                  {company.agreements.map((agreement) => (
                                    <div
                                      key={agreement.id}
                                      className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border shadow-sm"
                                    >
                                      <div className="flex items-center gap-4 flex-1">
                                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <div className="flex items-center gap-4 flex-1">
                                          <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                                            Convenio #{agreement.agreementNumber}
                                          </span>
                                          <span className="font-bold font-size-medium text-gray-700">
                                            • Vigencia: {formatDate(agreement.startDate)} - {formatDate(agreement.endDate)}
                                          </span>
                                        </div>
                                        <div className="flex-shrink-0">
                                          {getStatusBadge(agreement.status)}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => handleOpenAgreementDialog(company.id, agreement)}
                                          className="h-8 w-8"
                                        >
                                          <Edit className="w-4 h-4 text-blue-600" />
                                        </Button>
                                        {agreement.active && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDeleteAgreement(agreement.id)}
                                            className="h-8 w-8"
                                          >
                                            <Ban className="w-4 h-4 text-red-600" />
                                          </Button>
                                        )}
                                      </div>
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

      {/* Dialog Empresa */}
      <Dialog open={openCompanyDialog} onOpenChange={setOpenCompanyDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
            <DialogDescription>
              Completa la información de la empresa
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveCompany} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nombre de la Empresa *</Label>
                <Input
                  id="companyName"
                  placeholder="Ej: Tech Solutions SAC"
                  value={companyFormData.companyName}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, companyName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC *</Label>
                <Input
                  id="ruc"
                  placeholder="20123456789"
                  value={companyFormData.ruc}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, ruc: e.target.value })}
                  maxLength={11}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Av. Principal 123, Lima"
                value={companyFormData.address}
                onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  placeholder="(01) 234-5678"
                  value={companyFormData.phone}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={companyFormData.email}
                  onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Persona de Contacto</Label>
              <Input
                id="contactPerson"
                placeholder="Nombre del contacto principal"
                value={companyFormData.contactPerson}
                onChange={(e) => setCompanyFormData({ ...companyFormData, contactPerson: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenCompanyDialog(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Convenio */}
      <Dialog open={openAgreementDialog} onOpenChange={setOpenAgreementDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAgreement ? 'Editar Convenio' : 'Nuevo Convenio'}</DialogTitle>
            <DialogDescription>
              Completa la información del convenio
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveAgreement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="agreementNumber">Número de Convenio *</Label>
              <Input
                id="agreementNumber"
                placeholder="CONV-2025-001"
                value={agreementFormData.agreementNumber}
                onChange={(e) => setAgreementFormData({ ...agreementFormData, agreementNumber: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha de Inicio *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={agreementFormData.startDate}
                  onChange={(e) => setAgreementFormData({ ...agreementFormData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha de Fin *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={agreementFormData.endDate}
                  onChange={(e) => setAgreementFormData({ ...agreementFormData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción del convenio"
                value={agreementFormData.description}
                onChange={(e) => setAgreementFormData({ ...agreementFormData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="documentUrl">URL del Documento</Label>
              <Input
                id="documentUrl"
                placeholder="https://..."
                value={agreementFormData.documentUrl}
                onChange={(e) => setAgreementFormData({ ...agreementFormData, documentUrl: e.target.value })}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="bg-blue-800 hover:bg-blue-900" disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpenAgreementDialog(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
