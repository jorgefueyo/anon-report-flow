
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn } from "lucide-react";

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
      console.log('Intentando login con email:', email);

      // Buscar administrador en la tabla administradores
      const { data: adminData, error: adminError } = await supabase
        .from('administradores')
        .select('*')
        .eq('email', email.trim())
        .eq('activo', true)
        .single();

      console.log('Resultado búsqueda admin:', { adminData, adminError });

      if (adminError || !adminData) {
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        return;
      }

      // Por simplicidad, verificamos que la contraseña no esté vacía
      // En un sistema real, aquí verificarías el hash de la contraseña
      if (!password.trim()) {
        toast({
          title: "Error",
          description: "La contraseña es requerida",
          variant: "destructive",
        });
        return;
      }

      // Guardar datos del admin en localStorage
      localStorage.setItem('backoffice_admin', JSON.stringify({
        id: adminData.id,
        email: adminData.email,
        nombre: adminData.nombre,
      }));

      console.log('Login exitoso, redirigiendo...');

      toast({
        title: "Login exitoso",
        description: `Bienvenido, ${adminData.nombre}`,
      });

      navigate('/backoffice/dashboard');

    } catch (error) {
      console.error('Error durante login:', error);
      toast({
        title: "Error",
        description: "Error inesperado durante el login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso al Backoffice
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inicia sesión para gestionar las denuncias
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
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
                  placeholder="admin@empresa.com"
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
                  placeholder="••••••••"
                  required
                  className="mt-1"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Para propósitos de demo:</p>
              <p>Email: admin@empresa.com</p>
              <p>Contraseña: cualquier valor</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackofficeLogin;
