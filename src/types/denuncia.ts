
export interface Denuncia {
  id: string;
  codigo_seguimiento: string;
  categoria: string | null;
  estado: 'pendiente' | 'asignada' | 'en_tramite' | 'finalizada';
  created_at: string;
  hechos: string;
}
