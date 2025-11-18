import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, FileText, Calendar, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface CriminalRecord {
  type: string;
  date: string;
  description: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
}

export default function CriminalRecord() {
  const { rut } = useParams<{ rut: string }>();
  const navigate = useNavigate();
  const [personData, setPersonData] = useState<any>(null);
  const [records, setRecords] = useState<CriminalRecord[]>([]);

  useEffect(() => {
    // Simulated data - in production this would come from a real background check API
    if (rut) {
      // Mock person data
      setPersonData({
        rut: rut,
        name: 'Persona de Ejemplo',
        riskLevel: 'riesgo_alto',
      });

      // Mock criminal records
      setRecords([
        {
          type: 'Robo con intimidación',
          date: '2022-03-15',
          description: 'Participación en robo con intimidación en establecimiento comercial',
          location: 'Santiago, Región Metropolitana',
          severity: 'high',
        },
        {
          type: 'Receptación',
          date: '2021-08-22',
          description: 'Receptación de especies de procedencia ilícita',
          location: 'Valparaíso, Región de Valparaíso',
          severity: 'medium',
        },
      ]);
    }
  }, [rut]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'riesgo_alto':
        return <Badge variant="destructive" className="text-xs">Riesgo Alto</Badge>;
      case 'riesgo_medio':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">Riesgo Medio</Badge>;
      case 'sin_alertas':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">Sin Alertas</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Desconocido</Badge>;
    }
  };

  const getSeverityBadge = (severity: 'high' | 'medium' | 'low') => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Grave</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs">Medio</Badge>;
      case 'low':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white text-xs">Leve</Badge>;
    }
  };

  if (!personData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
        <div className="max-w-6xl mx-auto">
          <Button variant="ghost" onClick={() => navigate('/access/control')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Cargando información...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/access/control')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Control de Accesos
          </Button>
        </div>

        {/* Person Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{personData.name}</CardTitle>
                <CardDescription className="text-lg mt-2">RUT: {personData.rut}</CardDescription>
              </div>
              {getRiskBadge(personData.riskLevel)}
            </div>
          </CardHeader>
        </Card>

        {/* Criminal Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle>Historial Penal</CardTitle>
            </div>
            <CardDescription>
              Registros de antecedentes penales y delitos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {records.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Sin registros penales</p>
              </div>
            ) : (
              records.map((record, index) => (
                <div key={index}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-lg">{record.type}</h4>
                          {getSeverityBadge(record.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground">{record.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(record.date).toLocaleDateString('es-CL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{record.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
            <CardDescription>Detalles sobre la evaluación de riesgo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                Esta información proviene de consultas a registros públicos y bases de datos oficiales.
              </p>
              <p className="text-muted-foreground">
                Última actualización: {new Date().toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
