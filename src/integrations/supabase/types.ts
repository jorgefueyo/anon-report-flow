export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      administradores: {
        Row: {
          activo: boolean | null
          created_at: string | null
          email: string
          empresa_id: string
          id: string
          nombre: string
          password_hash: string
          primer_login: boolean | null
          requiere_cambio_password: boolean | null
          updated_at: string | null
        }
        Insert: {
          activo?: boolean | null
          created_at?: string | null
          email: string
          empresa_id: string
          id?: string
          nombre: string
          password_hash: string
          primer_login?: boolean | null
          requiere_cambio_password?: boolean | null
          updated_at?: string | null
        }
        Update: {
          activo?: boolean | null
          created_at?: string | null
          email?: string
          empresa_id?: string
          id?: string
          nombre?: string
          password_hash?: string
          primer_login?: boolean | null
          requiere_cambio_password?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_administradores_empresa"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracion_correo: {
        Row: {
          activo: boolean | null
          created_at: string
          dominio_remitente: string | null
          email_remitente: string | null
          empresa_id: string
          id: string
          nombre_remitente: string | null
          resend_api_key: string | null
          updated_at: string
        }
        Insert: {
          activo?: boolean | null
          created_at?: string
          dominio_remitente?: string | null
          email_remitente?: string | null
          empresa_id: string
          id?: string
          nombre_remitente?: string | null
          resend_api_key?: string | null
          updated_at?: string
        }
        Update: {
          activo?: boolean | null
          created_at?: string
          dominio_remitente?: string | null
          email_remitente?: string | null
          empresa_id?: string
          id?: string
          nombre_remitente?: string | null
          resend_api_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracion_correo_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      denuncia_archivos: {
        Row: {
          created_at: string
          denuncia_id: string
          id: string
          nombre_archivo: string
          ruta_archivo: string
          tamano_archivo: number | null
          tipo_archivo: string
        }
        Insert: {
          created_at?: string
          denuncia_id: string
          id?: string
          nombre_archivo: string
          ruta_archivo: string
          tamano_archivo?: number | null
          tipo_archivo: string
        }
        Update: {
          created_at?: string
          denuncia_id?: string
          id?: string
          nombre_archivo?: string
          ruta_archivo?: string
          tamano_archivo?: number | null
          tipo_archivo?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncia_archivos_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      denuncias: {
        Row: {
          asignado_a: string | null
          categoria: string | null
          codigo_seguimiento: string
          created_at: string
          domicilio_encriptado: string | null
          email_encriptado: string
          empresa_id: string | null
          estado: string | null
          fecha_hechos: string | null
          hechos: string
          id: string
          lugar_hechos: string | null
          nombre_encriptado: string | null
          observaciones_internas: string | null
          personas_implicadas: string | null
          relacion_empresa: string | null
          telefono_encriptado: string | null
          testigos: string | null
          updated_at: string
        }
        Insert: {
          asignado_a?: string | null
          categoria?: string | null
          codigo_seguimiento: string
          created_at?: string
          domicilio_encriptado?: string | null
          email_encriptado: string
          empresa_id?: string | null
          estado?: string | null
          fecha_hechos?: string | null
          hechos: string
          id?: string
          lugar_hechos?: string | null
          nombre_encriptado?: string | null
          observaciones_internas?: string | null
          personas_implicadas?: string | null
          relacion_empresa?: string | null
          telefono_encriptado?: string | null
          testigos?: string | null
          updated_at?: string
        }
        Update: {
          asignado_a?: string | null
          categoria?: string | null
          codigo_seguimiento?: string
          created_at?: string
          domicilio_encriptado?: string | null
          email_encriptado?: string
          empresa_id?: string | null
          estado?: string | null
          fecha_hechos?: string | null
          hechos?: string
          id?: string
          lugar_hechos?: string | null
          nombre_encriptado?: string | null
          observaciones_internas?: string | null
          personas_implicadas?: string | null
          relacion_empresa?: string | null
          telefono_encriptado?: string | null
          testigos?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_asignado_a_fkey"
            columns: ["asignado_a"]
            isOneToOne: false
            referencedRelation: "administradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          cif: string
          ciudad: string | null
          codigo_postal: string | null
          configurada: boolean | null
          created_at: string
          direccion: string | null
          email: string | null
          id: string
          logo_url: string | null
          nombre: string
          pais: string | null
          provincia: string | null
          telefono: string | null
          updated_at: string
        }
        Insert: {
          cif: string
          ciudad?: string | null
          codigo_postal?: string | null
          configurada?: boolean | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nombre: string
          pais?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Update: {
          cif?: string
          ciudad?: string | null
          codigo_postal?: string | null
          configurada?: boolean | null
          created_at?: string
          direccion?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nombre?: string
          pais?: string | null
          provincia?: string | null
          telefono?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      seguimiento_denuncias: {
        Row: {
          acciones_realizadas: string | null
          created_at: string
          denuncia_id: string | null
          estado_anterior: string | null
          estado_nuevo: string
          fecha: string
          id: string
          observaciones: string | null
          operacion: string
          usuario_id: string | null
        }
        Insert: {
          acciones_realizadas?: string | null
          created_at?: string
          denuncia_id?: string | null
          estado_anterior?: string | null
          estado_nuevo: string
          fecha?: string
          id?: string
          observaciones?: string | null
          operacion: string
          usuario_id?: string | null
        }
        Update: {
          acciones_realizadas?: string | null
          created_at?: string
          denuncia_id?: string | null
          estado_anterior?: string | null
          estado_nuevo?: string
          fecha?: string
          id?: string
          observaciones?: string | null
          operacion?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seguimiento_denuncias_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seguimiento_denuncias_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "administradores"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_backoffice: {
        Row: {
          activo: boolean | null
          auth_user_id: string | null
          created_at: string
          email: string
          empresa_id: string
          id: string
          nombre: string
          rol: string
          updated_at: string
        }
        Insert: {
          activo?: boolean | null
          auth_user_id?: string | null
          created_at?: string
          email: string
          empresa_id: string
          id?: string
          nombre: string
          rol?: string
          updated_at?: string
        }
        Update: {
          activo?: boolean | null
          auth_user_id?: string | null
          created_at?: string
          email?: string
          empresa_id?: string
          id?: string
          nombre?: string
          rol?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_backoffice_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_initial_admin: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_codigo_seguimiento: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_admin_empresa_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_current_user_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      denuncia_estado: "pendiente" | "en_proceso" | "finalizada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      denuncia_estado: ["pendiente", "en_proceso", "finalizada"],
    },
  },
} as const
