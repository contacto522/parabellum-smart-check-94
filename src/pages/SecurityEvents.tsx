import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SecurityEvents = () => {
  const { toast } = useToast();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const plants = [
    { id: "1", name: "Centro Norte" },
    { id: "2", name: "Planta Sur" },
    { id: "3", name: "Planta Este" },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles([...attachedFiles, ...newFiles]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventTitle || !eventDescription || !riskLevel || !selectedPlant) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Evento registrado",
      description: "El evento de seguridad ha sido registrado exitosamente",
    });

    // Reset form
    setEventTitle("");
    setEventDescription("");
    setRiskLevel("");
    setSelectedPlant("");
    setAttachedFiles([]);
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "grave":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "medio":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "bajo":
        return <Info className="h-5 w-5 text-muted-foreground" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-6">Panel de Eventos de Seguridad</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Registrar Evento de Seguridad</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título del Evento */}
              <div className="space-y-2">
                <Label htmlFor="eventTitle">Título del Evento *</Label>
                <Input
                  id="eventTitle"
                  placeholder="Ej: Robo de computadores en sector 1"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="eventDescription">Descripción *</Label>
                <Textarea
                  id="eventDescription"
                  placeholder="Ej: El día de hoy sujeto desconocido rompe el candado y roba 3 computadores"
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              {/* Nivel de Riesgo */}
              <div className="space-y-2">
                <Label htmlFor="riskLevel">Nivel de Riesgo *</Label>
                <Select value={riskLevel} onValueChange={setRiskLevel}>
                  <SelectTrigger id="riskLevel">
                    <SelectValue placeholder="Seleccionar nivel de riesgo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grave">
                      <div className="flex items-center gap-2">
                        {getRiskIcon("grave")}
                        <span>Riesgo Grave</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="medio">
                      <div className="flex items-center gap-2">
                        {getRiskIcon("medio")}
                        <span>Riesgo Medio</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bajo">
                      <div className="flex items-center gap-2">
                        {getRiskIcon("bajo")}
                        <span>Riesgo Bajo</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Planta */}
              <div className="space-y-2">
                <Label htmlFor="plant">Planta *</Label>
                <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                  <SelectTrigger id="plant">
                    <SelectValue placeholder="Seleccionar planta" />
                  </SelectTrigger>
                  <SelectContent>
                    {plants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Adjuntar Archivos */}
              <div className="space-y-2">
                <Label htmlFor="files">Adjuntar Archivos</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" className="w-full" asChild>
                    <label htmlFor="files" className="cursor-pointer flex items-center justify-center gap-2">
                      <Upload className="h-4 w-4" />
                      {attachedFiles.length === 0 
                        ? "Seleccionar archivos" 
                        : `${attachedFiles.length} archivo(s) seleccionado(s)`}
                    </label>
                  </Button>
                  <input
                    id="files"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachedFiles.map((file, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        • {file.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full">
                Registrar Evento
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityEvents;
