import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, AlertTriangle, Info, Filter, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InvolvedPerson {
  rut: string;
  name: string;
  role: string;
}

interface SecurityEvent {
  id: string;
  title: string;
  description: string;
  riskLevel: string;
  plantId: string;
  plantName: string;
  date: string;
  files: string[];
  involvedPeople?: InvolvedPerson[];
}

const SecurityEvents = () => {
  const { toast } = useToast();
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [selectedPlant, setSelectedPlant] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [involvedPeople, setInvolvedPeople] = useState<InvolvedPerson[]>([
    { rut: "", name: "", role: "" }
  ]);
  
  const [events, setEvents] = useState<SecurityEvent[]>([
    {
      id: "1",
      title: "Robo de computadores en sector 1",
      description: "El día de hoy sujeto desconocido rompe el candado y roba 3 computadores",
      riskLevel: "grave",
      plantId: "1",
      plantName: "Centro Norte",
      date: "2024-01-15",
      files: ["informe_robo.pdf"]
    }
  ]);
  
  const [filterPlant, setFilterPlant] = useState<string>("all");
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");

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

  const handleAddPerson = () => {
    setInvolvedPeople([...involvedPeople, { rut: "", name: "", role: "" }]);
  };

  const handleRemovePerson = (index: number) => {
    if (involvedPeople.length > 1) {
      setInvolvedPeople(involvedPeople.filter((_, i) => i !== index));
    }
  };

  const handlePersonChange = (index: number, field: keyof InvolvedPerson, value: string) => {
    const updated = [...involvedPeople];
    updated[index][field] = value;
    setInvolvedPeople(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!eventTitle || !eventDescription || !riskLevel || !selectedPlant) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty people entries
    const validPeople = involvedPeople.filter(p => p.rut && p.name && p.role);

    const newEvent: SecurityEvent = {
      id: Date.now().toString(),
      title: eventTitle,
      description: eventDescription,
      riskLevel,
      plantId: selectedPlant,
      plantName: plants.find(p => p.id === selectedPlant)?.name || "",
      date: new Date().toISOString().split('T')[0],
      files: attachedFiles.map(f => f.name),
      involvedPeople: validPeople
    };

    // Auto-block imputados
    const imputados = validPeople.filter(p => p.role === "imputado");
    
    for (const imputado of imputados) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase.from("blocked_users").insert({
          person_rut: imputado.rut,
          person_name: imputado.name,
          block_reason: `Imputado en evento: ${eventTitle}`,
          blocked_by: user?.id || null,
        });
      } catch (error) {
        console.error("Error blocking user:", error);
      }
    }

    setEvents([newEvent, ...events]);

    toast({
      title: "Evento registrado",
      description: imputados.length > 0 
        ? `Evento registrado. ${imputados.length} imputado(s) agregado(s) a la lista de bloqueados.`
        : "El evento de seguridad ha sido registrado exitosamente",
    });

    // Reset form
    setEventTitle("");
    setEventDescription("");
    setRiskLevel("");
    setSelectedPlant("");
    setAttachedFiles([]);
    setInvolvedPeople([{ rut: "", name: "", role: "" }]);
  };

  const filteredEvents = events.filter(event => {
    if (filterPlant !== "all" && event.plantId !== filterPlant) return false;
    if (filterRisk !== "all" && event.riskLevel !== filterRisk) return false;
    if (filterDate && event.date !== filterDate) return false;
    return true;
  });

  const getRiskBadge = (level: string) => {
    const variants = {
      grave: "destructive",
      medio: "default",
      bajo: "secondary"
    } as const;
    
    const labels = {
      grave: "Riesgo Grave",
      medio: "Riesgo Medio",
      bajo: "Riesgo Bajo"
    };

    return (
      <Badge variant={variants[level as keyof typeof variants]}>
        {labels[level as keyof typeof labels]}
      </Badge>
    );
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
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Panel de Eventos de Seguridad</h1>
        
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

              {/* Personas Involucradas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Personas involucradas</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPerson}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar persona
                  </Button>
                </div>

                {involvedPeople.map((person, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Persona {index + 1}</h4>
                        {involvedPeople.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePerson(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor={`rut-${index}`}>RUT</Label>
                          <Input
                            id={`rut-${index}`}
                            placeholder="12.345.678-9"
                            value={person.rut}
                            onChange={(e) => handlePersonChange(index, "rut", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`name-${index}`}>Nombre completo</Label>
                          <Input
                            id={`name-${index}`}
                            placeholder="Nombre completo"
                            value={person.name}
                            onChange={(e) => handlePersonChange(index, "name", e.target.value)}
                          />
                        </div>

                        <div>
                          <Label htmlFor={`role-${index}`}>Participación</Label>
                          <Select
                            value={person.role}
                            onValueChange={(value) => handlePersonChange(index, "role", value)}
                          >
                            <SelectTrigger id={`role-${index}`}>
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="testigo">Testigo</SelectItem>
                              <SelectItem value="victima">Víctima</SelectItem>
                              <SelectItem value="imputado">Imputado</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {person.role === "imputado" && person.rut && person.name && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                          <p className="text-sm text-destructive flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            Esta persona será agregada automáticamente a la lista de bloqueados
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
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

        {/* Tabla de Eventos Registrados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Eventos de Seguridad Registrados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="filterPlant">Filtrar por Planta</Label>
                <Select value={filterPlant} onValueChange={setFilterPlant}>
                  <SelectTrigger id="filterPlant">
                    <SelectValue placeholder="Todas las plantas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las plantas</SelectItem>
                    {plants.map((plant) => (
                      <SelectItem key={plant.id} value={plant.id}>
                        {plant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterRisk">Filtrar por Nivel de Riesgo</Label>
                <Select value={filterRisk} onValueChange={setFilterRisk}>
                  <SelectTrigger id="filterRisk">
                    <SelectValue placeholder="Todos los niveles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los niveles</SelectItem>
                    <SelectItem value="grave">Riesgo Grave</SelectItem>
                    <SelectItem value="medio">Riesgo Medio</SelectItem>
                    <SelectItem value="bajo">Riesgo Bajo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="filterDate">Filtrar por Fecha</Label>
                <Input
                  id="filterDate"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>

            {/* Tabla */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Planta</TableHead>
                    <TableHead>Nivel de Riesgo</TableHead>
                    <TableHead>Archivos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No se encontraron eventos que coincidan con los filtros
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.date}</TableCell>
                        <TableCell>{event.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{event.description}</TableCell>
                        <TableCell>{event.plantName}</TableCell>
                        <TableCell>{getRiskBadge(event.riskLevel)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {event.files.length > 0 ? `${event.files.length} archivo(s)` : "Sin archivos"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityEvents;
