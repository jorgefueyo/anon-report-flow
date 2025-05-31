
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
      console.log('Iniciando creación de empresa y usuario administrador...');

      // Paso 1: Crear o verificar empresa demo
      let empresaId;
      const { data: empresaExistente } = await supabase
        .from('empresas')
        .select('id')
        .eq('cif', '12345678A')
        .maybeSingle();

      if (empresaExistente) {
        empresaId = empresaExistente.id;
        console.log('Empresa demo encontrada:', empresaId);
      } else {
        console.log('Creando empresa demo...');
        const { data: nuevaEmpresa, error: empresaError } = await supabase
          .from('empresas')
          .insert({
            nombre: 'Empresa Demo',
            cif: '12345678A',
            email: 'demo@empresa.com',
            direccion: 'Calle Demo 123, Madrid'
          })
          .select()
          .single();

        if (empresaError || !nuevaEmpresa) {
          console.error('Error creando empresa:', empresaError);
          toast({
            title: "Error",
            description: "No se pudo crear la empresa demo: " + (empresaError?.message || 'Error desconocido'),
            variant: "destructive",
          });
          return;
        }

        empresaId = nuevaEmpresa.id;
        console.log('Empresa demo creada:', empresaId);
      }

      // Paso 2: Eliminar usuario existente si existe (por si hay conflictos)
      console.log('Verificando usuario existente...');
      const { data: usuarioExistente } = await supabase
        .from('usuarios_backoffice')
        .select('auth_user_id')
        .eq('email', 'info@zerotek.es')
        .maybeSingle();

      if (usuarioExistente?.auth_user_id) {
        console.log('Eliminando usuario existente...');
        await supabase.auth.admin.deleteUser(usuarioExistente.auth_user_id);
      }

      // Paso 3: Crear usuario administrador en auth
      console.log('Creando usuario en auth...');
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'info@zerotek.es',
        password: 'admin1234',
        email_confirm: true,
        user_metadata: { 
          nombre: 'Administrador Zerotek'
        }
      });

      if (authError || !authData.user) {
        console.error('Error al crear usuario auth:', authError);
        toast({
          title: "Error al crear usuario",
          description: authError?.message || 'No se pudo crear el usuario',
          variant: "destructive",
        });
        return;
      }

      console.log('Usuario auth creado:', authData.user.id);

      // Paso 4: Crear registro en usuarios_backoffice
      console.log('Creando usuario backoffice...');
      const { data: backofficeUser, error: userError } = await supabase
        .from('usuarios_backoffice')
        .insert({
          auth_user_id: authData.user.id,
          empresa_id: empresaId,
          email: 'info@zerotek.es',
          nombre: 'Administrador Zerotek',
          rol: 'admin',
          activo: true
        })
        .select()
        .single();

      if (userError) {
        console.error('Error al crear usuario backoffice:', userError);
        toast({
          title: "Error al crear usuario del backoffice",
          description: userError.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Usuario backoffice creado:', backofficeUser);

      toast({
        title: "¡Configuración completada!",
        description: "Usuario: info@zerotek.es | Contraseña: admin1234",
      });

      setAdminExists(true);

    } catch (error) {
      console.error('Error general:', error);
      toast({
        title: "Error",
        description: "Error inesperado al configurar el sistema",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Método alternativo más simple - crear directamente en la base de datos
  const createSimpleAdmin = async () => {
    setLoading(true);

    try {
      console.log('Creando configuración simple...');

      // Insertar empresa demo directamente (ignorar si ya existe)
      await supabase
        .from('empresas')
        .upsert({
          cif: '12345678A',
          nombre: 'Empresa Demo',
          email: 'demo@empresa.com',
          direccion: 'Calle Demo 123, Madrid'
        });

      // Obtener la empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('id')
        .eq('cif', '12345678A')
        .single();

      if (!empresa) {
        throw new Error('No se pudo crear/encontrar la empresa');
      }

      // Crear usuario simple en backoffice (sin auth)
      const { data: simpleUser, error: simpleError } = await supabase
        .from('usuarios_backoffice')
        .upsert({
          empresa_id: empresa.id,
          email: 'admin@demo.com',
          nombre: 'Admin Simple',
          rol: 'admin',
          activo: true,
          auth_user_id: null // Sin auth por simplicidad
        })
        .select()
        .single();

      if (simpleError) {
        throw simpleError;
      }

      toast({
        title: "¡Usuario simple creado!",
        description: "Accede directamente desde /backoffice (sin login requerido)",
      });

      setAdminExists(true);

    } catch (error) {
      console.error('Error creando usuario simple:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el usuario simple",
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
              El sistema ya está configurado
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Opciones de acceso:</h4>
                <p className="text-sm text-gray-600">1. Email: info@zerotek.es | Contraseña: admin1234</p>
                <p className="text-sm text-gray-600">2. Acceso directo a /backoffice</p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => navigate('/login')}
                  className="flex-1"
                  variant="outline"
                >
                  Ir al Login
                </Button>
                <Button 
                  onClick={() => navigate('/backoffice')}
                  className="flex-1"
                >
                  Backoffice Directo
                </Button>
              </div>
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
            Elige el método de configuración
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Método Completo (con Auth):</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Email: info@zerotek.es</li>
                <li>• Contraseña: admin1234</li>
                <li>• Requiere login</li>
              </ul>
            </div>
            
            <Button 
              onClick={createDefaultAdmin} 
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={loading}
            >
              {loading ? (
                "Configurando..."
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Configuración Completa
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">O</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Método Simple (sin Auth):</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Acceso directo al backoffice</li>
                <li>• Sin necesidad de login</li>
                <li>• Ideal para desarrollo</li>
              </ul>
            </div>
            
            <Button 
              onClick={createSimpleAdmin} 
              className="w-full" 
              variant="outline"
              disabled={loading}
            >
              {loading ? (
                "Configurando..."
              ) : (
                "Configuración Simple"
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
