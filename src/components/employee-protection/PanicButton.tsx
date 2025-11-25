import { useState, useRef } from "react";
import { AlertTriangle, Mic, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";

interface PanicButtonProps {
  employeeId: string;
  employeeName: string;
}

const INCIDENT_CATEGORIES = [
  { value: "robo", label: "Robo" },
  { value: "trafico_drogas", label: "Tráfico de Drogas" },
  { value: "rina", label: "Riña" },
  { value: "homicidio", label: "Homicidio" },
  { value: "arma_fuego", label: "Arma de Fuego o Disparos" },
  { value: "otro", label: "Otro (Especificar)" },
];

const PanicButton = ({ employeeId, employeeName }: PanicButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [category, setCategory] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const progressIntervalRef = useRef<number | null>(null);

  const { toast } = useToast();

  const handlePanicButtonClick = () => {
    setIsOpen(true);
    startRecording();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingProgress(0);

      // Progress bar animation
      const startTime = Date.now();
      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / 3000) * 100, 100);
        setRecordingProgress(progress);
      }, 50);

      // Stop after 3 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setRecordingProgress(100);
        }
      }, 3000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Error",
        description: "No se pudo acceder al micrófono",
        variant: "destructive",
      });
      setIsOpen(false);
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      toast({
        title: "Error",
        description: "Selecciona una categoría de incidente",
        variant: "destructive",
      });
      return;
    }

    if (category === "otro" && !customDescription.trim()) {
      toast({
        title: "Error",
        description: "Describe el incidente",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
        });
      });

      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      let audioUrl = null;

      // Upload audio if available
      if (audioBlob) {
        const fileName = `${employeeId}-${Date.now()}.webm`;
        const filePath = `recordings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("emergency-audio")
          .upload(filePath, audioBlob, {
            contentType: "audio/webm",
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("emergency-audio").getPublicUrl(filePath);

        audioUrl = publicUrl;
      }

      // Create emergency alert
      const { error: alertError } = await supabase.from("employee_alerts").insert({
        employee_id: employeeId,
        alert_type: "Botón de Pánico Activado",
        description: `Emergencia reportada: ${
          INCIDENT_CATEGORIES.find((c) => c.value === category)?.label
        }${category === "otro" ? ` - ${customDescription}` : ""}`,
        latitude,
        longitude,
        audio_url: audioUrl,
        location_link: locationLink,
        incident_category: category,
        custom_description: category === "otro" ? customDescription : null,
      });

      if (alertError) throw alertError;

      // Update employee status to alert
      await supabase
        .from("monitored_employees")
        .update({ alert_status: "alert" })
        .eq("id", employeeId);

      toast({
        title: "Alerta Enviada",
        description: "El área de seguridad ha sido notificada",
      });

      // Reset and close
      setIsOpen(false);
      setCategory("");
      setCustomDescription("");
      setAudioBlob(null);
      setRecordingProgress(0);
    } catch (error: any) {
      console.error("Error sending alert:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo enviar la alerta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setIsOpen(false);
    setIsRecording(false);
    setCategory("");
    setCustomDescription("");
    setAudioBlob(null);
    setRecordingProgress(0);
  };

  return (
    <>
      <Button
        onClick={handlePanicButtonClick}
        variant="destructive"
        size="lg"
        className="fixed bottom-8 right-8 h-20 w-20 rounded-full shadow-2xl animate-pulse"
      >
        <AlertTriangle className="h-10 w-10" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Botón de Pánico Activado
            </DialogTitle>
            <DialogDescription>
              Proporciona información sobre la emergencia
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Recording Status */}
            {isRecording ? (
              <div className="space-y-2 p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Mic className="h-5 w-5 text-destructive animate-pulse" />
                  <span className="font-medium">Grabando audio...</span>
                </div>
                <Progress value={recordingProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {Math.ceil((3000 - (recordingProgress / 100) * 3000) / 1000)}s
                  restantes
                </p>
              </div>
            ) : audioBlob ? (
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <Mic className="h-5 w-5 text-primary" />
                  <span className="font-medium">Audio grabado correctamente</span>
                </div>
              </div>
            ) : null}

            {/* Category Selection */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría del Incidente *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Description */}
            {category === "otro" && (
              <div className="space-y-2">
                <Label htmlFor="description">Descripción *</Label>
                <Textarea
                  id="description"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Describe brevemente la emergencia..."
                  rows={3}
                />
              </div>
            )}

            {/* Location Info */}
            <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
              📍 Tu ubicación GPS será compartida automáticamente con el área de
              seguridad
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isRecording || isSubmitting || !category}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Enviando..." : "Enviar Alerta"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PanicButton;
