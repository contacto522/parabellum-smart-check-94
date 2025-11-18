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
import { ArrowLeft, Plus, Upload, Trash2, AlertCircle } from 'lucide-react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import * as XLSX from 'xlsx';

interface BlockedUser {
  id: string;
  person_rut: string;
  person_name: string | null;
  block_reason: string;
  blocked_date: string;
  created_at: string;
}

export default function BlockedUsers() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    person_rut: '',
    person_name: '',
    block_reason: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchBlockedUsers();
    }
  }, [user, loading, navigate]);

  const fetchBlockedUsers = async () => {
    const { data, error } = await supabase
      .from('blocked_users')
      .select('*')
      .order('blocked_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios bloqueados',
        variant: 'destructive',
      });
      return;
    }

    setBlockedUsers(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('blocked_users').insert([
        {
          person_rut: formData.person_rut,
          person_name: formData.person_name || null,
          block_reason: formData.block_reason,
          blocked_by: user?.id,
        },
      ]);

      if (error) throw error;

      toast({
        title: 'Usuario bloqueado',
        description: 'El usuario ha sido agregado a la lista de bloqueados',
      });

      setFormData({
        person_rut: '',
        person_name: '',
        block_reason: '',
      });
      setIsDialogOpen(false);
      fetchBlockedUsers();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo agregar el usuario',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('blocked_users').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Usuario desbloqueado',
      description: 'El usuario ha sido eliminado de la lista de bloqueados',
    });

    fetchBlockedUsers();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet) as any[];

        // Validate data structure
        const validData = jsonData.filter(
          (row) => row.rut && row.motivo
        );

        if (validData.length === 0) {
          toast({
            title: 'Error',
            description: 'El archivo debe contener columnas "rut" y "motivo"',
            variant: 'destructive',
          });
          return;
        }

        // Insert data
        const insertData = validData.map((row) => ({
          person_rut: String(row.rut),
          person_name: row.nombre || null,
          block_reason: String(row.motivo),
          blocked_by: user?.id,
        }));

        const { error } = await supabase.from('blocked_users').insert(insertData);

        if (error) throw error;

        toast({
          title: 'Carga exitosa',
          description: `Se han agregado ${validData.length} usuarios bloqueados`,
        });

        fetchBlockedUsers();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'No se pudo procesar el archivo',
          variant: 'destructive',
        });
      }
    };

    reader.readAsArrayBuffer(file);
    e.target.value = ''; // Reset file input
  };

  const downloadTemplate = () => {
    const template = [
      { rut: '12345678-9', nombre: 'Juan Pérez', motivo: 'Bloqueado por hurto en la empresa' },
      { rut: '98765432-1', nombre: 'María González', motivo: 'Conducta inapropiada' },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios Bloqueados');
    XLSX.writeFile(wb, 'plantilla_usuarios_bloqueados.xlsx');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-10 h-10 text-destructive" />
              <div>
                <h1 className="text-2xl font-bold">Lista de Bloqueados</h1>
                <p className="text-sm text-muted-foreground">
                  Gestión de usuarios con acceso restringido
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
              <CardDescription>
                Agregar usuarios a la lista de bloqueados
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Agregar Usuario Bloqueado</DialogTitle>
                    <DialogDescription>
                      Ingrese los datos del usuario a bloquear
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="person_rut">RUT *</Label>
                      <Input
                        id="person_rut"
                        value={formData.person_rut}
                        onChange={(e) =>
                          setFormData({ ...formData, person_rut: e.target.value })
                        }
                        placeholder="12345678-9"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="person_name">Nombre</Label>
                      <Input
                        id="person_name"
                        value={formData.person_name}
                        onChange={(e) =>
                          setFormData({ ...formData, person_name: e.target.value })
                        }
                        placeholder="Nombre completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="block_reason">Motivo de Bloqueo *</Label>
                      <Textarea
                        id="block_reason"
                        value={formData.block_reason}
                        onChange={(e) =>
                          setFormData({ ...formData, block_reason: e.target.value })
                        }
                        placeholder="Ej: Bloqueado por hurto en la empresa"
                        required
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Guardando...' : 'Guardar'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadTemplate}>
                  <Upload className="w-4 h-4 mr-2" />
                  Descargar Plantilla
                </Button>
                <label>
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Cargar Excel
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Blocked Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>Usuarios Bloqueados ({blockedUsers.length})</CardTitle>
              <CardDescription>
                Lista completa de usuarios con acceso restringido
              </CardDescription>
            </CardHeader>
            <CardContent>
              {blockedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay usuarios bloqueados</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>RUT</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Motivo</TableHead>
                        <TableHead>Fecha de Bloqueo</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {blockedUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-mono">{user.person_rut}</TableCell>
                          <TableCell>{user.person_name || '-'}</TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-2">{user.block_reason}</p>
                          </TableCell>
                          <TableCell>
                            {format(new Date(user.blocked_date), "dd 'de' MMMM, yyyy", {
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    ¿Desbloquear usuario?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción eliminará a {user.person_rut} de la lista de
                                    bloqueados y podrá ingresar nuevamente.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(user.id)}>
                                    Desbloquear
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
      </main>
    </div>
  );
}
