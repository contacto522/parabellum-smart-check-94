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
import { ArrowLeft, Plus, Search, X } from 'lucide-react';
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
    risk_level: 'sin_alertas' as const,
    risk_description: '',
    vehicle_plate: '',
    company: '',
    observations: '',
    entry_notes: '',
    plant_name: '',
  });

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
  };

  const getRiskBadge = (level: string, description: string | null) => {
    switch (level) {
      case 'riesgo_alto':
        return (
          <Badge variant="destructive" className="whitespace-normal">
            {description || 'Riesgo Alto'}
          </Badge>
        );
      case 'riesgo_medio':
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 whitespace-normal">
            {description || 'Riesgo Medio'}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="whitespace-normal">
            Sin registros penales
          </Badge>
        );
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

                <div className="space-y-2">
                  <Label htmlFor="plant_name">Planta *</Label>
                  <Input
                    id="plant_name"
                    value={formData.plant_name}
                    onChange={(e) =>
                      setFormData({ ...formData, plant_name: e.target.value })
                    }
                    placeholder="Planta Santiago Centro"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="risk_level">Nivel de Riesgo *</Label>
                    <Select
                      value={formData.risk_level}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, risk_level: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sin_alertas">Sin Alertas</SelectItem>
                        <SelectItem value="riesgo_medio">Riesgo Medio</SelectItem>
                        <SelectItem value="riesgo_alto">Riesgo Alto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="risk_description">Descripción del Riesgo</Label>
                    <Input
                      id="risk_description"
                      value={formData.risk_description}
                      onChange={(e) =>
                        setFormData({ ...formData, risk_description: e.target.value })
                      }
                      placeholder="Ej: Registros por robo con intimidación"
                    />
                  </div>
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
                    <TableHead>Observaciones</TableHead>
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
                          {getRiskBadge(log.risk_level, log.risk_description)}
                        </TableCell>
                        <TableCell>{log.vehicle_plate || '-'}</TableCell>
                        <TableCell>{log.company || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.observations || '-'}
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
