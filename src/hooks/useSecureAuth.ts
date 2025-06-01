
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Administrator {
  id: string;
  email: string;
  nombre: string;
  empresa_id: string;
  activo: boolean;
}

export const useSecureAuth = () => {
  const [admin, setAdmin] = useState<Administrator | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const adminId = sessionStorage.getItem('adminId');
      
      if (!adminId) {
        setAdmin(null);
        setLoading(false);
        return;
      }

      console.log('Checking auth for admin:', adminId);

      const { data, error } = await supabase
        .from('administradores')
        .select('id, email, nombre, empresa_id, activo')
        .eq('id', adminId)
        .eq('activo', true)
        .single();

      if (error || !data) {
        console.error('Error verificando autenticación:', error);
        logout();
        return;
      }

      setAdmin(data);
    } catch (error) {
      console.error('Error en checkAuth:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoginLoading(true);
    try {
      // Simple password check using btoa
      const hashedPassword = btoa(password);

      const { data, error } = await supabase
        .from('administradores')
        .select('id, email, nombre, empresa_id, activo')
        .eq('email', email.toLowerCase())
        .eq('password_hash', hashedPassword)
        .eq('activo', true)
        .single();

      if (error || !data) {
        toast({
          title: "Error de autenticación",
          description: "Email o contraseña incorrectos",
          variant: "destructive",
        });
        return false;
      }

      sessionStorage.setItem('adminId', data.id);
      console.log('Admin logged in:', data);
      setAdmin(data);
      
      toast({
        title: "Acceso exitoso",
        description: `Bienvenido ${data.nombre}`,
      });

      navigate('/backoffice');
      return true;
    } catch (error) {
      console.error('Error en login:', error);
      toast({
        title: "Error",
        description: "Error al iniciar sesión",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminId');
    setAdmin(null);
    navigate('/backoffice/login');
    
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente",
    });
  };

  const isAuthenticated = !!admin;

  return {
    admin,
    loading,
    loginLoading,
    login,
    logout,
    isAuthenticated,
    checkAuth
  };
};
