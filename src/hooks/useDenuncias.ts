import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Denuncia, FormularioDenuncia, DenunciaArchivo } from '@/types/denuncia';
import { encryptData, decryptData } from '@/utils/encryption';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

export const useDenuncias = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendNewDenunciaNotification, sendEstadoCambioNotification } = useEmailNotifications();

  const enviarNotificacionDenunciante = async (denuncia: Denuncia, tipo: 'nueva_denuncia' | 'estado_cambio', estadoAnterior?: string) => {
    try {
      // Desencriptar el email del denunciante
      const emailDenunciante = decryptData(denuncia.email_encriptado);
      
      // Obtener empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('nombre')
        .eq('id', denuncia.empresa_id)
        .single();

      if (tipo === 'nueva_denuncia') {
        await sendNewDenunciaNotification(
          emailDenunciante,
          denuncia.codigo_seguimiento,
          empresa?.nombre
        );
      } else if (tipo === 'estado_cambio' && estadoAnterior) {
        await sendEstadoCambioNotification(
          emailDenunciante,
          denuncia.codigo_seguimiento,
          estadoAnterior,
          denuncia.estado,
          empresa?.nombre
        );
      }
    } catch (error) {
      console.error('Error enviando notificación al denunciante:', error);
    }
  };

  const enviarNotificacionAdministradores = async (tipo: 'nueva_denuncia' | 'estado_cambio', denunciaCode: string, estadoAnterior?: string, estadoNuevo?: string) => {
    try {
      // Obtener administradores activos
      const { data: administradores, error } = await supabase
        .from('administradores')
        .select('email, nombre')
        .eq('activo', true);

      if (error || !administradores) {
        console.error('Error obteniendo administradores:', error);
        return;
      }

      // Obtener empresa
      const { data: empresa } = await supabase
        .from('empresas')
        .select('nombre')
        .limit(1)
        .single();

      // Enviar notificaciones a todos los administradores
      for (const admin of administradores) {
        try {
          if (tipo === 'nueva_denuncia') {
            await sendNewDenunciaNotification(
              admin.email,
              denunciaCode,
              empresa?.nombre
            );
          } else if (tipo === 'estado_cambio' && estadoAnterior && estadoNuevo) {
            await sendEstadoCambioNotification(
              admin.email,
              denunciaCode,
              estadoAnterior,
              estadoNuevo,
              empresa?.nombre
            );
          }
        } catch (emailError) {
          console.error(`Error enviando email a ${admin.email}:`, emailError);
        }
      }
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
    }
  };

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

      // Enviar notificaciones al denunciante y administradores
      await Promise.all([
        enviarNotificacionDenunciante(denuncia, 'nueva_denuncia'),
        enviarNotificacionAdministradores('nueva_denuncia', denuncia.codigo_seguimiento)
      ]);

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

      // Obtener la denuncia completa antes de actualizar
      const { data: denunciaAnterior } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', denunciaId)
        .single();

      if (!denunciaAnterior) {
        throw new Error('No se encontró la denuncia');
      }

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

      // Obtener la denuncia actualizada
      const { data: denunciaActualizada } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', denunciaId)
        .single();

      // Enviar notificaciones si cambió el estado
      if (denunciaAnterior.estado !== nuevoEstado && denunciaActualizada) {
        await Promise.all([
          enviarNotificacionDenunciante(denunciaActualizada, 'estado_cambio', denunciaAnterior.estado),
          enviarNotificacionAdministradores(
            'estado_cambio', 
            denunciaAnterior.codigo_seguimiento,
            denunciaAnterior.estado,
            nuevoEstado
          )
        ]);
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
