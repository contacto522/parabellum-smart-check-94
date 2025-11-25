import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, UserPlus } from "lucide-react";
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface MonitoredEmployee {
  id: string;
  name: string;
  rut: string;
  plant_name: string;
  position: string | null;
  phone_number: string | null;
  email: string | null;
  alert_status: string;
  is_active: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

const EmployeeManagementTable = () => {
  const [employees, setEmployees] = useState<MonitoredEmployee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<MonitoredEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<MonitoredEmployee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    rut: "",
    plant_name: "",
    position: "",
    phone_number: "",
    email: "",
    alert_status: "normal",
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.rut.includes(searchQuery) ||
        emp.plant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.position && emp.position.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredEmployees(filtered);
    setCurrentPage(1);
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("monitored_employees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEmployees(data || []);
      setFilteredEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = () => {
    setSelectedEmployee(null);
    setFormData({
      name: "",
      rut: "",
      plant_name: "",
      position: "",
      phone_number: "",
      email: "",
      alert_status: "normal",
    });
    setIsDialogOpen(true);
  };

  const handleEditEmployee = (employee: MonitoredEmployee) => {
    setSelectedEmployee(employee);
    setFormData({
      name: employee.name,
      rut: employee.rut,
      plant_name: employee.plant_name,
      position: employee.position || "",
      phone_number: employee.phone_number || "",
      email: employee.email || "",
      alert_status: employee.alert_status,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteEmployee = (employee: MonitoredEmployee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (selectedEmployee) {
        const { error } = await supabase
          .from("monitored_employees")
          .update(formData)
          .eq("id", selectedEmployee.id);

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Empleado actualizado correctamente",
        });
      } else {
        const { error } = await supabase
          .from("monitored_employees")
          .insert({
            ...formData,
            created_by: user?.id,
          });

        if (error) throw error;

        toast({
          title: "Éxito",
          description: "Empleado registrado correctamente",
        });
      }

      setIsDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar el empleado",
        variant: "destructive",
      });
    }
  };

  const confirmDelete = async () => {
    if (!selectedEmployee) return;

    try {
      const { error } = await supabase
        .from("monitored_employees")
        .delete()
        .eq("id", selectedEmployee.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Empleado eliminado correctamente",
      });

      setIsDeleteDialogOpen(false);
      fetchEmployees();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el empleado",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, RUT, planta o cargo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateEmployee} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Crear Nuevo Trabajador
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>RUT</TableHead>
              <TableHead>Planta</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Cargando empleados...
                </TableCell>
              </TableRow>
            ) : currentEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No se encontraron empleados
                </TableCell>
              </TableRow>
            ) : (
              currentEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.rut}</TableCell>
                  <TableCell>{employee.plant_name}</TableCell>
                  <TableCell>{employee.position || "-"}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {employee.phone_number && <div>{employee.phone_number}</div>}
                      {employee.email && (
                        <div className="text-muted-foreground text-xs">{employee.email}</div>
                      )}
                      {!employee.phone_number && !employee.email && "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {employee.alert_status === "alert" ? (
                      <Badge variant="destructive" className="animate-pulse">
                        Alerta
                      </Badge>
                    ) : (
                      <Badge variant="outline">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEmployee(employee)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                className={
                  currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? "Editar Empleado" : "Crear Nuevo Empleado"}
            </DialogTitle>
            <DialogDescription>
              Complete la información del empleado que será monitoreado
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Juan Pérez González"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rut">RUT *</Label>
              <Input
                id="rut"
                value={formData.rut}
                onChange={(e) => setFormData({ ...formData, rut: e.target.value })}
                placeholder="12.345.678-9"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="plant_name">Planta *</Label>
              <Input
                id="plant_name"
                value={formData.plant_name}
                onChange={(e) => setFormData({ ...formData, plant_name: e.target.value })}
                placeholder="Planta Norte"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                placeholder="Operador de Producción"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone_number">Teléfono</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                placeholder="+56912345678"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="empleado@empresa.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="alert_status">Estado de Alerta</Label>
              <Select
                value={formData.alert_status}
                onValueChange={(value) => setFormData({ ...formData, alert_status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="alert">Alerta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {selectedEmployee ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el registro de{" "}
              <span className="font-semibold">{selectedEmployee?.name}</span>. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmployeeManagementTable;
