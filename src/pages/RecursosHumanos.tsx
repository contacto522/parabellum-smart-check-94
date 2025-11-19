import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Users, Search, FileSearch, History, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type QueryResult = {
  id: string;
  query_date: string;
  person_rut: string;
  person_name: string | null;
  query_type: string;
  risk_level: string;
  risk_description: string | null;
  results_summary: any;
  delito: string | null;
  numero_causa: string | null;
  tribunal: string | null;
  situacion_legal: string | null;
};

export default function RecursosHumanos() {
  const { user, loading, hasRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rut, setRut] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);
  const [historyFilter, setHistoryFilter] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
    if (!loading && !hasRole('recursos_humanos') && !hasRole('admin_seguridad')) {
      navigate('/dashboard');
    }
  }, [user, loading, hasRole, navigate]);

  useEffect(() => {
    if (user) {
      loadQueryHistory();
    }
  }, [user]);

  const loadQueryHistory = async () => {
    const { data, error } = await supabase
      .from('hr_queries')
      .select('*')
      .order('query_date', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading history:', error);
      return;
    }

    setQueryHistory(data || []);
  };

  const handleSearch = async () => {
    if (!rut.trim()) {
      toast({
        title: "Error",
        description: "Debes ingresar un RUT",
        variant: "destructive",
      });
      return;
    }

    setSearching(true);
    
    // Simular búsqueda (en producción esto consultaría APIs reales)
    const riskLevel = Math.random() > 0.5 ? "high" : Math.random() > 0.3 ? "medium" : "low";
    const hasRecords = riskLevel !== "low";
    
    const mockResult: QueryResult = {
      id: crypto.randomUUID(),
      query_date: new Date().toISOString(),
      person_rut: rut,
      person_name: "Persona Consultada",
      query_type: "criminal_record",
      risk_level: riskLevel,
      risk_description: hasRecords ? "Registros penales encontrados" : null,
      delito: hasRecords ? "Robo con intimidación" : null,
      numero_causa: hasRecords ? "RUC-1234-2023" : null,
      tribunal: hasRecords ? "7° Juzgado de Garantía de Santiago" : null,
      situacion_legal: hasRecords ? (Math.random() > 0.7 ? "privado_libertad" : "libre") : null,
      results_summary: {
        criminal_records: hasRecords ? [
          { type: "Robo con intimidación", severity: "Grave", date: "2022-03-14" }
        ] : [],
        labor_claims: []
      }
    };

    // Guardar consulta en la base de datos
    const { error } = await supabase
      .from('hr_queries')
      .insert({
        person_rut: rut,
        person_name: mockResult.person_name,
        query_type: mockResult.query_type,
        risk_level: mockResult.risk_level,
        risk_description: mockResult.risk_description,
        delito: mockResult.delito,
        numero_causa: mockResult.numero_causa,
        tribunal: mockResult.tribunal,
        situacion_legal: mockResult.situacion_legal,
        results_summary: mockResult.results_summary,
        queried_by: user?.id
      });

    if (error) {
      console.error('Error saving query:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la consulta",
        variant: "destructive",
      });
    } else {
      loadQueryHistory();
    }

    setSearchResult(mockResult);
    setSearching(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case "high": return "Riesgo Alto";
      case "medium": return "Riesgo Medio";
      case "low": return "Sin Alertas";
      default: return "Desconocido";
    }
  };

  const filteredHistory = queryHistory.filter(q => 
    q.person_rut.toLowerCase().includes(historyFilter.toLowerCase()) ||
    q.person_name?.toLowerCase().includes(historyFilter.toLowerCase()) ||
    q.delito?.toLowerCase().includes(historyFilter.toLowerCase()) ||
    q.numero_causa?.toLowerCase().includes(historyFilter.toLowerCase())
  );

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
            <h1 className="text-2xl font-bold">Verificación de personas</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              Consulta de Antecedentes
            </CardTitle>
            <CardDescription>
              Ingresa el RUT para consultar registros penales y demandas laborales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Ej: 12345678-9"
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={searching}>
                {searching ? "Consultando..." : "Buscar"}
              </Button>
            </div>

            {/* Quick Access to AI */}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/ai/analysis')}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              Acceso Directo a Análisis con IA
            </Button>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResult && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado de Verificación</CardTitle>
              <CardDescription>
                Información detallada de la consulta realizada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Delito</TableHead>
                    <TableHead>RUC/N° Causa</TableHead>
                    <TableHead>Tribunal</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Situación</TableHead>
                    <TableHead>Nivel Riesgo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">{searchResult.person_name || "Sin nombre"}</TableCell>
                    <TableCell>{searchResult.person_rut}</TableCell>
                    <TableCell>{searchResult.delito || "N/A"}</TableCell>
                    <TableCell>{searchResult.numero_causa || "N/A"}</TableCell>
                    <TableCell>{searchResult.tribunal || "N/A"}</TableCell>
                    <TableCell>
                      {format(new Date(searchResult.query_date), "dd/MM/yyyy", { locale: es })}
                    </TableCell>
                    <TableCell>
                      {searchResult.situacion_legal === 'privado_libertad' ? (
                        <Badge variant="destructive">Privado de libertad</Badge>
                      ) : searchResult.situacion_legal === 'libre' ? (
                        <Badge variant="secondary">Libre</Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRiskColor(searchResult.risk_level)}>
                        {getRiskLabel(searchResult.risk_level)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Query History */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-6 h-6 text-primary" />
                  Historial de Consultas
                </CardTitle>
                <CardDescription>
                  Últimas verificaciones realizadas
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar en historial por RUT, nombre o delito..."
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
            />

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>RUT</TableHead>
                    <TableHead>Delito</TableHead>
                    <TableHead>N° Causa</TableHead>
                    <TableHead>Tribunal</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Situación</TableHead>
                    <TableHead>Riesgo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((query) => (
                      <TableRow 
                        key={query.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => navigate(`/criminal-record/${query.person_rut}`)}
                      >
                        <TableCell className="font-medium">{query.person_name || "Sin nombre"}</TableCell>
                        <TableCell>{query.person_rut}</TableCell>
                        <TableCell>{query.delito || "N/A"}</TableCell>
                        <TableCell>{query.numero_causa || "N/A"}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{query.tribunal || "N/A"}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(query.query_date), "dd/MM/yyyy HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell>
                          {query.situacion_legal === 'privado_libertad' ? (
                            <Badge variant="destructive">Privado</Badge>
                          ) : query.situacion_legal === 'libre' ? (
                            <Badge variant="secondary">Libre</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRiskColor(query.risk_level)}>
                            {getRiskLabel(query.risk_level)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No hay consultas en el historial
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
