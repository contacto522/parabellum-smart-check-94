import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PlantAccessAccount {
  id: string;
  account_email: string;
  account_name: string;
  plant_name: string;
  can_scan_id: boolean;
  can_control_access: boolean;
  created_at: string;
}

export default function PlantAccessAccountsSection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<PlantAccessAccount[]>([]);
  const [plants, setPlants] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    account_name: '',
    account_email: '',
    plant_name: '',
    can_scan_id: true,
    can_control_access: true,
  });

  useEffect(() => {
    fetchAccounts();
    fetchPlants();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('plant_access_accounts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las cuentas de acceso',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('access_logs')
        .select('plant_name')
        .order('plant_name');

      if (error) throw error;

      // Obtener plantas únicas
      const uniquePlants = [...new Set(data?.map(log => log.plant_name) || [])];
      setPlants(uniquePlants);
    } catch (error: any) {
      console.error('Error fetching plants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.account_name || !formData.account_email || !formData.plant_name) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos',
        variant: 'destructive',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.account_email)) {
      toast({
        title: 'Error',
        description: 'Por favor ingrese un email válido',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('plant_access_accounts')
        .insert([{
          ...formData,
          created_by: user?.id,
        }]);

      if (error) throw error;

      toast({
        title: 'Cuenta vinculada',
        description: 'La cuenta de acceso ha sido vinculada exitosamente',
      });

      setIsDialogOpen(false);
      setFormData({
        account_name: '',
        account_email: '',
        plant_name: '',
        can_scan_id: true,
        can_control_access: true,
      });
      fetchAccounts();
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: 'No se pudo vincular la cuenta de acceso',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = async (id: string, field: 'can_scan_id' | 'can_control_access', currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('plant_access_accounts')
        .update({ [field]: !currentValue })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Permiso actualizado',
        description: 'El permiso ha sido actualizado correctamente',
      });

      fetchAccounts();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el permiso',
        variant: 'destructive',
      });
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('¿Está seguro de que desea eliminar esta cuenta de acceso?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('plant_access_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Cuenta eliminada',
        description: 'La cuenta de acceso ha sido eliminada',
      });

      fetchAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la cuenta de acceso',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cuentas de Acceso a Plantas</h2>
          <p className="text-muted-foreground">
            Vincule cuentas para controlar el acceso y escaneo de cédulas en plantas específicas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Vincular Cuenta
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Vincular Cuenta de Acceso</DialogTitle>
              <DialogDescription>
                Agregue una nueva cuenta con permisos de acceso a una planta específica
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="account_name">Nombre de la Cuenta</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="Ej: Guardia Sector Norte"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="account_email">Email de la Cuenta</Label>
                <Input
                  id="account_email"
                  type="email"
                  value={formData.account_email}
                  onChange={(e) => setFormData({ ...formData, account_email: e.target.value })}
                  placeholder="guardia@ejemplo.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plant_name">Planta Asignada</Label>
                <Select
                  value={formData.plant_name}
                  onValueChange={(value) => setFormData({ ...formData, plant_name: value })}
                  required
                >
                  <SelectTrigger id="plant_name">
                    <SelectValue placeholder="Seleccione una planta" />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.length === 0 ? (
                      <SelectItem value="no-plants" disabled>
                        No hay plantas disponibles
                      </SelectItem>
                    ) : (
                      plants.map((plant) => (
                        <SelectItem key={plant} value={plant}>
                          {plant}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="can_scan_id">Puede escanear cédulas</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir el escaneo de cédulas de identidad
                    </p>
                  </div>
                  <Switch
                    id="can_scan_id"
                    checked={formData.can_scan_id}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_scan_id: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="can_control_access">Puede controlar acceso</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir control de acceso a la planta
                    </p>
                  </div>
                  <Switch
                    id="can_control_access"
                    checked={formData.can_control_access}
                    onCheckedChange={(checked) => setFormData({ ...formData, can_control_access: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Vincular Cuenta
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cuentas Vinculadas</CardTitle>
          <CardDescription>
            Gestione las cuentas que tienen acceso a plantas específicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                No hay cuentas vinculadas aún
              </p>
              <p className="text-sm text-muted-foreground">
                Comience agregando una cuenta de acceso
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Planta</TableHead>
                    <TableHead className="text-center">Escanear Cédula</TableHead>
                    <TableHead className="text-center">Control de Acceso</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.account_name}</TableCell>
                      <TableCell>{account.account_email}</TableCell>
                      <TableCell>{account.plant_name}</TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={account.can_scan_id}
                          onCheckedChange={() => togglePermission(account.id, 'can_scan_id', account.can_scan_id)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={account.can_control_access}
                          onCheckedChange={() => togglePermission(account.id, 'can_control_access', account.can_control_access)}
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteAccount(account.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • La cuenta vinculada a una planta al realizar control de acceso y salida escaneando una cédula con la app, genera datos que se vinculan a la planta asociada
          </p>
          <p>
            • Por ejemplo, si un guardia tiene una cuenta asociada a la Planta Norte y está de turno para hacer control de acceso, todos los escaneos se vincularán como registros a esa planta
          </p>
          <p>
            • El permiso de "Escanear cédula" permite validar documentos de identidad
          </p>
          <p>
            • El permiso de "Control de acceso" permite autorizar o denegar el ingreso
          </p>
          <p>
            • Los permisos pueden activarse o desactivarse en cualquier momento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
