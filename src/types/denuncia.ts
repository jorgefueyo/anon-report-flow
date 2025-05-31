
export interface Denuncia {
  id: string;
  empresa_id: string | null;
  codigo_seguimiento: string;
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
  estado: 'pendiente' | 'en_proceso' | 'finalizada';
  asignado_a?: string | null;
  observaciones_internas?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DenunciaArchivo {
  id: string;
  denuncia_id: string;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamano_archivo?: number | null;
  created_at: string;
}

export interface SeguimientoDenuncia {
  id: string;
  denuncia_id: string;
  usuario_id?: string | null;
  estado_anterior?: string | null;
  estado_nuevo: string;
  operacion: string;
  acciones_realizadas?: string | null;
  observaciones?: string | null;
  fecha: string;
  created_at: string;
}

export interface FormularioDenuncia {
  email: string;
  nombre?: string;
  telefono?: string;
  domicilio?: string;
  relacion_empresa?: string;
  categoria?: string;
  hechos: string;
  fecha_hechos?: string;
  lugar_hechos?: string;
  testigos?: string;
  personas_implicadas?: string;
  archivos?: File[];
}
