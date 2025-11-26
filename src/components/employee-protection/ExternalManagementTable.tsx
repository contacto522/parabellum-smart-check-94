import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ExternalPerson {
  id: string;
  name: string;
  rut: string;
  phone_number: string | null;
  email: string | null;
  company: string | null;
  external_type: string;
  photo_url: string | null;
  is_active: boolean;
}

const ExternalManagementTable = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExternal, setEditingExternal] = useState<ExternalPerson | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    phone_number: "",
    email: "",
    company: "",
    external_type: "proveedor",
  });

  const { data: externals, isLoading } = useQuery({
    queryKey: ["external-persons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("monitored_employees")
        .select("*")
        .in("position", ["Proveedor", "Cliente", "Otro Externo"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        ...item,
        company: item.plant_name,
        external_type: item.position === "Proveedor" ? "proveedor" : 
                      item.position === "Cliente" ? "cliente" : "otro"
      })) as ExternalPerson[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: user } = await supabase.auth.getUser();
      const position = data.external_type === "proveedor" ? "Proveedor" :
                      data.external_type === "cliente" ? "Cliente" : "Otro Externo";
      
      const { error } = await supabase.from("monitored_employees").insert({
        name: data.name,
        rut: data.rut,
        phone_number: data.phone_number || null,
        email: data.email || null,
        position,
        plant_name: data.company || "Sin especificar",
        created_by: user?.user?.id,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-persons"] });
      toast({
        title: "Externo agregado",
        description: "El registro se ha creado exitosamente",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el registro",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const position = data.external_type === "proveedor" ? "Proveedor" :
                      data.external_type === "cliente" ? "Cliente" : "Otro Externo";
      
      const { error } = await supabase
        .from("monitored_employees")
        .update({
          name: data.name,
          rut: data.rut,
          phone_number: data.phone_number || null,
          email: data.email || null,
          position,
          plant_name: data.company || "Sin especificar",
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-persons"] });
      toast({
        title: "Externo actualizado",
        description: "Los cambios se han guardado exitosamente",
      });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("monitored_employees")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["external-persons"] });
      toast({
        title: "Externo eliminado",
        description: "El registro ha sido eliminado",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      rut: "",
      phone_number: "",
      email: "",
      company: "",
      external_type: "proveedor",
    });
    setEditingExternal(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingExternal) {
      updateMutation.mutate({ id: editingExternal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (external: ExternalPerson) => {
    setEditingExternal(external);
    setFormData({
      name: external.name,
      rut: external.rut,
      phone_number: external.phone_number || "",
      email: external.email || "",
      company: external.company || "",
      external_type: external.external_type,
    });
    setIsDialogOpen(true);
  };

  const filteredExternals = externals?.filter(
    (external) =>
      external.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.rut.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "proveedor": return "Proveedor";
      case "cliente": return "Cliente";
      case "otro": return "Otro";
      default: return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nombre, RUT o empresa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Agregar Externo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExternal ? "Editar Externo" : "Agregar Nuevo Externo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rut">RUT</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_type">Tipo</Label>
                <Select
                  value={formData.external_type}
                  onValueChange={(value) => setFormData({ ...formData, external_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="proveedor">Proveedor</SelectItem>
                    <SelectItem value="cliente">Cliente</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingExternal ? "Guardar Cambios" : "Agregar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredExternals?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No hay externos registrados
                </TableCell>
              </TableRow>
            ) : (
              filteredExternals?.map((external) => (
                <TableRow key={external.id}>
                  <TableCell>
                    <Avatar>
                      <AvatarImage src={external.photo_url || undefined} />
                      <AvatarFallback>
                        {external.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{external.name}</TableCell>
                  <TableCell>{external.rut}</TableCell>
                  <TableCell>{getTypeLabel(external.external_type)}</TableCell>
                  <TableCell>{external.company || "-"}</TableCell>
                  <TableCell>{external.phone_number || "-"}</TableCell>
                  <TableCell>{external.email || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(external)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(external.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExternalManagementTable;
