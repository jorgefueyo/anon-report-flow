
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Denuncia, FormularioDenuncia, DenunciaArchivo } from '@/types/denuncia';
import { encryptData } from '@/utils/encryption';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';

export const useDenuncias = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { sendNewDenunciaNotification } = useEmailNotifications();

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

      // Preparar datos para inserción - usando un codigo_seguimiento temporal que será reemplazado por el trigger
      const datosInsercion = {
        empresa_id: empresa.id,
        codigo_seguimiento: 'TEMP-' + Date.now(), // Temporal, será reemplazado por el trigger
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
      };

      console.log('Datos para inserción:', datosInsercion);

      // Crear la denuncia - el trigger reemplazará el codigo_seguimiento temporal
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
        console.log('Subiendo archivos:', datos.archivos.length);
        await subirArchivos(denuncia.id, datos.archivos);
      }

      // Enviar notificación por email al denunciante
      try {
        await sendNewDenunciaNotification(
          datos.email,
          denuncia.codigo_seguimiento,
          empresa.nombre
        );
        console.log('Notificación de nueva denuncia enviada');
      } catch (emailError) {
        console.error('Error enviando notificación por email:', emailError);
        // No mostramos error al usuario ya que la denuncia fue creada exitosamente
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

  const subirArchivos = async (denunciaId: string, archivos: File[]) => {
    console.log('Iniciando subida de archivos para denuncia:', denunciaId);
    
    for (const archivo of archivos) {
      try {
        console.log('Procesando archivo:', archivo.name);
        
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const nombreArchivo = `${timestamp}-${archivo.name}`;
        const rutaArchivo = `${denunciaId}/${nombreArchivo}`;

        console.log('Subiendo archivo a storage:', rutaArchivo);

        // Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('denuncia-attachments')
          .upload(rutaArchivo, archivo);

        if (uploadError) {
          console.error('Error subiendo archivo:', uploadError);
          continue;
        }

        console.log('Archivo subido, guardando metadata...');

        // Guardar metadata del archivo en la base de datos
        const { error: metadataError } = await supabase
          .from('denuncia_archivos')
          .insert({
            denuncia_id: denunciaId,
            nombre_archivo: archivo.name,
            ruta_archivo: rutaArchivo,
            tipo_archivo: archivo.type,
            tamano_archivo: archivo.size,
          });

        if (metadataError) {
          console.error('Error guardando metadata del archivo:', metadataError);
        } else {
          console.log('Metadata del archivo guardada exitosamente');
        }

      } catch (error) {
        console.error('Error procesando archivo:', archivo.name, error);
      }
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
        .single();

      console.log('Resultado búsqueda:', { data, error });

      if (error || !data) {
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
    obtenerArchivosDenuncia,
  };
};
