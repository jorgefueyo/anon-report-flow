
export interface Denuncia {
  id: string;
  codigo_seguimiento: string;
  categoria: string | null;
  estado: 'pendiente' | 'en_proceso' | 'finalizada';
  created_at: string;
  hechos: string;
}
