
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
        console.log('Loading empresa data...');
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
          console.log('Empresa data loaded:', data);
          setEmpresa(data as Empresa);
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
      if (!empresa?.id) {
        console.error('No empresa ID available for logo upload');
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${empresa.id}/logo-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
      // Eliminar logo anterior si existe
      if (empresa?.logo_url) {
        const oldFileName = empresa.logo_url.split('/').pop();
        if (oldFileName) {
          console.log('Removing old logo:', oldFileName);
          await supabase.storage
            .from('empresa-logos')
            .remove([`${empresa.id}/${oldFileName}`]);
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
    if (!empresa) {
      console.error('No empresa loaded for update');
      return { success: false, error: 'No hay empresa cargada' };
    }

    console.log('Updating empresa with data:', updatedData);
    console.log('Logo file:', logoFile);

    try {
      let logoUrl = empresa.logo_url;

      // Subir logo si se proporciona
      if (logoFile) {
        console.log('Uploading logo file...');
        const uploadedLogoUrl = await uploadLogo(logoFile);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
          console.log('Logo uploaded, new URL:', logoUrl);
        } else {
          console.error('Failed to upload logo');
          return { success: false, error: 'Error al subir el logo' };
        }
      }

      const dataToUpdate = {
        ...updatedData,
        logo_url: logoUrl,
        configurada: true,
        updated_at: new Date().toISOString()
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

      // Actualizar el estado local
      setEmpresa(data as Empresa);
      return { success: true };
    } catch (error) {
      console.error('Error updating empresa:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error al actualizar los datos de la empresa' 
      };
    }
  };

  return { empresa, loading, updateEmpresa };
};
