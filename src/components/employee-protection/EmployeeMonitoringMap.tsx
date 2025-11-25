import { useState, useEffect } from "react";
import { Search, AlertTriangle, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MonitoredEmployee {
  id: string;
  name: string;
  rut: string;
  plant_name: string;
  alert_status: string;
  latitude: number | null;
  longitude: number | null;
  last_location_update: string | null;
  photo_url: string | null;
  position: string | null;
}

interface EmployeeAlert {
  id: string;
  employee_id: string;
  alert_type: string;
  description: string;
  created_at: string;
  is_resolved: boolean;
  audio_url: string | null;
  location_link: string | null;
  incident_category: string | null;
  monitored_employees: {
    name: string;
    plant_name: string;
  };
}

const EmployeeMonitoringMap = () => {
  const [employees, setEmployees] = useState<MonitoredEmployee[]>([]);
  const [alerts, setAlerts] = useState<EmployeeAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<MonitoredEmployee | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchEmployees();
    fetchAlerts();
  }, []);

  const fetchEmployees = async () => {
    try {
      const { data, error } = await supabase
        .from("monitored_employees")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setEmployees(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los empleados monitoreados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from("employee_alerts")
        .select(`
          *,
          monitored_employees (
            name,
            plant_name
          )
        `)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error: any) {
      console.error("Error fetching alerts:", error);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.rut.includes(searchQuery) ||
      emp.plant_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-select first employee when searching
  useEffect(() => {
    if (searchQuery && filteredEmployees.length > 0) {
      setSelectedEmployee(filteredEmployees[0]);
    } else if (!searchQuery) {
      setSelectedEmployee(null);
    }
  }, [searchQuery, filteredEmployees.length]);

  const employeesWithAlerts = filteredEmployees.filter(
    (emp) => emp.alert_status === "alert"
  );
  const normalEmployees = filteredEmployees.filter(
    (emp) => emp.alert_status === "normal"
  );

  const handleEmployeeClick = (employee: MonitoredEmployee) => {
    setSelectedEmployee(employee);
    setSearchQuery(employee.name);
    toast({
      title: "Empleado ubicado",
      description: `${employee.name} - ${employee.plant_name}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar empleado por nombre, RUT o planta..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="gap-2">
          <Users className="h-4 w-4" />
          {filteredEmployees.length} empleados
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Monitoreo
              {selectedEmployee && (
                <Badge variant="outline" className="ml-auto">
                  Ubicando: {selectedEmployee.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
              {/* Map background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-grid-pattern" />
              </div>
              
              {/* Map markers simulation */}
              <div className="relative w-full h-full p-8">
                {/* Plant polygons (simulated) */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-primary/50 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium">Planta Norte</span>
                </div>
                <div className="absolute bottom-1/4 right-1/4 w-40 h-28 border-2 border-blue-500/50 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium">Planta Sur</span>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 border-2 border-green-500/50 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <span className="text-xs font-medium">Planta Central</span>
                </div>

                {/* Employee markers with click interaction */}
                {employeesWithAlerts.slice(0, 3).map((emp, idx) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  return (
                    <div
                      key={emp.id}
                      className={`absolute cursor-pointer transition-all ${
                        isSelected ? "z-50 scale-150" : "hover:scale-110"
                      }`}
                      style={{
                        top: `${30 + idx * 15}%`,
                        left: `${25 + idx * 20}%`,
                      }}
                      onClick={() => handleEmployeeClick(emp)}
                      title={emp.name}
                    >
                      <div className="relative">
                        {isSelected && (
                          <div className="absolute -inset-4 bg-destructive/20 rounded-full animate-ping" />
                        )}
                        <Avatar className={`h-8 w-8 border-2 ${isSelected ? 'border-yellow-400' : 'border-background'} shadow-lg`}>
                          <AvatarImage src={emp.photo_url || undefined} />
                          <AvatarFallback className="bg-destructive text-destructive-foreground text-xs">
                            {emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />
                        {isSelected && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 px-2 py-1 rounded text-xs font-medium border shadow-lg">
                            {emp.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {normalEmployees.slice(0, 5).map((emp, idx) => {
                  const isSelected = selectedEmployee?.id === emp.id;
                  return (
                    <div
                      key={emp.id}
                      className={`absolute cursor-pointer transition-all ${
                        isSelected ? "z-50 scale-150" : "hover:scale-110"
                      }`}
                      style={{
                        top: `${40 + idx * 10}%`,
                        left: `${40 + idx * 8}%`,
                      }}
                      onClick={() => handleEmployeeClick(emp)}
                      title={emp.name}
                    >
                      <div className="relative">
                        {isSelected && (
                          <div className="absolute -inset-4 bg-primary/20 rounded-full animate-ping" />
                        )}
                        <Avatar className={`h-7 w-7 border-2 ${isSelected ? 'border-yellow-400' : 'border-background'} shadow-lg`}>
                          <AvatarImage src={emp.photo_url || undefined} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {emp.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        {isSelected && (
                          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-background/90 px-2 py-1 rounded text-xs font-medium border shadow-lg">
                            {emp.name}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span>Estado Normal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
                    <span>Alerta Activa</span>
                  </div>
                </div>
              </div>

              {!selectedEmployee && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-sm bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
                    Busca un empleado o haz clic en un marcador
                  </p>
                </div>
              )}

              {selectedEmployee && (
                <div className="absolute bottom-4 right-4 bg-card/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg max-w-xs">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedEmployee.photo_url || undefined} />
                      <AvatarFallback>
                        {selectedEmployee.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{selectedEmployee.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedEmployee.rut}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEmployee(null);
                        setSearchQuery("");
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedEmployee.plant_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{selectedEmployee.position || "Sin cargo"}</span>
                    </div>
                    <div className="mt-2">
                      {selectedEmployee.alert_status === "alert" ? (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Alerta Activa
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Estado Normal
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Alertas Recientes
              {alerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {alerts.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Cargando alertas...
                </div>
              ) : alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay alertas activas
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.map((alert) => {
                    const employee = employees.find(
                      (emp) => emp.id === alert.employee_id
                    );
                    return (
                      <Card key={alert.id} className="border-destructive/50">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <Badge variant="destructive" className="text-xs">
                                {alert.alert_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alert.created_at).toLocaleString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={employee?.photo_url || undefined}
                                  alt={alert.monitored_employees?.name}
                                />
                                <AvatarFallback className="text-xs">
                                  {alert.monitored_employees?.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">
                                  {alert.monitored_employees?.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {alert.monitored_employees?.plant_name}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm">{alert.description}</p>
                            
                            {/* Audio Player */}
                            {alert.audio_url && (
                              <div className="mt-2">
                                <audio controls className="w-full h-8">
                                  <source src={alert.audio_url} type="audio/webm" />
                                </audio>
                              </div>
                            )}
                            
                            {/* Location Link */}
                            {alert.location_link && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => window.open(alert.location_link!, "_blank")}
                              >
                                📍 Ver Ubicación en Mapa
                              </Button>
                            )}
                            
                            {/* Category Badge */}
                            {alert.incident_category && (
                              <div className="mt-2">
                                <Badge variant="outline" className="text-xs">
                                  Categoría: {alert.incident_category}
                                </Badge>
                              </div>
                            )}
                            
                            <Button size="sm" className="w-full mt-2">
                              Resolver Alerta
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeMonitoringMap;
