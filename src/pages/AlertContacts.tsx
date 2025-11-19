import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Power, PowerOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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

interface AlertContact {
  id: string;
  name: string;
  phone_number: string;
  is_active: boolean;
  created_at: string;
}

export default function AlertContacts() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<AlertContact[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    const { data, error } = await supabase
      .from('alert_contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contactos',
        variant: 'destructive',
      });
      return;
    }

    setContacts(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate phone number (must start with +56 for Chile)
    if (!formData.phone_number.startsWith('+56')) {
      toast({
        title: 'Número inválido',
        description: 'El número debe comenzar con +56 (ej: +56912345678)',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('alert_contacts')
      .insert([
        {
          name: formData.name,
          phone_number: formData.phone_number,
          created_by: user?.id,
        },
      ]);

    if (error) {
      console.error('Error creating contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el contacto',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Contacto agregado',
        description: 'El contacto ha sido agregado correctamente',
      });
      setFormData({ name: '', phone_number: '' });
      setIsDialogOpen(false);
      fetchContacts();
    }

    setIsSubmitting(false);
  };

  const toggleContactStatus = async (contactId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('alert_contacts')
      .update({ is_active: !currentStatus })
      .eq('id', contactId);

    if (error) {
      console.error('Error updating contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del contacto',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Estado actualizado',
        description: `Contacto ${!currentStatus ? 'activado' : 'desactivado'}`,
      });
      fetchContacts();
    }
  };

  const deleteContact = async (contactId: string) => {
    const { error } = await supabase
      .from('alert_contacts')
      .delete()
      .eq('id', contactId);

    if (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el contacto',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Contacto eliminado',
        description: 'El contacto ha sido eliminado correctamente',
      });
      fetchContacts();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Contactos de Alerta</h1>
            <p className="text-muted-foreground">
              Gestiona los números de WhatsApp que recibirán alertas de seguridad
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Contacto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Contacto de Alerta</DialogTitle>
                <DialogDescription>
                  Este contacto recibirá alertas por WhatsApp cuando ingresen personas con riesgo alto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Contacto</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Juan Pérez - Jefe de Seguridad"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Número de WhatsApp</Label>
                  <Input
                    id="phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder="+56912345678"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Incluye el código de país (ej: +56 para Chile)
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
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
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Contactos</CardTitle>
          <CardDescription>
            {contacts.length} contacto{contacts.length !== 1 ? 's' : ''} registrado{contacts.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay contactos registrados. Agrega el primer contacto para comenzar a recibir alertas.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Número de WhatsApp</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.phone_number}</TableCell>
                    <TableCell>
                      <Badge variant={contact.is_active ? 'default' : 'secondary'}>
                        {contact.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleContactStatus(contact.id, contact.is_active)}
                      >
                        {contact.is_active ? (
                          <>
                            <PowerOff className="h-4 w-4 mr-1" />
                            Desactivar
                          </>
                        ) : (
                          <>
                            <Power className="h-4 w-4 mr-1" />
                            Activar
                          </>
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar contacto?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. El contacto ya no recibirá alertas de seguridad.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteContact(contact.id)}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>¿Cómo funcionan las alertas?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            • Cuando una persona con <strong>riesgo alto</strong> (registros penales graves) ingresa a cualquier planta, se envía automáticamente una alerta por WhatsApp.
          </p>
          <p className="text-sm text-muted-foreground">
            • Solo los contactos <Badge variant="default" className="inline">Activos</Badge> recibirán las alertas.
          </p>
          <p className="text-sm text-muted-foreground">
            • La alerta incluye: nombre, RUT, planta de ingreso, nivel de riesgo y descripción.
          </p>
          <p className="text-sm text-muted-foreground">
            • Puedes desactivar temporalmente un contacto sin eliminarlo de la lista.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
