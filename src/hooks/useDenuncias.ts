
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
      // Obtener la empresa por defecto (primera empresa)
      const { data: empresas, error: empresaError } = await supabase
        .from('empresas')
        .select('id')
        .limit(1);

      if (empresaError || !empresas || empresas.length === 0) {
        throw new Error('No se encontró empresa configurada');
      }

      const empresa_id = empresas[0].id;

      // Crear la denuncia
      const { data: denuncia, error: denunciaError } = await supabase
        .from('denuncias')
        .insert({
          empresa_id,
          email_encriptado: encryptData(datos.email),
          nombre_encriptado: datos.nombre ? encryptData(datos.nombre) : null,
          telefono_encriptado: datos.telefono ? encryptData(datos.telefono) : null,
          domicilio_encriptado: datos.domicilio ? encryptData(datos.domicilio) : null,
          relacion_empresa: datos.relacion_empresa,
          categoria: datos.categoria,
          hechos: datos.hechos,
          fecha_hechos: datos.fecha_hechos,
          lugar_hechos: datos.lugar_hechos,
          testigos: datos.testigos,
          personas_implicadas: datos.personas_implicadas,
        })
        .select()
        .single();

      if (denunciaError || !denuncia) {
        throw new Error('Error al crear la denuncia');
      }

      // Subir archivos si existen
      if (datos.archivos && datos.archivos.length > 0) {
        await subirArchivos(denuncia.id, datos.archivos);
      }

      toast({
        title: "Denuncia creada exitosamente",
        description: `Código de seguimiento: ${denuncia.codigo_seguimiento}`,
      });

      return denuncia.codigo_seguimiento;
    } catch (error) {
      console.error('Error creando denuncia:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la denuncia. Intenta nuevamente.",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const subirArchivos = async (denunciaId: string, archivos: File[]) => {
    for (const archivo of archivos) {
      try {
        // Generar nombre único para el archivo
        const timestamp = Date.now();
        const nombreArchivo = `${timestamp}-${archivo.name}`;
        const rutaArchivo = `${denunciaId}/${nombreArchivo}`;

        // Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('denuncia-attachments')
          .upload(rutaArchivo, archivo);

        if (uploadError) {
          console.error('Error subiendo archivo:', uploadError);
          continue;
        }

        // Guardar metadata del archivo en la base de datos
        await supabase
          .from('denuncia_archivos')
          .insert({
            denuncia_id: denunciaId,
            nombre_archivo: archivo.name,
            ruta_archivo: rutaArchivo,
            tipo_archivo: archivo.type,
            tamano_archivo: archivo.size,
          });

      } catch (error) {
        console.error('Error procesando archivo:', archivo.name, error);
      }
    }
  };

  const buscarDenuncia = async (codigo: string): Promise<Denuncia | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('denuncias')
        .select('*')
        .eq('codigo_seguimiento', codigo.trim())
        .single();

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
      const { data, error } = await supabase
        .from('denuncia_archivos')
        .select('*')
        .eq('denuncia_id', denunciaId);

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
