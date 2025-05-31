
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserPlus } from "lucide-react";

const SetupAdmin = () => {
  const [email, setEmail] = useState("admin@empresa.com");
  const [password, setPassword] = useState("admin123456");
  const [nombre, setNombre] = useState("Administrador");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSetupAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Verificar si ya existe la empresa demo, si no crearla
      let { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('*')
        .eq('cif', '12345678A')
        .maybeSingle();

      if (empresaError) {
        console.error('Error al buscar empresa:', empresaError);
        toast({
          title: "Error",
          description: "Error al verificar la empresa demo",
          variant: "destructive",
        });
        return;
      }

      // Si no existe la empresa demo, crearla
      if (!empresa) {
        const { data: nuevaEmpresa, error: crearEmpresaError } = await supabase
          .from('empresas')
          .insert({
            nombre: 'Empresa Demo',
            cif: '12345678A',
            email: 'demo@empresa.com',
            direccion: 'Calle Demo 123, Madrid'
          })
          .select()
          .single();

        if (crearEmpresaError) {
          console.error('Error al crear empresa:', crearEmpresaError);
          toast({
            title: "Error",
            description: "No se pudo crear la empresa demo",
            variant: "destructive",
          });
          return;
        }

        empresa = nuevaEmpresa;
      }

      // 1. Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast({
          title: "Error al crear usuario",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: "Error",
          description: "No se pudo crear el usuario",
          variant: "destructive",
        });
        return;
      }

      // 2. Crear registro en usuarios_backoffice con rol admin
      const { error: userError } = await supabase
        .from('usuarios_backoffice')
        .insert({
          auth_user_id: authData.user.id,
          empresa_id: empresa.id,
          email: email,
          nombre: nombre,
          rol: 'admin',
          activo: true
        });

      if (userError) {
        console.error('Error al crear usuario backoffice:', userError);
        toast({
          title: "Error al crear usuario del backoffice",
          description: userError.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Usuario administrador creado",
        description: `Se ha creado el usuario ${email} con rol de administrador`,
      });

      // Redirigir al login
      navigate('/login');

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al crear el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Configurar Administrador
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Crear el primer usuario administrador del sistema
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupAdmin} className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre del administrador"
                required
                className="mt-1"
              />
            </div>
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
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="mt-1"
              />
            </div>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? (
                "Creando administrador..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Administrador
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Button 
              variant="link" 
              onClick={() => navigate('/login')}
              className="text-blue-600"
            >
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;
