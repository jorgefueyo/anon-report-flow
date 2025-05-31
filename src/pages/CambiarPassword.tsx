
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { KeyRound, Save } from "lucide-react";

interface Admin {
  id: string;
  email: string;
  nombre: string;
}

const CambiarPassword = () => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si hay admin logueado
    const adminData = localStorage.getItem('backoffice_admin');
    if (!adminData) {
      navigate('/backoffice/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/backoffice/login');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    if (!admin) return;

    setLoading(true);
    try {
      // Verificar contraseña actual
      const { data: adminData, error: verifyError } = await supabase
        .from('administradores')
        .select('*')
        .eq('id', admin.id)
        .eq('password_hash', currentPassword)
        .single();

      if (verifyError || !adminData) {
        toast({
          title: "Error",
          description: "La contraseña actual es incorrecta",
          variant: "destructive",
        });
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase
        .from('administradores')
        .update({ password_hash: newPassword })
        .eq('id', admin.id);

      if (updateError) throw updateError;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha cambiado correctamente",
      });

      // Limpiar formulario
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Redirigir al dashboard después de un breve delay
      setTimeout(() => {
        navigate('/backoffice');
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "Error al cambiar la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Cambiar Contraseña
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Hola {admin.nombre}, cambia tu contraseña por seguridad
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="current">Contraseña Actual</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="new">Nueva Contraseña</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="confirm">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "Cambiando contraseña..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Cambiar Contraseña
                </>
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/backoffice')}
              className="text-blue-600"
            >
              ← Volver al Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CambiarPassword;
