import { Shield, Eye, Brain, Users, CheckCircle2, AlertTriangle, Lock, Wifi, Activity, TrendingUp, FileCheck, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-security.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-8 w-8 text-accent" />
              <span className="text-xl font-bold text-foreground">SecureControl</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#caracteristicas" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Características</a>
              <a href="#modulos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Módulos</a>
              <a href="#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Beneficios</a>
              <Button variant="hero" size="sm">Solicitar Demo</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-95" />
        <div className="absolute inset-0">
          <img src={heroImage} alt="Centro de control de seguridad" className="w-full h-full object-cover opacity-30" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-2 mb-6">
              <Lock className="h-4 w-4 text-accent" />
              <span className="text-sm text-accent font-medium">Plataforma de Seguridad Corporativa con IA</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-6 leading-tight">
              Control Total de Seguridad
              <span className="block text-accent mt-2">Desde un Solo Lugar</span>
            </h1>
            <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Solución escalable para plantas productivas, centros de cultivo y recintos corporativos.
              Validación de identidad, trazabilidad y análisis con IA en una plataforma unificada.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg">
                Solicitar Demostración
              </Button>
              <Button variant="hero-outline" size="lg" className="text-lg">
                Ver Características
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Primer Anillo de Seguridad */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm font-semibold text-primary">Centro de Control Unificado</span>
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Un Primer Anillo de Seguridad Corporativo
            </h2>
            <p className="text-lg text-muted-foreground">
              Centro de seguridad unificado donde se concentra toda la información crítica de su empresa
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 bg-card hover:shadow-card transition-all border-border/50">
              <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Estado de Instalaciones</h3>
              <p className="text-muted-foreground text-sm">
                Monitoreo en tiempo real de todas las plantas, centros y sucursales
              </p>
            </Card>

            <Card className="p-6 bg-card hover:shadow-card transition-all border-border/50">
              <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <AlertTriangle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Eventos de Seguridad</h3>
              <p className="text-muted-foreground text-sm">
                Trazabilidad completa de eventos en curso y su seguimiento
              </p>
            </Card>

            <Card className="p-6 bg-card hover:shadow-card transition-all border-border/50">
              <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Control de Accesos</h3>
              <p className="text-muted-foreground text-sm">
                Accesos autorizados y alertas preventivas generadas automáticamente
              </p>
            </Card>

            <Card className="p-6 bg-card hover:shadow-card transition-all border-border/50">
              <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <FileCheck className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Evaluaciones RRHH</h3>
              <p className="text-muted-foreground text-sm">
                Consultas y evaluaciones realizadas por Recursos Humanos
              </p>
            </Card>

            <Card className="p-6 bg-card hover:shadow-card transition-all border-border/50">
              <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Actividad de Personal</h3>
              <p className="text-muted-foreground text-sm">
                Seguimiento de actividad y movimientos internos del personal
              </p>
            </Card>

            <Card className="p-6 bg-card hover:shadow-card transition-all border-border/50">
              <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Visión Global</h3>
              <p className="text-muted-foreground text-sm">
                Actúe de forma rápida y coordinada ante cualquier situación
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Módulos Principales */}
      <section id="modulos" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Módulos de la Plataforma</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Funcionalidades integradas para una gestión completa de seguridad corporativa
            </p>
          </div>

          <div className="max-w-6xl mx-auto space-y-12">
            {/* Control de Accesos */}
            <Card className="p-8 bg-card border-border/50">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-accent/10 rounded-lg w-14 h-14 flex items-center justify-center">
                      <Lock className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground">Control de Accesos Inteligente</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Valida la identidad mediante escaneo de cédula o registro manual. 
                    El sistema revisa parámetros internos y genera alertas preventivas automáticamente.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Trazabilidad completa de ingresos y desplazamientos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Supervisión centralizada del acceso a instalaciones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Alertas inmediatas en dashboard y vía WhatsApp</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-accent rounded-lg p-8 text-center">
                  <Wifi className="h-24 w-24 text-accent-foreground mx-auto mb-4" />
                  <p className="text-accent-foreground font-semibold">Acceso en Tiempo Real</p>
                </div>
              </div>
            </Card>

            {/* IA */}
            <Card className="p-8 bg-card border-border/50">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-gradient-primary rounded-lg p-8 text-center">
                  <Brain className="h-24 w-24 text-primary-foreground mx-auto mb-4" />
                  <p className="text-primary-foreground font-semibold">Analista IA 24/7</p>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-accent/10 rounded-lg w-14 h-14 flex items-center justify-center">
                      <Brain className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground">IA al Servicio de la Seguridad</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Agente de inteligencia artificial especializado en análisis interno, 
                    capaz de revisar antecedentes y conectarse a fuentes OSINT legales.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Revisión de antecedentes internos de seguridad</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Conexión a fuentes OSINT legales para información complementaria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Análisis experto disponible las 24 horas</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Gestión de Eventos */}
            <Card className="p-8 bg-card border-border/50">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-accent/10 rounded-lg w-14 h-14 flex items-center justify-center">
                      <AlertTriangle className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground">Gestión de Eventos y Seguridad</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Registre y documente incidentes con fotos, ubicación y descripción. 
                    Realice análisis asistidos por IA para obtener contexto adicional.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Documentación completa con multimedia y geolocalización</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Identificación de patrones y recurrencias</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Seguimiento detallado desde consola central</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-gradient-accent rounded-lg p-8 text-center">
                  <Activity className="h-24 w-24 text-accent-foreground mx-auto mb-4" />
                  <p className="text-accent-foreground font-semibold">Trazabilidad Total</p>
                </div>
              </div>
            </Card>

            {/* RRHH */}
            <Card className="p-8 bg-card border-border/50">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="order-2 md:order-1 bg-gradient-primary rounded-lg p-8 text-center">
                  <Users className="h-24 w-24 text-primary-foreground mx-auto mb-4" />
                  <p className="text-primary-foreground font-semibold">Módulo Especializado RRHH</p>
                </div>
                <div className="order-1 md:order-2">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-accent/10 rounded-lg w-14 h-14 flex items-center justify-center">
                      <Search className="h-7 w-7 text-accent" />
                    </div>
                    <h3 className="text-2xl font-bold text-card-foreground">Módulo para Recursos Humanos</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Acceso especializado para RRHH con verificación legal y judicial de postulantes, 
                    usando información pública del Poder Judicial.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Verificación legal y judicial automatizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Apoyo del agente IA para evaluación completa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Evaluación confiable alineada a seguridad interna</span>
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section id="beneficios" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Beneficios Estratégicos</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Proteja su inversión y optimice la seguridad de toda su operación
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: Shield, title: "Control Total", desc: "Una sola plataforma para todas las instalaciones" },
              { icon: Eye, title: "Visión Global", desc: "Seguridad en tiempo real de todas las plantas" },
              { icon: TrendingUp, title: "Eficiencia Mejorada", desc: "Procesos optimizados entre equipos" },
              { icon: Activity, title: "Respuesta Rápida", desc: "Acción coordinada ante incidentes" },
              { icon: FileCheck, title: "Trazabilidad Completa", desc: "Registro detallado de personas y eventos" },
              { icon: Brain, title: "IA Investigativa", desc: "Fortalece investigaciones internas" },
              { icon: Lock, title: "Protección de Activos", desc: "Reduce pérdidas por sustracción" },
              { icon: AlertTriangle, title: "Prevención Activa", desc: "Evita accesos no autorizados" },
              { icon: CheckCircle2, title: "Cumplimiento", desc: "Verificaciones legales automatizadas" },
            ].map((benefit, idx) => (
              <Card key={idx} className="p-6 bg-card hover:shadow-card transition-all border-border/50">
                <div className="bg-accent/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-lg font-semibold text-card-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground text-sm">{benefit.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-primary-foreground mb-6">
              Transforme la Seguridad de su Empresa
            </h2>
            <p className="text-xl text-primary-foreground/80 mb-8">
              Únase a las empresas que ya confían en nuestra plataforma para proteger 
              sus activos y optimizar su seguridad corporativa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg">
                Solicitar Demostración
              </Button>
              <Button variant="hero-outline" size="lg" className="text-lg">
                Contactar Ventas
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-accent" />
                <span className="font-bold text-foreground">SecureControl</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Plataforma de seguridad y control de accesos con inteligencia artificial.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Casos de Uso</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Acerca de</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Términos</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Seguridad</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SecureControl. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
