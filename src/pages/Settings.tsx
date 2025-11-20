import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';
import AlertContactsSection from '@/components/settings/AlertContactsSection';
import PlantAccessAccountsSection from '@/components/settings/PlantAccessAccountsSection';

export default function Settings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Configuraciones</h1>
        <p className="text-muted-foreground">
          Gestiona las configuraciones del sistema
        </p>
      </div>

      <Tabs defaultValue="alert-contacts" className="w-full">
        <TabsList>
          <TabsTrigger value="alert-contacts">Contactos de Alerta</TabsTrigger>
          <TabsTrigger value="plant-access">Cuentas de Acceso</TabsTrigger>
          <TabsTrigger value="general" disabled>General</TabsTrigger>
          <TabsTrigger value="notifications" disabled>Notificaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alert-contacts" className="mt-6">
          <AlertContactsSection />
        </TabsContent>
        
        <TabsContent value="plant-access" className="mt-6">
          <PlantAccessAccountsSection />
        </TabsContent>
        
        <TabsContent value="general" className="mt-6">
          <p className="text-muted-foreground">Próximamente...</p>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <p className="text-muted-foreground">Próximamente...</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
