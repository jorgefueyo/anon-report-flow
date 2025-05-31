
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Building2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const BackofficeLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar credenciales en la tabla administradores
      const { data: admin, error } = await supabase
        .from('administradores')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password) // Por simplicidad, sin hash por ahora
        .eq('activo', true)
        .single();

      if (error || !admin) {
        toast({
          title: "Error de acceso",
          description: "Credenciales incorrectas",
          variant: "destructive",
        });
        return;
      }

      // Guardar admin en localStorage para la sesión
      localStorage.setItem('backoffice_admin', JSON.stringify(admin));

      toast({
        title: "Acceso exitoso",
        description: `Bienvenido ${admin.nombre}`,
      });
      
      navigate('/backoffice');
    } catch (error) {
      console.error('Error de login:', error);
      toast({
        title: "Error",
        description: "Error inesperado al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <AppHeader showButtons={false} />
      <div className="flex items-center justify-center p-4 mt-20">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Backoffice - Acceso
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Ingresa tus credenciales para continuar
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="info@zerotek.es"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin1234"
                  required
                  className="mt-1"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  "Iniciando sesión..."
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Credenciales por defecto:</h4>
              <p className="text-sm text-blue-700">Email: info@zerotek.es</p>
              <p className="text-sm text-blue-700">Contraseña: admin1234</p>
            </div>
            
            <div className="mt-6 text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/')}
                className="text-blue-600"
              >
                ← Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackofficeLogin;
