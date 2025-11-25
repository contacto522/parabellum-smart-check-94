import { useState, useEffect } from "react";
import { Search, AlertTriangle, MapPin, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
}

interface EmployeeAlert {
  id: string;
  employee_id: string;
  alert_type: string;
  description: string;
  created_at: string;
  is_resolved: boolean;
  monitored_employees: {
    name: string;
    plant_name: string;
  };
}

const EmployeeMonitoringMap = () => {
  const [employees, setEmployees] = useState<MonitoredEmployee[]>([]);
  const [alerts, setAlerts] = useState<EmployeeAlert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const employeesWithAlerts = filteredEmployees.filter(
    (emp) => emp.alert_status === "alert"
  );
  const normalEmployees = filteredEmployees.filter(
    (emp) => emp.alert_status === "normal"
  );

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

                {/* Employee markers */}
                {employeesWithAlerts.slice(0, 3).map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="absolute animate-pulse"
                    style={{
                      top: `${30 + idx * 15}%`,
                      left: `${25 + idx * 20}%`,
                    }}
                  >
                    <div className="relative">
                      <div className="w-6 h-6 bg-destructive rounded-full border-2 border-background shadow-lg" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-ping" />
                    </div>
                  </div>
                ))}

                {normalEmployees.slice(0, 5).map((emp, idx) => (
                  <div
                    key={emp.id}
                    className="absolute"
                    style={{
                      top: `${40 + idx * 10}%`,
                      left: `${40 + idx * 8}%`,
                    }}
                  >
                    <div className="w-5 h-5 bg-primary rounded-full border-2 border-background shadow-lg" />
                  </div>
                ))}
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

              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-muted-foreground text-sm bg-background/80 backdrop-blur-sm px-4 py-2 rounded-lg border">
                  Vista previa del mapa interactivo
                </p>
              </div>
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
                  {alerts.map((alert) => (
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
                          <p className="font-medium text-sm">
                            {alert.monitored_employees?.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {alert.monitored_employees?.plant_name}
                          </p>
                          <p className="text-sm">{alert.description}</p>
                          <Button size="sm" className="w-full mt-2">
                            Resolver Alerta
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
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
