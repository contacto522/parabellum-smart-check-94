import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, MapPin, Users, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import EmployeeMonitoringMap from "@/components/employee-protection/EmployeeMonitoringMap";
import EmployeeManagementTable from "@/components/employee-protection/EmployeeManagementTable";
import ExternalManagementTable from "@/components/employee-protection/ExternalManagementTable";
import PanicButton from "@/components/employee-protection/PanicButton";

const EmployeeProtection = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("monitoring");

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <Shield className="h-5 w-5" />
                Volver al Panel
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-2xl font-bold">Protección de Empleados</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{user?.email}</span>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
                <TabsTrigger value="monitoring" className="gap-2">
                  <MapPin className="h-4 w-4" />
                  Monitoreo en Mapa
                </TabsTrigger>
                <TabsTrigger value="management" className="gap-2">
                  <Users className="h-4 w-4" />
                  Gestión de Empleados
                </TabsTrigger>
                <TabsTrigger value="externals" className="gap-2">
                  <Users className="h-4 w-4" />
                  Gestión de Externos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="monitoring" className="mt-0">
                <EmployeeMonitoringMap />
              </TabsContent>

              <TabsContent value="management" className="mt-0">
                <EmployeeManagementTable />
              </TabsContent>

              <TabsContent value="externals" className="mt-0">
                <ExternalManagementTable />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Panic Button - Only shown in monitoring view */}
      {activeTab === "monitoring" && user && (
        <PanicButton 
          employeeId={user.id} 
          employeeName={user.email || "Usuario"}
        />
      )}
    </div>
  );
};

export default EmployeeProtection;
