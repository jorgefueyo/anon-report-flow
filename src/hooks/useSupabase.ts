
import { supabase } from "@/integrations/supabase/client";

export { supabase };

export type Database = {
  public: {
    Tables: {
      denuncias: {
        Row: {
          id: string;
          empresa_id: string | null;
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
          estado: 'pendiente' | 'en_proceso' | 'finalizada';
          asignado_a: string | null;
          observaciones_internas: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          empresa_id?: string | null;
          codigo_seguimiento?: string; // Opcional porque se genera automáticamente
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
          estado?: 'pendiente' | 'en_proceso' | 'finalizada';
          asignado_a?: string | null;
          observaciones_internas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          empresa_id?: string | null;
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
          estado?: 'pendiente' | 'en_proceso' | 'finalizada';
          asignado_a?: string | null;
          observaciones_internas?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      denuncia_archivos: {
        Row: {
          id: string;
          denuncia_id: string;
          nombre_archivo: string;
          ruta_archivo: string;
          tipo_archivo: string;
          tamano_archivo: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          denuncia_id: string;
          nombre_archivo: string;
          ruta_archivo: string;
          tipo_archivo: string;
          tamano_archivo?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          denuncia_id?: string;
          nombre_archivo?: string;
          ruta_archivo?: string;
          tipo_archivo?: string;
          tamano_archivo?: number | null;
          created_at?: string;
        };
      };
      seguimiento_denuncias: {
        Row: {
          id: string;
          denuncia_id: string;
          usuario_id: string | null;
          estado_anterior: string | null;
          estado_nuevo: string;
          operacion: string;
          acciones_realizadas: string | null;
          observaciones: string | null;
          fecha: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          denuncia_id: string;
          usuario_id?: string | null;
          estado_anterior?: string | null;
          estado_nuevo: string;
          operacion: string;
          acciones_realizadas?: string | null;
          observaciones?: string | null;
          fecha?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          denuncia_id?: string;
          usuario_id?: string | null;
          estado_anterior?: string | null;
          estado_nuevo?: string;
          operacion?: string;
          acciones_realizadas?: string | null;
          observaciones?: string | null;
          fecha?: string;
          created_at?: string;
        };
      };
      empresas: {
        Row: {
          id: string;
          nombre: string;
          cif: string;
          direccion: string | null;
          telefono: string | null;
          email: string | null;
          logo_url: string | null;
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
          configurada?: boolean | null;
          codigo_postal?: string | null;
          ciudad?: string | null;
          provincia?: string | null;
          pais?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      administradores: {
        Row: {
          id: string;
          email: string;
          nombre: string;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          nombre: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
