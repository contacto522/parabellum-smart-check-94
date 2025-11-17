import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, AlertCircle, CheckCircle2 } from "lucide-react";

interface Alert {
  id: number;
  type: string;
  message: string;
  resolved: boolean;
}

interface Plant {
  id: number;
  name: string;
  status: "critical" | "warning" | "safe";
  occupancy: number;
  alerts: Alert[];
  manager: {
    name: string;
    rut: string;
    phone: string;
    email: string;
  };
  shiftInfo: {
    responsible: string;
    checked: boolean;
    result: string;
    novelties: string;
  };
}

const AdminPlants = () => {
  const [expandedPlant, setExpandedPlant] = useState<number | null>(null);
  const [plants, setPlants] = useState<Plant[]>([
    {
      id: 1,
      name: "Centro Norte",
      status: "critical",
      occupancy: 120,
      alerts: [
        {
          id: 1,
          type: "Ingreso con Registros Penales",
          message: "Ingreso a planta Centro Norte de Juan Andrés Perez Perez, con registros penales por homicidio y robo con intimidación",
          resolved: false,
        },
      ],
      manager: {
        name: "Carlos Mendoza",
        rut: "12.345.678-9",
        phone: "+56 9 8765 4321",
        email: "carlos.mendoza@empresa.cl",
      },
      shiftInfo: {
        responsible: "María González",
        checked: true,
        result: "Sin registros penales",
        novelties: "Sin novedad",
      },
    },
    {
      id: 2,
      name: "Planta Sur",
      status: "warning",
      occupancy: 85,
      alerts: [
        {
          id: 4,
          type: "Evento de Seguridad",
          message: "Cámara de seguridad sector B fuera de servicio",
          resolved: false,
        },
      ],
      manager: {
        name: "Ana Silva",
        rut: "15.678.901-2",
        phone: "+56 9 7654 3210",
        email: "ana.silva@empresa.cl",
      },
      shiftInfo: {
        responsible: "Pedro Ramírez",
        checked: true,
        result: "Sin registros penales",
        novelties: "Con novedad: No funciona cámara de acceso",
      },
    },
    {
      id: 3,
      name: "Planta Este",
      status: "safe",
      occupancy: 95,
      alerts: [],
      manager: {
        name: "Roberto Flores",
        rut: "18.234.567-0",
        phone: "+56 9 6543 2109",
        email: "roberto.flores@empresa.cl",
      },
      shiftInfo: {
        responsible: "Laura Martínez",
        checked: true,
        result: "Sin registros penales",
        novelties: "Sin novedad",
      },
    },
  ]);

  const toggleExpand = (plantId: number) => {
    setExpandedPlant(expandedPlant === plantId ? null : plantId);
  };

  const resolveAlert = (plantId: number, alertId: number) => {
    setPlants(plants.map(plant => {
      if (plant.id === plantId) {
        return {
          ...plant,
          alerts: plant.alerts.map(alert =>
            alert.id === alertId ? { ...alert, resolved: true } : alert
          ),
        };
      }
      return plant;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-destructive";
      case "warning":
        return "bg-yellow-500";
      case "safe":
        return "bg-green-500";
      default:
        return "bg-muted";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "critical":
        return "Crítico";
      case "warning":
        return "Alerta";
      case "safe":
        return "Seguro";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Plantas</h1>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Planta
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((plant) => (
            <Card key={plant.id} className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{plant.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(plant.status)}`} />
                      <span className="text-sm font-medium">{getStatusText(plant.status)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {plant.occupancy} personas al interior
                    </p>
                  </div>
                  {plant.alerts.filter(a => !a.resolved).length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {plant.alerts.filter(a => !a.resolved).length} alerta{plant.alerts.filter(a => !a.resolved).length > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => toggleExpand(plant.id)}
                >
                  {expandedPlant === plant.id ? (
                    <>
                      Ver menos <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Ver más <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {expandedPlant === plant.id && (
                  <div className="mt-4 space-y-4">
                    {/* Alerts Section */}
                    {plant.alerts.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold text-sm">Alertas de Riesgo</h3>
                        {plant.alerts.map((alert) => (
                          <Card key={alert.id} className={alert.resolved ? "opacity-60" : ""}>
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-1">{alert.type}</p>
                                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                                </div>
                                {alert.resolved ? (
                                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                                )}
                              </div>
                              {!alert.resolved && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full mt-2"
                                  onClick={() => resolveAlert(plant.id, alert.id)}
                                >
                                  Marcar resuelta
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Manager Info */}
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Encargado de Planta</h3>
                      <Card>
                        <CardContent className="p-3 space-y-1">
                          <p className="text-sm"><span className="font-medium">Nombre:</span> {plant.manager.name}</p>
                          <p className="text-sm"><span className="font-medium">RUT:</span> {plant.manager.rut}</p>
                          <p className="text-sm"><span className="font-medium">Teléfono:</span> {plant.manager.phone}</p>
                          <p className="text-sm"><span className="font-medium">Email:</span> {plant.manager.email}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Shift Info */}
                    <div>
                      <h3 className="font-semibold text-sm mb-2">Control de Acceso</h3>
                      <Card>
                        <CardContent className="p-3 space-y-1">
                          <p className="text-sm"><span className="font-medium">Responsable de turno:</span> {plant.shiftInfo.responsible}</p>
                          <p className="text-sm"><span className="font-medium">Verificación:</span> {plant.shiftInfo.result}</p>
                          <p className="text-sm"><span className="font-medium">Estado:</span> {plant.shiftInfo.novelties}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPlants;
