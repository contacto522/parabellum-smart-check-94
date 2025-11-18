import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, FileSearch, History, UserCheck } from "lucide-react";

export default function RecursosHumanos() {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && !hasRole('recursos_humanos') && !hasRole('admin_seguridad')) {
      navigate('/dashboard');
    }
  }, [user, loading, hasRole, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || (!hasRole('recursos_humanos') && !hasRole('admin_seguridad'))) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Users className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">Recursos Humanos</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Gestión de Recursos Humanos</h2>
          <p className="text-muted-foreground">
            Herramientas para la gestión y verificación de personal
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Verificación de Personal */}
          <Card className="hover:shadow-glow transition-all cursor-pointer">
            <CardHeader>
              <UserCheck className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Verificación de Personal</CardTitle>
              <CardDescription>
                Consulta de antecedentes y validación de postulantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full">
                Verificar
              </Button>
            </CardContent>
          </Card>

          {/* Gestión de Postulantes */}
          <Card className="hover:shadow-glow transition-all cursor-pointer">
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Gestión de Postulantes</CardTitle>
              <CardDescription>
                Administración de candidatos y procesos de selección
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full">
                Gestionar
              </Button>
            </CardContent>
          </Card>

          {/* Análisis con IA */}
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

          {/* Historial de Consultas */}
          <Card className="hover:shadow-glow transition-all cursor-pointer">
            <CardHeader>
              <History className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Historial de Consultas</CardTitle>
              <CardDescription>
                Registro de todas las verificaciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full">
                Ver Historial
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
