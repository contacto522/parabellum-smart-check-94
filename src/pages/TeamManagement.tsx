import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Users, Plus, Trash2 } from "lucide-react";

type AppRole = Database["public"]["Enums"]["app_role"];

interface TeamMember {
  id: string;
  name: string;
  rut: string;
  email: string;
  role: AppRole;
  monthly_credit_limit: number;
  created_at: string;
}

const TeamManagement = () => {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    rut: string;
    email: string;
    role: AppRole;
    monthly_credit_limit: number;
  }>({
    name: "",
    rut: "",
    email: "",
    role: "admin_seguridad",
    monthly_credit_limit: 1000,
  });

  // Fetch team members
  const { data: teamMembers, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add team member
  const addMemberMutation = useMutation({
    mutationFn: async (newMember: typeof formData) => {
      const { data, error } = await supabase
        .from("team_members")
        .insert([
          {
            name: newMember.name,
            rut: newMember.rut,
            email: newMember.email,
            role: newMember.role,
            monthly_credit_limit: newMember.monthly_credit_limit,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Miembro del equipo agregado correctamente");
      setIsDialogOpen(false);
      setFormData({
      name: "",
      rut: "",
      email: "",
      role: "admin_seguridad",
      monthly_credit_limit: 1000,
      });
    },
    onError: (error: any) => {
      toast.error("Error al agregar miembro: " + error.message);
    },
  });

  // Delete team member
  const deleteMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Miembro eliminado correctamente");
    },
    onError: (error: any) => {
      toast.error("Error al eliminar miembro: " + error.message);
    },
  });

  // Update credit limit
  const updateCreditLimitMutation = useMutation({
    mutationFn: async ({ id, limit }: { id: string; limit: number }) => {
      const { error } = await supabase
        .from("team_members")
        .update({ monthly_credit_limit: limit })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Límite de créditos actualizado");
    },
    onError: (error: any) => {
      toast.error("Error al actualizar límite: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMemberMutation.mutate(formData);
  };

  const getRoleLabel = (role: AppRole) => {
    const roles: Record<AppRole, string> = {
      admin_seguridad: "Administrador",
      recursos_humanos: "Recursos Humanos",
      seguridad: "Seguridad",
    };
    return roles[role] || role;
  };

  if (!hasRole("admin_seguridad")) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              No tienes permisos para acceder a esta página
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Mi Equipo de Trabajo
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestiona los miembros de tu equipo y sus límites de créditos mensuales
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Miembro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Miembro</DialogTitle>
              <DialogDescription>
                Completa la información del nuevo miembro del equipo
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) =>
                    setFormData({ ...formData, rut: e.target.value })
                  }
                  placeholder="12.345.678-9"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value as AppRole })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin_seguridad">Administrador</SelectItem>
                    <SelectItem value="recursos_humanos">Recursos Humanos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Límite de Créditos Mensuales</Label>
                <Input
                  id="credits"
                  type="number"
                  min="0"
                  value={formData.monthly_credit_limit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_credit_limit: parseInt(e.target.value),
                    })
                  }
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Créditos disponibles para consultas de verificación y uso de IA
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={addMemberMutation.isPending}>
                  {addMemberMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Miembros del Equipo</CardTitle>
          <CardDescription>
            Lista de todos los miembros registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">Cargando...</p>
          ) : teamMembers && teamMembers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>RUT</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Créditos Mensuales</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.rut}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                        {getRoleLabel(member.role)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        defaultValue={member.monthly_credit_limit}
                        className="w-24"
                        onBlur={(e) => {
                          const newLimit = parseInt(e.target.value);
                          if (newLimit !== member.monthly_credit_limit) {
                            updateCreditLimitMutation.mutate({
                              id: member.id,
                              limit: newLimit,
                            });
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMemberMutation.mutate(member.id)}
                        disabled={deleteMemberMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No hay miembros registrados. Agrega el primer miembro del equipo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;
