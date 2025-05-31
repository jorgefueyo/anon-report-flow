
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Denuncia, FormularioDenuncia, DenunciaArchivo } from '@/types/denuncia';
import { encryptData } from '@/utils/encryption';

export const useDenuncias = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const crearDenuncia = async (datos: FormularioDenuncia): Promise<string | null> => {
    setLoading(true);
    try {
      console.log('Iniciando creación de denuncia con datos:', datos);

      // Obtener la empresa por defecto (primera empresa)
      const { data: empresas, error: empresaError } = await supabase
        .from('empresas')
        .select('id, nombre')
        .limit(1);

      console.log('Empresas encontradas:', empresas);

      if (empresaError) {
        console.error('Error obteniendo empresa:', empresaError);
        throw new Error('Error al obtener empresa: ' + empresaError.message);
      }

      if (!empresas || empresas.length === 0) {
        throw new Error('No se encontró empresa configurada');
      }

      const empresa = empresas[0];

      // Preparar datos para inserción (sin codigo_seguimiento ya que se auto-genera)
      const datosInsercion = {
        empresa_id: empresa.id,
        email_encriptado: encryptData(datos.email),
        nombre_encriptado: datos.nombre ? encryptData(datos.nombre) : null,
        telefono_encriptado: datos.telefono ? encryptData(datos.telefono) : null,
        domicilio_encriptado: datos.domicilio ? encryptData(datos.domicilio) : null,
        relacion_empresa: datos.relacion_empresa || null,
        categoria: datos.categoria || null,
        hechos: datos.hechos,
        fecha_hechos: datos.fecha_hechos || null,
        lugar_hechos: datos.lugar_hechos || null,
        testigos: datos.testigos || null,
        personas_implicadas: datos.personas_implicadas || null,
        estado: 'pendiente'
      };

      console.log('Datos para inserción:', datosInsercion);

      // Crear la denuncia
      const { data: denuncia, error: denunciaError } = await supabase
        .from('denuncias')
        .insert(datosInsercion)
        .select()
        .single();

      console.log('Resultado inserción denuncia:', { denuncia, denunciaError });

      if (denunciaError) {
        console.error('Error creando denuncia:', denunciaError);
        throw new Error('Error al crear la denuncia: ' + denunciaError.message);
      }

      if (!denuncia) {
        throw new Error('No se pudo crear la denuncia');
      }

      console.log('Denuncia creada exitosamente:', denuncia);

      toast({
        title: "Denuncia creada exitosamente",
        description: `Código de seguimiento: ${denuncia.codigo_seguimiento}`,
      });

      return denuncia.codigo_seguimiento;
    } catch (error) {
      console.error('Error completo creando denuncia:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la denuncia. Intenta nuevamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoDenuncia = async (
    denunciaId: string, 
    nuevoEstado: string, 
    observaciones?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Actualizando estado de denuncia:', { denunciaId, nuevoEstado, observaciones });

      const { error } = await supabase
        .from('denuncias')
        .update({ 
          estado: nuevoEstado,
          observaciones_internas: observaciones,
          updated_at: new Date().toISOString()
        })
        .eq('id', denunciaId);

      if (error) {
        console.error('Error actualizando estado:', error);
        throw new Error('Error al actualizar el estado: ' + error.message);
      }

      toast({
        title: "Estado actualizado",
        description: `La denuncia ha sido actualizada a: ${nuevoEstado}`,
      });

      return true;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar el estado",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const asignarDenuncia = async (denunciaId: string, usuarioId: string): Promise<boolean> => {
    setLoading(true);
    try {
      console.log('Asignando denuncia:', { denunciaId, usuarioId });

      const { error } = await supabase
        .from('denuncias')
        .update({ 
          asignado_a: usuarioId,
          estado: 'asignada',
          updated_at: new Date().toISOString()
        })
        .eq('id', denunciaId);

      if (error) {
        console.error('Error asignando denuncia:', error);
        throw new Error('Error al asignar la denuncia: ' + error.message);
      }

      toast({
        title: "Denuncia asignada",
        description: "La denuncia ha sido asignada correctamente",
      });

      return true;
    } catch (error) {
      console.error('Error asignando denuncia:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo asignar la denuncia",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const buscarDenuncia = async (codigo: string): Promise<Denuncia | null> => {
    setLoading(true);
    try {
      console.log('Buscando denuncia con código:', codigo);
      
      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('codigo_seguimiento', codigo.trim())
        .maybeSingle();

      console.log('Resultado búsqueda:', { data, error });

      if (error) {
        console.error('Error en la consulta:', error);
        toast({
          title: "Error",
          description: "Error al buscar la denuncia",
          variant: "destructive",
        });
        return null;
      }

      if (!data) {
        toast({
          title: "No encontrado",
          description: "No se encontró ninguna denuncia con ese código",
          variant: "destructive",
        });
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error buscando denuncia:', error);
      toast({
        title: "Error",
        description: "Error al buscar la denuncia",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const buscarDenunciaPorId = async (id: string): Promise<Denuncia | null> => {
    setLoading(true);
    try {
      console.log('Buscando denuncia con ID:', id);
      
      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      console.log('Resultado búsqueda por ID:', { data, error });

      if (error) {
        console.error('Error en la consulta:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error buscando denuncia por ID:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const obtenerArchivosDenuncia = async (denunciaId: string): Promise<DenunciaArchivo[]> => {
    try {
      console.log('Obteniendo archivos para denuncia:', denunciaId);
      
      const { data, error } = await supabase
        .from('denuncia_archivos')
        .select('*')
        .eq('denuncia_id', denunciaId);

      console.log('Archivos encontrados:', { data, error });

      if (error) {
        console.error('Error obteniendo archivos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error obteniendo archivos:', error);
      return [];
    }
  };

  return {
    loading,
    crearDenuncia,
    buscarDenuncia,
    buscarDenunciaPorId,
    obtenerArchivosDenuncia,
    actualizarEstadoDenuncia,
    asignarDenuncia,
  };
};
