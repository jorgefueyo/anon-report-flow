import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Denuncia, FormularioDenuncia, DenunciaArchivo } from '@/types/denuncia';
import { secureEncryptData } from '@/utils/secureEncryption';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

export const useDenuncias = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendNewDenunciaNotification, sendEstadoCambioNotification } = useEmailNotifications();

  const enviarNotificacionDenunciante = async (denuncia: Denuncia, tipo: 'nueva_denuncia' | 'estado_cambio', estadoAnterior?: string) => {
    try {
      // Skip notification for now to avoid encryption issues
      console.log('Notification would be sent:', { tipo, denuncia: denuncia.codigo_seguimiento });
    } catch (error) {
      console.error('Error enviando notificación al denunciante:', error);
    }
  };

  const enviarNotificacionAdministradores = async (tipo: 'nueva_denuncia' | 'estado_cambio', denunciaCode: string, estadoAnterior?: string, estadoNuevo?: string) => {
    try {
      // Skip notification for now to avoid issues
      console.log('Admin notification would be sent:', { tipo, denunciaCode });
    } catch (error) {
      console.error('Error enviando notificaciones:', error);
    }
  };

  const crearDenuncia = async (datos: FormularioDenuncia): Promise<string | null> => {
    setLoading(true);
    try {
      console.log('Iniciando creación de denuncia con datos:', datos);

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
        // Create a default empresa if none exists
        console.log('No empresa found, creating default...');
        const { data: nuevaEmpresa, error: errorCreacion } = await supabase
          .from('empresas')
          .insert({
            nombre: 'Empresa Demo',
            cif: '12345678A',
            email: 'demo@empresa.com',
            configurada: true
          })
          .select()
          .single();

        if (errorCreacion || !nuevaEmpresa) {
          throw new Error('Error creando empresa por defecto: ' + errorCreacion?.message);
        }

        console.log('Empresa creada:', nuevaEmpresa);
        const empresa = nuevaEmpresa;

        // Generate codigo_seguimiento manually since trigger might not work
        const codigoSeguimiento = 'DEN-' + Math.random().toString(36).substr(2, 8).toUpperCase();

        const datosInsercion = {
          empresa_id: empresa.id,
          codigo_seguimiento: codigoSeguimiento,
          email_encriptado: secureEncryptData(datos.email),
          nombre_encriptado: datos.nombre ? secureEncryptData(datos.nombre) : null,
          telefono_encriptado: datos.telefono ? secureEncryptData(datos.telefono) : null,
          domicilio_encriptado: datos.domicilio ? secureEncryptData(datos.domicilio) : null,
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

        await Promise.all([
          enviarNotificacionDenunciante(denuncia, 'nueva_denuncia'),
          enviarNotificacionAdministradores('nueva_denuncia', denuncia.codigo_seguimiento)
        ]);

        toast({
          title: "Denuncia creada exitosamente",
          description: `Código de seguimiento: ${denuncia.codigo_seguimiento}`,
        });

        return denuncia.codigo_seguimiento;
      } else {
        const empresa = empresas[0];

        // Generate codigo_seguimiento manually
        const codigoSeguimiento = 'DEN-' + Math.random().toString(36).substr(2, 8).toUpperCase();

        const datosInsercion = {
          empresa_id: empresa.id,
          codigo_seguimiento: codigoSeguimiento,
          email_encriptado: secureEncryptData(datos.email),
          nombre_encriptado: datos.nombre ? secureEncryptData(datos.nombre) : null,
          telefono_encriptado: datos.telefono ? secureEncryptData(datos.telefono) : null,
          domicilio_encriptado: datos.domicilio ? secureEncryptData(datos.domicilio) : null,
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

        await Promise.all([
          enviarNotificacionDenunciante(denuncia, 'nueva_denuncia'),
          enviarNotificacionAdministradores('nueva_denuncia', denuncia.codigo_seguimiento)
        ]);

        toast({
          title: "Denuncia creada exitosamente",
          description: `Código de seguimiento: ${denuncia.codigo_seguimiento}`,
        });

        return denuncia.codigo_seguimiento;
      }
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

      const { data: denunciaAnterior, error: errorConsulta } = await supabase
        .from('denuncias')
        .select('*')
        .eq('id', denunciaId)
        .single();

      if (errorConsulta || !denunciaAnterior) {
        console.error('Error obteniendo denuncia:', errorConsulta);
        throw new Error('No se encontró la denuncia');
      }

      const { error: errorActualizacion } = await supabase
        .from('denuncias')
        .update({ 
          estado: nuevoEstado,
          observaciones_internas: observaciones,
          updated_at: new Date().toISOString()
        })
        .eq('id', denunciaId);

      if (errorActualizacion) {
        console.error('Error actualizando estado:', errorActualizacion);
        throw new Error('Error al actualizar el estado: ' + errorActualizacion.message);
      }

      if (observaciones || denunciaAnterior.estado !== nuevoEstado) {
        const { error: errorSeguimiento } = await supabase
          .from('seguimiento_denuncias')
          .insert({
            denuncia_id: denunciaId,
            estado_anterior: denunciaAnterior.estado !== nuevoEstado ? denunciaAnterior.estado : null,
            estado_nuevo: nuevoEstado,
            operacion: observaciones ? 'Actualización con observaciones' : 'Actualización de estado',
            acciones_realizadas: denunciaAnterior.estado !== nuevoEstado 
              ? `Estado cambiado de ${denunciaAnterior.estado} a ${nuevoEstado}` 
              : 'Observaciones añadidas',
            observaciones: observaciones || null
          });

        if (errorSeguimiento) {
          console.error('Error creando registro de seguimiento:', errorSeguimiento);
        }
      }

      if (denunciaAnterior.estado !== nuevoEstado) {
        const denunciaActualizada = { ...denunciaAnterior, estado: nuevoEstado };
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
        title: "Denuncia actualizada",
        description: observaciones ? "Observaciones añadidas correctamente" : `Estado actualizado a: ${nuevoEstado}`,
      });

      return true;
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo actualizar la denuncia",
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
