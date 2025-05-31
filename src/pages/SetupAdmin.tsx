import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, CheckCircle } from "lucide-react";

const SetupAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      // Verificar si ya existe un usuario admin
      const { data: adminUser } = await supabase
        .from('usuarios_backoffice')
        .select('*')
        .eq('email', 'info@zerotek.es')
        .eq('rol', 'admin')
        .maybeSingle();

      setAdminExists(!!adminUser);
    } catch (error) {
      console.error('Error checking admin:', error);
    } finally {
      setCheckingAdmin(false);
    }
  };

  const createDefaultAdmin = async () => {
    setLoading(true);

    try {
      // Ejecutar función para garantizar que existe la empresa demo
      const { data: empresaId, error: empresaError } = await supabase
        .rpc('create_initial_admin');

      if (empresaError) {
        console.error('Error creating empresa:', empresaError);
        toast({
          title: "Error",
          description: "No se pudo crear la empresa demo",
          variant: "destructive",
        });
        return;
      }

      // Crear usuario administrador en auth con email ya confirmado
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'info@zerotek.es',
        password: 'admin1234',
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: { 
          nombre: 'Administrador Zerotek',
          force_password_reset: true
        }
      });

      if (authError) {
        console.error('Error al crear usuario:', authError);
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

      // Obtener ID de empresa demo
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('cif', '12345678A')
        .single();

      if (!empresa) {
        toast({
          title: "Error",
          description: "No se encontró la empresa demo",
          variant: "destructive",
        });
        return;
      }

      // Crear registro en usuarios_backoffice
      const { error: userError } = await supabase
        .from('usuarios_backoffice')
        .insert({
          auth_user_id: authData.user.id,
          empresa_id: empresa.id,
          email: 'info@zerotek.es',
          nombre: 'Administrador Zerotek',
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
        description: "Usuario: info@zerotek.es | Contraseña: admin1234 (se solicitará cambio en el primer login)",
      });

      setAdminExists(true);

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

  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Verificando configuración...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Sistema Configurado
            </CardTitle>
            <p className="text-gray-600 mt-2">
              El usuario administrador ya está creado
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Credenciales de acceso:</h4>
                <p className="text-sm text-gray-600">Email: info@zerotek.es</p>
                <p className="text-sm text-gray-600">Contraseña: admin1234</p>
              </div>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Ir al Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Configurar Sistema
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Crear el usuario administrador predeterminado
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Se creará un usuario administrador con:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Email: info@zerotek.es</li>
                <li>• Contraseña: admin1234</li>
                <li>• Se solicitará cambio de contraseña en el primer login</li>
                <li>• Acceso completo al sistema</li>
              </ul>
            </div>
            
            <Button 
              onClick={createDefaultAdmin} 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading}
            >
              {loading ? (
                "Creando administrador..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Usuario Administrador
                </>
              )}
            </Button>
            
            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => navigate('/login')}
                className="text-blue-600"
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupAdmin;
