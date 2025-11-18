import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Search, X, Eye, Scan } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AccessLog {
  id: string;
  person_rut: string;
  person_name: string;
  entry_datetime: string;
  exit_datetime: string | null;
  risk_level: 'sin_alertas' | 'riesgo_medio' | 'riesgo_alto';
  risk_description: string | null;
  vehicle_plate: string | null;
  company: string | null;
  observations: string | null;
  entry_notes: string | null;
  plant_name: string;
  created_at: string;
}

export default function AccessControl() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AccessLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'rut' | 'patente' | 'empresa'>('rut');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    person_rut: '',
    person_name: '',
    risk_level: 'sin_alertas' as 'sin_alertas' | 'riesgo_medio' | 'riesgo_alto',
    risk_description: '',
    vehicle_plate: '',
    company: '',
    observations: '',
    entry_notes: '',
    plant_name: '',
  });

  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  // Available plants
  const plants = [
    'Planta Santiago Centro',
    'Planta Maipú',
    'Planta San Bernardo',
    'Planta Pudahuel',
    'Planta Quilicura',
    'Planta La Florida',
  ];

  // Simulate ID card scanning
  const handleScanID = async () => {
    if (!formData.person_rut || !formData.person_name) {
      toast({
        title: 'Datos incompletos',
        description: 'Por favor ingrese el RUT y nombre antes de escanear',
        variant: 'destructive',
      });
      return;
    }

    setIsScanning(true);
    
    // Check if user is blocked
    const { data: blockedUser, error: blockError } = await supabase
      .from('blocked_users')
      .select('*')
      .eq('person_rut', formData.person_rut)
      .maybeSingle();

    if (blockError) {
      console.error('Error checking blocked users:', blockError);
    }

    // Simulate scanning delay
    setTimeout(() => {
      if (blockedUser) {
        // User is blocked
        setFormData({
          ...formData,
          risk_level: 'riesgo_alto',
          risk_description: `ACCESO BLOQUEADO: ${blockedUser.block_reason}`,
        });
        
        setIsScanning(false);
        setHasScanned(true);
        
        toast({
          title: '⛔ ACCESO DENEGADO',
          description: blockedUser.block_reason,
          variant: 'destructive',
        });
        return;
      }

      // Simulate random risk assessment for non-blocked users
      const risks = [
        { level: 'sin_alertas' as const, description: '' },
        { level: 'riesgo_medio' as const, description: 'Antecedentes por falta administrativa' },
        { level: 'riesgo_alto' as const, description: 'Registros por robo con intimidación' },
      ];
      
      const randomRisk = risks[Math.floor(Math.random() * risks.length)];
      
      setFormData({
        ...formData,
        risk_level: randomRisk.level,
        risk_description: randomRisk.description,
      });
      
      setIsScanning(false);
      setHasScanned(true);
      
      toast({
        title: 'Escaneo completado',
        description: `Nivel de riesgo: ${
          randomRisk.level === 'sin_alertas' ? 'Sin alertas' :
          randomRisk.level === 'riesgo_medio' ? 'Riesgo medio' : 'Riesgo alto'
        }`,
        variant: randomRisk.level === 'riesgo_alto' ? 'destructive' : 'default',
      });
    }, 1500);
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAccessLogs();
    }
  }, [user]);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, searchType, accessLogs]);

  const fetchAccessLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('entry_datetime', { ascending: false });

      if (error) throw error;
      setAccessLogs((data || []) as AccessLog[]);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los registros de acceso',
        variant: 'destructive',
      });
    }
  };

  const filterLogs = () => {
    if (!searchTerm.trim()) {
      setFilteredLogs(accessLogs);
      return;
    }

    const filtered = accessLogs.filter((log) => {
      const term = searchTerm.toLowerCase();
      switch (searchType) {
        case 'rut':
          return log.person_rut.toLowerCase().includes(term);
        case 'patente':
          return log.vehicle_plate?.toLowerCase().includes(term);
        case 'empresa':
          return log.company?.toLowerCase().includes(term);
        default:
          return true;
      }
    });

    setFilteredLogs(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('access_logs').insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Registro de acceso creado correctamente',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchAccessLogs();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo crear el registro de acceso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      person_rut: '',
      person_name: '',
      risk_level: 'sin_alertas',
      risk_description: '',
      vehicle_plate: '',
      company: '',
      observations: '',
      entry_notes: '',
      plant_name: '',
    });
    setHasScanned(false);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'riesgo_alto':
        return <Badge variant="destructive">Riesgo Alto</Badge>;
      case 'riesgo_medio':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">Riesgo Medio</Badge>;
      case 'sin_alertas':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Sin Alertas</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Control de Accesos</h1>
            <p className="text-muted-foreground">
              Gestión de ingresos y validación de identidad
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Ingreso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nuevo Registro de Acceso</DialogTitle>
                <DialogDescription>
                  Complete la información del ingreso
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="person_rut">RUT *</Label>
                    <Input
                      id="person_rut"
                      value={formData.person_rut}
                      onChange={(e) =>
                        setFormData({ ...formData, person_rut: e.target.value })
                      }
                      placeholder="12.345.678-9"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="person_name">Nombre Completo *</Label>
                    <Input
                      id="person_name"
                      value={formData.person_name}
                      onChange={(e) =>
                        setFormData({ ...formData, person_name: e.target.value })
                      }
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                </div>

                {/* Scan ID Button */}
                <div className="space-y-2 p-4 border rounded-lg bg-muted/50">
                  <Label>Escaneo de Cédula</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Escanee la cédula de identidad para verificar antecedentes automáticamente
                  </p>
                  <Button
                    type="button"
                    onClick={handleScanID}
                    disabled={isScanning || !formData.person_rut || !formData.person_name}
                    className="w-full"
                    variant="outline"
                  >
                    <Scan className="w-4 h-4 mr-2" />
                    {isScanning ? 'Escaneando...' : 'Escanear Cédula'}
                  </Button>
                  
                  {hasScanned && (
                    <div className="mt-3 p-3 border rounded-lg bg-background">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Resultado del escaneo:</span>
                        {getRiskBadge(formData.risk_level)}
                      </div>
                      {formData.risk_description && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {formData.risk_description}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plant_name">Planta *</Label>
                  <Select
                    value={formData.plant_name}
                    onValueChange={(value) =>
                      setFormData({ ...formData, plant_name: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una planta" />
                    </SelectTrigger>
                    <SelectContent>
                      {plants.map((plant) => (
                        <SelectItem key={plant} value={plant}>
                          {plant}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">Patente del Vehículo</Label>
                    <Input
                      id="vehicle_plate"
                      value={formData.vehicle_plate}
                      onChange={(e) =>
                        setFormData({ ...formData, vehicle_plate: e.target.value })
                      }
                      placeholder="ABCD12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) =>
                        setFormData({ ...formData, company: e.target.value })
                      }
                      placeholder="Empresa ABC"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entry_notes">Detalle de Ingreso</Label>
                  <Textarea
                    id="entry_notes"
                    value={formData.entry_notes}
                    onChange={(e) =>
                      setFormData({ ...formData, entry_notes: e.target.value })
                    }
                    placeholder="Motivo de visita, área a la que se dirige, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observaciones</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) =>
                      setFormData({ ...formData, observations: e.target.value })
                    }
                    placeholder="Información adicional relevante"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Guardando...' : 'Registrar Ingreso'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Búsqueda de Registros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="w-48">
                <Select value={searchType} onValueChange={(value: any) => setSearchType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rut">Buscar por RUT</SelectItem>
                    <SelectItem value="patente">Buscar por Patente</SelectItem>
                    <SelectItem value="empresa">Buscar por Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar por ${searchType}...`}
                  className="pl-10 pr-10"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Acceso</CardTitle>
            <CardDescription>
              Mostrando {filteredLogs.length} registro(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RUT</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Planta</TableHead>
                    <TableHead>Entrada</TableHead>
                    <TableHead>Salida</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        No se encontraron registros
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.person_rut}</TableCell>
                        <TableCell>{log.person_name}</TableCell>
                        <TableCell>{log.plant_name}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.entry_datetime), 'dd/MM/yyyy HH:mm', {
                            locale: es,
                          })}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {log.exit_datetime
                            ? format(new Date(log.exit_datetime), 'dd/MM/yyyy HH:mm', {
                                locale: es,
                              })
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {getRiskBadge(log.risk_level)}
                        </TableCell>
                        <TableCell>{log.vehicle_plate || '-'}</TableCell>
                        <TableCell>{log.company || '-'}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/criminal-record/${log.person_rut}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Ver detalles
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
    </div>
  );
}
