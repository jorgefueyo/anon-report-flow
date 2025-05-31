
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
          configurada: boolean | null;
          codigo_postal: string | null;
          ciudad: string | null;
          provincia: string | null;
          pais: string | null;
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
          configurada?: boolean | null;
          codigo_postal?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          pais?: string | null;
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
          configurada?: boolean | null;
          codigo_postal?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          pais?: string | null;
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
          rol: string;
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
          rol?: string;
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
          rol?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
