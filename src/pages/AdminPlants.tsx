import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Building, AlertTriangle, Users, FileSearch, TrendingUp, MapPin, Activity, Clock, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const plants = [
  { id: 1, name: 'Centro Norte', location: 'Región de Los Lagos', workers: 45, peopleInside: 120, status: 'active', alerts: 3 },
  { id: 2, name: 'Centro Sur', location: 'Región de Aysén', workers: 38, peopleInside: 85, status: 'active', alerts: 0 },
  { id: 3, name: 'Centro Austral', location: 'Región de Magallanes', workers: 52, peopleInside: 98, status: 'maintenance', alerts: 1 },
];

const recentAlerts = [
  { 
    id: 1, 
    type: 'critical', 
    plant: 'Centro Norte', 
    message: 'Ingreso a planta de Juan Andrés Perez Perez con registros penales por homicidio y robo con intimidación', 
    time: '15 minutos',
    severity: 'grave'
  },
  { id: 2, type: 'high', plant: 'Centro Norte', message: 'Acceso no autorizado detectado', time: '2 horas' },
  { id: 3, type: 'medium', plant: 'Centro Norte', message: 'Cambio de turno sin registro', time: '4 horas' },
  { id: 4, type: 'high', plant: 'Centro Austral', message: 'Verificación de antecedentes pendiente', time: '6 horas' },
];

const recentActivities = [
  { id: 1, user: 'Admin Seguridad', action: 'Verificó acceso en Centro Norte', time: '1 hora', type: 'security' },
  { id: 2, user: 'RRHH Manager', action: 'Revisó postulante nuevo', time: '3 horas', type: 'hr' },
  { id: 3, user: 'Admin Seguridad', action: 'Actualizó protocolo de emergencia', time: '5 horas', type: 'security' },
];

export default function AdminPlants() {
  const { user, signOut, userRoles, hasRole } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarContent>
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h2 className="font-semibold text-sm">Parabellum</h2>
                  <p className="text-xs text-muted-foreground">Smart Check</p>
                </div>
              </div>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel className="text-xs uppercase tracking-wider">Módulos</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin/plants" className="flex items-center gap-2" activeClassName="bg-accent/10 text-accent font-medium">
                        <Building className="w-4 h-4" />
                        <span>Plantas</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  
                  {hasRole('admin_seguridad') && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin/security" className="flex items-center gap-2" activeClassName="bg-accent/10 text-accent font-medium">
                          <Shield className="w-4 h-4" />
                          <span>Seguridad</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  {hasRole('recursos_humanos') && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <NavLink to="/admin/hr" className="flex items-center gap-2" activeClassName="bg-accent/10 text-accent font-medium">
                          <Users className="w-4 h-4" />
                          <span>Recursos Humanos</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink to="/admin/analytics" className="flex items-center gap-2" activeClassName="bg-accent/10 text-accent font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>Análisis IA</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{user.email}</p>
                  <div className="flex gap-1 mt-1">
                    {userRoles.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role === 'admin_seguridad' ? 'Admin' : 'RRHH'}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
                  <Activity className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-xl font-bold">Gestión de Plantas</h1>
                  <p className="text-sm text-muted-foreground">Supervisión de todas las instalaciones</p>
                </div>
              </div>
              <Button variant="hero" onClick={() => navigate('/dashboard')}>
                Volver al Dashboard
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Search */}
              <div className="flex gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Buscar plantas, alertas, personal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="default">
                  <FileSearch className="w-4 h-4 mr-2" />
                  Buscar
                </Button>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Plants Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Centros de Operación</h2>
                      <Badge variant="secondary">{plants.length} plantas</Badge>
                    </div>
                    
                    <div className="grid gap-4">
                      {plants.map((plant) => (
                        <Card key={plant.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                  <Building className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                  <CardTitle className="text-base">{plant.name}</CardTitle>
                                  <CardDescription className="flex items-center gap-1 mt-1">
                                    <MapPin className="w-3 h-3" />
                                    {plant.location}
                                  </CardDescription>
                                </div>
                              </div>
                              <Badge variant={plant.status === 'active' ? 'default' : 'secondary'}>
                                {plant.status === 'active' ? 'Activo' : 'Mantenimiento'}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>{plant.workers} trabajadores</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-primary" />
                                  <span className="font-semibold text-primary">{plant.peopleInside} personas al interior</span>
                                </div>
                              </div>
                              {plant.alerts > 0 && (
                                <div className="flex items-center gap-2 text-destructive">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="font-medium">{plant.alerts} alertas</span>
                                </div>
                              )}
                            </div>

                            {/* Eventos de Seguridad por Planta */}
                            {plant.alerts > 0 && (
                              <div className="pt-3 border-t border-border">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                  <Shield className="w-4 h-4 text-destructive" />
                                  Eventos de Seguridad
                                </h4>
                                <div className="space-y-2">
                                  {recentAlerts
                                    .filter(alert => alert.plant === plant.name)
                                    .map(alert => (
                                      <Alert 
                                        key={alert.id} 
                                        variant={alert.type === 'critical' || alert.severity === 'grave' ? 'destructive' : 'default'}
                                        className={alert.severity === 'grave' ? 'border-2 border-destructive' : ''}
                                      >
                                        <AlertDescription className="text-xs">
                                          {alert.severity === 'grave' && (
                                            <Badge variant="destructive" className="text-xs mb-1">
                                              DELITO GRAVE
                                            </Badge>
                                          )}
                                          <p className="font-medium">{alert.message}</p>
                                          <span className="block text-muted-foreground mt-1">
                                            Hace {alert.time}
                                          </span>
                                        </AlertDescription>
                                      </Alert>
                                    ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Actividad Reciente</CardTitle>
                      <CardDescription>Últimas acciones del equipo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentActivities.map((activity) => (
                          <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              activity.type === 'security' ? 'bg-primary/10' : 'bg-secondary/10'
                            }`}>
                              {activity.type === 'security' ? (
                                <Shield className="w-4 h-4 text-primary" />
                              ) : (
                                <Users className="w-4 h-4 text-secondary" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.user}</p>
                              <p className="text-sm text-muted-foreground">{activity.action}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                Hace {activity.time}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Alerts */}
                  <Card className="border-destructive/50">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                        Alertas Activas
                      </CardTitle>
                      <CardDescription>Eventos de seguridad y registros penales</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentAlerts.map((alert) => (
                          <Alert 
                            key={alert.id} 
                            variant={alert.type === 'critical' || alert.severity === 'grave' || alert.type === 'high' ? 'destructive' : 'default'} 
                            className={`py-3 ${alert.severity === 'grave' ? 'border-2 border-destructive' : ''}`}
                          >
                            <AlertTitle className="text-sm font-medium mb-1 flex items-center gap-2">
                              {alert.plant}
                              {alert.severity === 'grave' && (
                                <Badge variant="destructive" className="text-xs">
                                  DELITO GRAVE
                                </Badge>
                              )}
                            </AlertTitle>
                            <AlertDescription className="text-xs">
                              {alert.message}
                            </AlertDescription>
                            <div className="flex items-center gap-1 mt-2 text-xs opacity-80">
                              <Clock className="w-3 h-3" />
                              Hace {alert.time}
                            </div>
                          </Alert>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Estadísticas Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Total Trabajadores</span>
                        <span className="text-lg font-bold">135</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Personas al Interior</span>
                        <span className="text-lg font-bold text-primary">303</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Alertas Activas</span>
                        <span className="text-lg font-bold text-destructive">4</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Verificaciones Hoy</span>
                        <span className="text-lg font-bold text-primary">28</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </ScrollArea>
        </main>
      </div>
    </SidebarProvider>
  );
}
