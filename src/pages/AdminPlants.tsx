import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Building, AlertTriangle, Users, FileSearch, TrendingUp, MapPin, Activity, Clock, Search, UserCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { NavLink } from '@/components/NavLink';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const plants = [
  { 
    id: 1, 
    name: 'Centro Norte', 
    location: 'Región de Los Lagos', 
    workers: 45, 
    peopleInside: 120, 
    status: 'active', 
    alerts: 3, 
    securityStatus: 'critical',
    plantManager: {
      name: 'Carlos Andrés Muñoz Sepúlveda',
      rut: '16.234.567-8',
      phone: '+56 9 8765 4321',
      email: 'carlos.munoz@parabellum.cl'
    },
    accessControl: {
      name: 'Juan Andrés Perez Perez',
      status: 'critical',
      message: 'Checkeado alerta grave - Registros por homicidio, robo con intimidación',
      shiftChange: {
        hasNovelties: true,
        novelties: ['No funciona cámara de acceso', 'Falta registro de turno anterior']
      }
    }
  },
  { 
    id: 2, 
    name: 'Centro Sur', 
    location: 'Región de Aysén', 
    workers: 38, 
    peopleInside: 85, 
    status: 'active', 
    alerts: 0, 
    securityStatus: 'safe',
    plantManager: {
      name: 'María José Valenzuela Rojas',
      rut: '15.876.543-2',
      phone: '+56 9 7654 3210',
      email: 'maria.valenzuela@parabellum.cl'
    },
    accessControl: {
      name: 'Antonio Andrés Alvarado Alvarado',
      status: 'safe',
      message: 'Checkeado sin registros penales',
      shiftChange: {
        hasNovelties: false,
        novelties: []
      }
    }
  },
  { 
    id: 3, 
    name: 'Centro Austral', 
    location: 'Región de Magallanes', 
    workers: 52, 
    peopleInside: 98, 
    status: 'maintenance', 
    alerts: 1, 
    securityStatus: 'warning',
    plantManager: {
      name: 'Pedro Luis Contreras Vega',
      rut: '14.567.890-1',
      phone: '+56 9 6543 2109',
      email: 'pedro.contreras@parabellum.cl'
    },
    accessControl: {
      name: 'María Fernanda González Torres',
      status: 'warning',
      message: 'Checkeado alerta media - Verificación de antecedentes pendiente',
      shiftChange: {
        hasNovelties: true,
        novelties: ['Sistema de registro presenta intermitencia']
      }
    }
  },
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
                        <Card key={plant.id} className="hover:shadow-lg transition-shadow cursor-pointer relative overflow-hidden">
                          {/* Barra lateral de estado de seguridad */}
                          <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                            plant.securityStatus === 'critical' ? 'bg-red-600' :
                            plant.securityStatus === 'warning' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`} />
                          
                          <CardHeader className="pb-3 pl-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  plant.securityStatus === 'critical' ? 'bg-red-600/10' :
                                  plant.securityStatus === 'warning' ? 'bg-yellow-500/10' :
                                  'bg-green-500/10'
                                }`}>
                                  <Building className={`w-6 h-6 ${
                                    plant.securityStatus === 'critical' ? 'text-red-600' :
                                    plant.securityStatus === 'warning' ? 'text-yellow-600' :
                                    'text-green-600'
                                  }`} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <CardTitle className="text-base">{plant.name}</CardTitle>
                                    {/* Badge de estado de seguridad */}
                                    <Badge 
                                      variant="outline"
                                      className={`border-2 ${
                                        plant.securityStatus === 'critical' ? 'border-red-600 text-red-600 bg-red-600/5' :
                                        plant.securityStatus === 'warning' ? 'border-yellow-500 text-yellow-700 bg-yellow-500/5' :
                                        'border-green-500 text-green-700 bg-green-500/5'
                                      }`}
                                    >
                                      <div className={`w-2 h-2 rounded-full mr-1.5 ${
                                        plant.securityStatus === 'critical' ? 'bg-red-600' :
                                        plant.securityStatus === 'warning' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`} />
                                      {plant.securityStatus === 'critical' ? 'Crítico' :
                                       plant.securityStatus === 'warning' ? 'Alerta' :
                                       'Seguro'}
                                    </Badge>
                                  </div>
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
                          <CardContent className="space-y-4 pl-6">
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

                            {/* Encargado de Planta */}
                            <div className="pt-3 border-t border-border">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium flex items-center gap-2">
                                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                                  Encargado de Planta
                                </h4>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      Ver Ficha
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Ficha del Encargado de Planta</DialogTitle>
                                      <DialogDescription>
                                        {plant.name}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Nombre Completo</label>
                                        <p className="text-sm">{plant.plantManager.name}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">RUT</label>
                                        <p className="text-sm">{plant.plantManager.rut}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Teléfono Celular</label>
                                        <p className="text-sm">{plant.plantManager.phone}</p>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-sm font-medium text-muted-foreground">Correo Electrónico</label>
                                        <p className="text-sm">{plant.plantManager.email}</p>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                              <p className="text-sm text-muted-foreground">{plant.plantManager.name}</p>
                            </div>

                            {/* Control de Acceso - Turno Actual */}
                            <div className="pt-3 border-t border-border">
                              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                Turno - Control de Acceso
                              </h4>
                              <div className={`p-3 rounded-lg border ${
                                plant.accessControl.status === 'critical' ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900' :
                                plant.accessControl.status === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-900' :
                                'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900'
                              }`}>
                                <p className="text-sm font-medium mb-1">{plant.accessControl.name}</p>
                                <p className={`text-xs mb-2 ${
                                  plant.accessControl.status === 'critical' ? 'text-red-700 dark:text-red-300' :
                                  plant.accessControl.status === 'warning' ? 'text-yellow-700 dark:text-yellow-300' :
                                  'text-green-700 dark:text-green-300'
                                }`}>
                                  {plant.accessControl.message}
                                </p>
                                
                                {/* Cambio de Turno - Novedades */}
                                <div className="mt-3 pt-2 border-t border-current/10">
                                  <div className="flex items-start gap-2">
                                    <Clock className="w-3.5 h-3.5 mt-0.5 text-muted-foreground" />
                                    <div className="flex-1">
                                      <p className="text-xs font-medium mb-1">
                                        Cambio de turno: {plant.accessControl.shiftChange.hasNovelties ? (
                                          <span className="text-amber-600 dark:text-amber-400">Con novedad</span>
                                        ) : (
                                          <span className="text-green-600 dark:text-green-400">Sin novedad</span>
                                        )}
                                      </p>
                                      {plant.accessControl.shiftChange.hasNovelties && plant.accessControl.shiftChange.novelties.length > 0 && (
                                        <ul className="text-xs space-y-1 mt-2">
                                          {plant.accessControl.shiftChange.novelties.map((novelty, idx) => (
                                            <li key={idx} className="flex items-start gap-1.5">
                                              <span className="text-amber-600 dark:text-amber-400 mt-0.5">•</span>
                                              <span className="text-muted-foreground">{novelty}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
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
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-medium mb-3">Estado de Seguridad Global</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-red-600" />
                              <span className="text-sm">Crítico</span>
                            </div>
                            <span className="text-sm font-bold text-red-600">1</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-yellow-500" />
                              <span className="text-sm">Alerta</span>
                            </div>
                            <span className="text-sm font-bold text-yellow-600">1</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-green-500" />
                              <span className="text-sm">Seguro</span>
                            </div>
                            <span className="text-sm font-bold text-green-600">1</span>
                          </div>
                        </div>
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
