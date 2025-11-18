import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, LogOut, Users, FileSearch, AlertTriangle, Building, UserCog, History, UserX } from 'lucide-react';

export default function Dashboard() {
  const { user, loading, signOut, userRoles, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-10 h-10 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Parabellum Smart Check
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user.email}</p>
              <div className="flex gap-1 justify-end mt-1">
                {userRoles.length > 0 ? (
                  userRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role === 'admin_seguridad' ? 'Admin Seguridad' : 'Recursos Humanos'}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="outline" className="text-xs">Sin rol asignado</Badge>
                )}
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Panel de Control</h2>
          <p className="text-muted-foreground">
            Bienvenido a tu centro de operaciones de seguridad
          </p>
        </div>

        {userRoles.length === 0 && (
          <Card className="mb-6 border-amber-500/50 bg-amber-500/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                Rol Pendiente
              </CardTitle>
              <CardDescription>
                Tu cuenta no tiene roles asignados aún. Contacta al administrador para obtener acceso.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Control de Accesos */}
          {hasRole('admin_seguridad') && (
            <>
              <Card className="hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/access/control')}>
                <CardHeader>
                  <Shield className="w-10 h-10 text-primary mb-2" />
                  <CardTitle>Control de Accesos</CardTitle>
                  <CardDescription>
                    Validación de identidad y gestión de ingresos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="hero" className="w-full">
                    Acceder
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-glow transition-all cursor-pointer border-destructive/50" onClick={() => navigate('/access/blocked')}>
                <CardHeader>
                  <UserX className="w-10 h-10 text-destructive mb-2" />
                  <CardTitle>Lista de Bloqueados</CardTitle>
                  <CardDescription>
                    Gestión de usuarios con acceso restringido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="w-full">
                    Gestionar
                  </Button>
                </CardContent>
              </Card>
            </>
          )}

          {/* Gestión de Eventos */}
          {hasRole('admin_seguridad') && (
            <Card className="hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/security/events')}>
              <CardHeader>
                <AlertTriangle className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Eventos de Seguridad</CardTitle>
                <CardDescription>
                  Registro y análisis de incidentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Ver Eventos
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Recursos Humanos */}
          {hasRole('recursos_humanos') && (
            <Card className="hover:shadow-glow transition-all cursor-pointer">
              <CardHeader>
                <Users className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Verificación de Personal</CardTitle>
                <CardDescription>
                  Consulta de antecedentes y postulantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Consultar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Análisis IA */}
          {(hasRole('admin_seguridad') || hasRole('recursos_humanos')) && (
            <Card className="hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/ai/analysis')}>
              <CardHeader>
                <FileSearch className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Análisis con IA</CardTitle>
                <CardDescription>
                  Investigación y análisis de antecedentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Analizar
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Administración de Plantas */}
          {hasRole('admin_seguridad') && (
            <Card className="hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate('/admin/plants')}>
              <CardHeader>
                <Building className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Gestión de Plantas</CardTitle>
                <CardDescription>
                  Supervisión de todas las instalaciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Ver Plantas
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Mi Equipo de Trabajo */}
          {hasRole('admin_seguridad') && (
            <Card className="hover:shadow-glow transition-all cursor-pointer">
              <CardHeader>
                <UserCog className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Mi Equipo de Trabajo</CardTitle>
                <CardDescription>
                  Gestión de personal de seguridad y asignación de créditos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Gestionar Equipo
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Historial de Consultas RRHH */}
          {hasRole('recursos_humanos') && (
            <Card className="hover:shadow-glow transition-all cursor-pointer">
              <CardHeader>
                <History className="w-10 h-10 text-primary mb-2" />
                <CardTitle>Historial de Consultas</CardTitle>
                <CardDescription>
                  Registro completo de verificaciones de personal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="hero" className="w-full">
                  Ver Historial
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {userRoles.length === 0 && (
          <div className="mt-8 text-center text-muted-foreground">
            <p>Esperando asignación de rol para ver los módulos disponibles...</p>
          </div>
        )}
      </main>
    </div>
  );
}
