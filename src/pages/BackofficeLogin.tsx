
import { useState, useEffect } from "react";
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
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar si ya hay una sesión activa
    const adminData = localStorage.getItem('backoffice_admin');
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        console.log('Sesión activa encontrada:', parsedAdmin.email);
        
        // Verificar que el admin sigue siendo válido
        supabase
          .from('administradores')
          .select('*')
          .eq('id', parsedAdmin.id)
          .eq('activo', true)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              console.log('Sesión válida, redirigiendo...');
              // Si es primer login o requiere cambio de contraseña, redirigir apropiadamente
              if (data.primer_login || data.requiere_cambio_password) {
                navigate('/backoffice/cambiar-password');
              } else {
                navigate('/backoffice');
              }
            } else {
              console.log('Sesión inválida, limpiando...');
              localStorage.removeItem('backoffice_admin');
            }
          })
          .finally(() => {
            setCheckingSession(false);
          });
      } catch (error) {
        console.error('Error verificando sesión:', error);
        localStorage.removeItem('backoffice_admin');
        setCheckingSession(false);
      }
    } else {
      setCheckingSession(false);
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Intentando login con:', email);

      // Verificar credenciales en la tabla administradores
      const { data: admin, error } = await supabase
        .from('administradores')
        .select('*')
        .eq('email', email)
        .eq('password_hash', password)
        .eq('activo', true)
        .single();

      if (error || !admin) {
        console.error('Error de login:', error);
        toast({
          title: "Error de acceso",
          description: "Credenciales incorrectas",
          variant: "destructive",
        });
        return;
      }

      console.log('Login exitoso:', admin.email);

      // Guardar admin en localStorage para la sesión con timestamp
      const adminSessionData = {
        ...admin,
        sessionTimestamp: Date.now()
      };
      
      localStorage.setItem('backoffice_admin', JSON.stringify(adminSessionData));

      toast({
        title: "Acceso exitoso",
        description: `Bienvenido ${admin.nombre}`,
      });
      
      // Si es primer login o requiere cambio de contraseña, redirigir a cambiar contraseña
      if (admin.primer_login || admin.requiere_cambio_password) {
        navigate('/backoffice/cambiar-password');
      } else {
        navigate('/backoffice');
      }
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

  // Mostrar loading mientras verifica la sesión
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
