
import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Database = {
  public: {
    Tables: {
      empresas: {
        Row: {
          id: string;
          nombre: string;
          cif: string;
          direccion: string | null;
          telefono: string | null;
          email: string | null;
          logo_url: string | null;
          color_primario: string;
          color_secundario: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          cif: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          logo_url?: string | null;
          color_primario?: string;
          color_secundario?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          cif?: string;
          direccion?: string | null;
          telefono?: string | null;
          email?: string | null;
          logo_url?: string | null;
          color_primario?: string;
          color_secundario?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      usuarios_backoffice: {
        Row: {
          id: string;
          auth_user_id: string | null;
          empresa_id: string;
          email: string;
          nombre: string;
          rol: 'admin' | 'supervisor' | 'viewer';
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_user_id?: string | null;
          empresa_id: string;
          email: string;
          nombre: string;
          rol?: 'admin' | 'supervisor' | 'viewer';
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_user_id?: string | null;
          empresa_id?: string;
          email?: string;
          nombre?: string;
          rol?: 'admin' | 'supervisor' | 'viewer';
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      denuncias: {
        Row: {
          id: string;
          empresa_id: string;
          codigo_seguimiento: string;
          email_encriptado: string;
          nombre_encriptado: string | null;
          telefono_encriptado: string | null;
          domicilio_encriptado: string | null;
          relacion_empresa: string | null;
          categoria: string | null;
          hechos: string;
          fecha_hechos: string | null;
          lugar_hechos: string | null;
          testigos: string | null;
          personas_implicadas: string | null;
          estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
          asignado_a: string | null;
          observaciones_internas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id: string;
          codigo_seguimiento?: string;
          email_encriptado: string;
          nombre_encriptado?: string | null;
          telefono_encriptado?: string | null;
          domicilio_encriptado?: string | null;
          relacion_empresa?: string | null;
          categoria?: string | null;
          hechos: string;
          fecha_hechos?: string | null;
          lugar_hechos?: string | null;
          testigos?: string | null;
          personas_implicadas?: string | null;
          estado?: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
          asignado_a?: string | null;
          observaciones_internas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          empresa_id?: string;
          codigo_seguimiento?: string;
          email_encriptado?: string;
          nombre_encriptado?: string | null;
          telefono_encriptado?: string | null;
          domicilio_encriptado?: string | null;
          relacion_empresa?: string | null;
          categoria?: string | null;
          hechos?: string;
          fecha_hechos?: string | null;
          lugar_hechos?: string | null;
          testigos?: string | null;
          personas_implicadas?: string | null;
          estado?: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
          asignado_a?: string | null;
          observaciones_internas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
