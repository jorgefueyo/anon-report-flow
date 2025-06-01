import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Denuncia, FormularioDenuncia, DenunciaArchivo } from '@/types/denuncia';
import { secureEncryptData, secureDecryptData } from '@/utils/secureEncryption';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useEmpresa } from '@/hooks/useEmpresa';

export const useDenuncias = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendNewDenunciaNotification, sendEstadoCambioNotification, sendNotificationToAdmins } = useEmailNotifications();
  const { ensureEmpresaExists } = useEmpresa();

  const enviarNotificacionDenunciante = async (denuncia: Denuncia, tipo: 'nueva_denuncia' | 'estado_cambio', estadoAnterior?: string) => {
    try {
      console.log('Enviando notificación al denunciante:', { tipo, codigo: denuncia.codigo_seguimiento });
      
      const emailDenunciante = secureDecryptData(denuncia.email_encriptado);
      
      if (tipo === 'nueva_denuncia') {
        await sendNewDenunciaNotification(emailDenunciante, denuncia.codigo_seguimiento);
      } else {
        await sendEstadoCambioNotification(
          emailDenunciante, 
          denuncia.codigo_seguimiento, 
          estadoAnterior!, 
          denuncia.estado
        );
      }
      
      console.log('Notificación enviada al denunciante exitosamente');
    } catch (error) {
      console.error('Error enviando notificación al denunciante:', error);
    }
  };

  const subirArchivos = async (archivos: File[], denunciaId: string): Promise<boolean> => {
    if (!archivos || archivos.length === 0) return true;

    try {
      console.log('Iniciando subida de archivos para denuncia:', denunciaId);
      console.log('Archivos a subir:', archivos.map(f => ({ name: f.name, size: f.size, type: f.type })));

      for (let i = 0; i < archivos.length; i++) {
        const archivo = archivos[i];
        console.log(`Procesando archivo ${i + 1}/${archivos.length}:`, archivo.name);

        // Validar archivo
        if (!archivo.name || archivo.size === 0) {
          console.warn('Archivo inválido detectado:', archivo);
          continue;
        }

        // Validar tamaño de archivo (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (archivo.size > maxSize) {
          console.error(`Archivo ${archivo.name} excede el tamaño máximo de 10MB`);
          throw new Error(`El archivo ${archivo.name} es demasiado grande (máximo 10MB)`);
        }

        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substr(2, 9);
        const extension = archivo.name.split('.').pop() || 'bin';
        const nombreArchivo = `${denunciaId}/${timestamp}-${randomString}.${extension}`;
        
        console.log('Subiendo archivo como:', nombreArchivo);

        // Subir archivo al storage con configuración específica
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('denuncia-archivos')
          .upload(nombreArchivo, archivo, {
            cacheControl: '3600',
            upsert: false,
            contentType: archivo.type || 'application/octet-stream'
          });

        if (uploadError) {
          console.error('Error subiendo archivo al storage:', uploadError);
          console.error('Detalles del error:', {
            message: uploadError.message,
            archivo: archivo.name,
            ruta: nombreArchivo
          });
          throw new Error(`Error subiendo ${archivo.name}: ${uploadError.message}`);
        }

        console.log('Archivo subido exitosamente al storage:', uploadData);

        // Guardar referencia en la base de datos
        const datosArchivo = {
          denuncia_id: denunciaId,
          nombre_archivo: archivo.name,
          tipo_archivo: archivo.type || 'application/octet-stream',
          tamano_archivo: archivo.size,
          ruta_archivo: nombreArchivo
        };

        console.log('Guardando referencia en BD:', datosArchivo);

        const { data: dbData, error: dbError } = await supabase
          .from('denuncia_archivos')
          .insert(datosArchivo)
          .select()
          .single();

        if (dbError) {
          console.error('Error guardando referencia del archivo en BD:', dbError);
          console.error('Datos que se intentaron insertar:', datosArchivo);
          
          // Intentar eliminar el archivo del storage si falló la BD
          try {
            await supabase.storage
              .from('denuncia-archivos')
              .remove([nombreArchivo]);
            console.log('Archivo eliminado del storage debido a error en BD');
          } catch (deleteError) {
            console.error('Error eliminando archivo del storage:', deleteError);
          }
          
          throw new Error(`Error guardando referencia de ${archivo.name}: ${dbError.message}`);
        }

        console.log('Referencia del archivo guardada exitosamente en BD:', dbData);
      }

      console.log('Todos los archivos procesados exitosamente');
      return true;
    } catch (error) {
      console.error('Error general en subirArchivos:', error);
      throw error;
    }
  };

  const crearDenuncia = async (datos: FormularioDenuncia): Promise<string | null> => {
    setLoading(true);
    try {
      console.log('Iniciando creación de denuncia con datos:', datos);

      const empresa = await ensureEmpresaExists();
      
      if (!empresa) {
        throw new Error('No se pudo obtener o crear la empresa');
      }

      console.log('Using empresa:', empresa);

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

      // Subir archivos si existen
      if (datos.archivos && datos.archivos.length > 0) {
        console.log('Subiendo archivos adjuntos...');
        try {
          await subirArchivos(datos.archivos, denuncia.id);
          console.log('Archivos subidos exitosamente');
        } catch (archivoError) {
          console.error('Error subiendo archivos:', archivoError);
          // Relanzar el error para que se maneje arriba
          throw new Error(`La denuncia se creó pero falló la subida de archivos: ${archivoError instanceof Error ? archivoError.message : 'Error desconocido'}`);
        }
      }

      // Enviar notificaciones por email
      try {
        await Promise.all([
          enviarNotificacionDenunciante(denuncia, 'nueva_denuncia'),
          sendNotificationToAdmins('nueva_denuncia', denuncia.codigo_seguimiento, undefined, undefined, empresa.nombre)
        ]);
      } catch (emailError) {
        console.error('Error enviando notificaciones:', emailError);
      }

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

      // Optimized: obtener solo los campos necesarios
      const { data: denunciaAnterior, error: errorConsulta } = await supabase
        .from('denuncias')
        .select('id, codigo_seguimiento, estado, email_encriptado')
        .eq('id', denunciaId)
        .single();

      if (errorConsulta || !denunciaAnterior) {
        console.error('Error obteniendo denuncia:', errorConsulta);
        throw new Error('No se encontró la denuncia');
      }

      // Optimized: solo actualizar si hay cambios reales
      const datosActualizacion: any = {};
      let hayActualizacion = false;

      if (nuevoEstado !== denunciaAnterior.estado) {
        datosActualizacion.estado = nuevoEstado;
        hayActualizacion = true;
      }

      if (observaciones?.trim()) {
        datosActualizacion.observaciones_internas = observaciones.trim();
        hayActualizacion = true;
      }

      // Solo actualizar si hay cambios
      if (hayActualizacion) {
        datosActualizacion.updated_at = new Date().toISOString();
        
        const { error: errorActualizacion } = await supabase
          .from('denuncias')
          .update(datosActualizacion)
          .eq('id', denunciaId);

        if (errorActualizacion) {
          console.error('Error actualizando estado:', errorActualizacion);
          throw new Error('Error al actualizar el estado: ' + errorActualizacion.message);
        }
      }

      // Crear registro de seguimiento si hay cambios significativos
      if (observaciones?.trim() || denunciaAnterior.estado !== nuevoEstado) {
        const { error: errorSeguimiento } = await supabase
          .from('seguimiento_denuncias')
          .insert({
            denuncia_id: denunciaId,
            estado_anterior: denunciaAnterior.estado !== nuevoEstado ? denunciaAnterior.estado : null,
            estado_nuevo: nuevoEstado,
            operacion: observaciones?.trim() ? 'Actualización con observaciones' : 'Actualización de estado',
            acciones_realizadas: denunciaAnterior.estado !== nuevoEstado 
              ? `Estado cambiado de ${denunciaAnterior.estado} a ${nuevoEstado}` 
              : 'Observaciones añadidas',
            observaciones: observaciones?.trim() || null
          });

        if (errorSeguimiento) {
          console.error('Error creando registro de seguimiento:', errorSeguimiento);
        }
      }

      // Enviar notificaciones solo si cambió el estado
      if (denunciaAnterior.estado !== nuevoEstado) {
        const denunciaActualizada: Denuncia = { 
          ...denunciaAnterior, 
          estado: nuevoEstado,
          empresa_id: '', // Valor por defecto
          hechos: '', // Valor por defecto  
          created_at: '', // Valor por defecto
          updated_at: '' // Valor por defecto
        };
        
        // Enviar notificaciones en paralelo para mejorar velocidad
        Promise.all([
          enviarNotificacionDenunciante(denunciaActualizada, 'estado_cambio', denunciaAnterior.estado),
          sendNotificationToAdmins(
            'estado_cambio', 
            denunciaAnterior.codigo_seguimiento,
            denunciaAnterior.estado,
            nuevoEstado
          )
        ]).catch(emailError => {
          console.error('Error enviando notificaciones:', emailError);
        });
      }

      toast({
        title: "Denuncia actualizada",
        description: observaciones?.trim() ? "Observaciones añadidas correctamente" : `Estado actualizado a: ${nuevoEstado}`,
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
