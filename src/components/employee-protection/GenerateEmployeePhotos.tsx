import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Loader2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  photo_url: string | null;
}

const GenerateEmployeePhotos = () => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const generatePhotos = async () => {
    try {
      setGenerating(true);

      // Get all employees without photos
      const { data: employees, error: fetchError } = await supabase
        .from("monitored_employees")
        .select("id, name, photo_url")
        .is("photo_url", null);

      if (fetchError) throw fetchError;

      if (!employees || employees.length === 0) {
        toast({
          title: "Info",
          description: "Todos los empleados ya tienen fotos asignadas",
        });
        return;
      }

      toast({
        title: "Generando fotos",
        description: `Generando fotos para ${employees.length} empleados...`,
      });

      // Generate photos for each employee
      for (const employee of employees) {
        try {
          // Determine gender from name (simple heuristic)
          const femaleNames = ["maría", "carmen", "ana", "patricia", "claudia"];
          const isFemale = femaleNames.some((name) =>
            employee.name.toLowerCase().includes(name)
          );

          const { data, error } = await supabase.functions.invoke(
            "generate-employee-photo",
            {
              body: {
                employeeName: employee.name,
                employeeGender: isFemale ? "female" : "male",
              },
            }
          );

          if (error) throw error;

          if (data.success && data.photo_url) {
            // Update employee with photo URL
            await supabase
              .from("monitored_employees")
              .update({ photo_url: data.photo_url })
              .eq("id", employee.id);

            console.log(`Photo generated for ${employee.name}`);
          }
        } catch (error) {
          console.error(`Error generating photo for ${employee.name}:`, error);
        }
      }

      toast({
        title: "Éxito",
        description: "Fotos generadas y asignadas correctamente",
      });

      // Reload the page to show new photos
      window.location.reload();
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron generar las fotos",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePhotos}
      disabled={generating}
      variant="outline"
      className="gap-2"
    >
      {generating ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generando fotos...
        </>
      ) : (
        <>
          <Camera className="h-4 w-4" />
          Generar Fotos con IA
        </>
      )}
    </Button>
  );
};

export default GenerateEmployeePhotos;
