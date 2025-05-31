
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Empresa {
  id: string;
  nombre: string;
  cif: string;
  direccion: string | null;
  codigo_postal: string | null;
  ciudad: string | null;
  provincia: string | null;
  pais: string | null;
  email: string | null;
  telefono: string | null;
  configurada: boolean | null;
  logo_url: string | null;
}

export const useEmpresa = () => {
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmpresa = async () => {
      try {
        const { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('cif', '12345678A')
          .single();

        if (error) {
          console.error('Error loading empresa:', error);
          return;
        }

        if (data) {
          // Asegurar que logo_url esté incluido
          setEmpresa({
            ...data,
            logo_url: data.logo_url || null
          });
        }
      } catch (error) {
        console.error('Error loading empresa:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpresa();
  }, []);

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${empresa?.id}/logo.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // Eliminar logo anterior si existe
      if (empresa?.logo_url) {
        const oldPath = empresa.logo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('empresa-logos')
            .remove([`${empresa.id}/${oldPath}`]);
        }
      }

      const { error: uploadError } = await supabase.storage
        .from('empresa-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('empresa-logos')
        .getPublicUrl(fileName);

      console.log('Logo uploaded successfully:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    }
  };

  const updateEmpresa = async (updatedData: Partial<Empresa>, logoFile?: File) => {
    if (!empresa) return { success: false, error: 'No hay empresa cargada' };

    console.log('Updating empresa with data:', updatedData);
    console.log('Logo file:', logoFile);

    try {
      let logoUrl = empresa.logo_url;

      // Subir logo si se proporciona
      if (logoFile) {
        const uploadedLogoUrl = await uploadLogo(logoFile);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
        } else {
          return { success: false, error: 'Error al subir el logo' };
        }
      }

      const dataToUpdate = {
        ...updatedData,
        logo_url: logoUrl,
        configurada: true
      };

      console.log('Data to update in database:', dataToUpdate);

      const { data, error } = await supabase
        .from('empresas')
        .update(dataToUpdate)
        .eq('id', empresa.id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        throw error;
      }

      console.log('Updated empresa data:', data);

      // Actualizar el estado local asegurando que logo_url esté incluido
      setEmpresa({
        ...data,
        logo_url: data.logo_url || null
      });
      return { success: true };
    } catch (error) {
      console.error('Error updating empresa:', error);
      return { success: false, error: 'Error al actualizar los datos de la empresa' };
    }
  };

  return { empresa, loading, updateEmpresa };
};
