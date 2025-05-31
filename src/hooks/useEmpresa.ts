
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
        let { data, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('cif', '12345678A')
          .single();

        if (error && error.code === 'PGRST116') {
          // No existe la empresa, crearla
          console.log('Empresa not found, creating demo empresa...');
          const { data: newEmpresa, error: createError } = await supabase
            .from('empresas')
            .insert({
              nombre: 'Empresa Demo',
              cif: '12345678A',
              direccion: null,
              codigo_postal: null,
              ciudad: null,
              provincia: null,
              pais: 'España',
              email: null,
              telefono: null,
              configurada: false,
              logo_url: null
            })
            .select()
            .single();

          if (createError) {
            console.error('Error creating empresa:', createError);
            return;
          }

          data = newEmpresa;
          console.log('Demo empresa created:', data);
        } else if (error) {
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

  const uploadLogo = async (file: File, empresaId: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${empresaId}/logo-${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName);
      
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
    console.log('Updating empresa with data:', updatedData);
    console.log('Logo file:', logoFile);
    console.log('Current empresa:', empresa);

    try {
      let empresaToUpdate = empresa;
      let logoUrl = empresa?.logo_url || null;

      // Si no hay empresa cargada, crear una nueva
      if (!empresaToUpdate) {
        console.log('No empresa loaded, creating new one...');
        const { data: newEmpresa, error: createError } = await supabase
          .from('empresas')
          .insert({
            nombre: updatedData.nombre || 'Nueva Empresa',
            cif: updatedData.cif || '',
            direccion: updatedData.direccion || null,
            codigo_postal: updatedData.codigo_postal || null,
            ciudad: updatedData.ciudad || null,
            provincia: updatedData.provincia || null,
            pais: updatedData.pais || 'España',
            email: updatedData.email || null,
            telefono: updatedData.telefono || null,
            configurada: true,
            logo_url: null
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating new empresa:', createError);
          return { success: false, error: `Error al crear empresa: ${createError.message}` };
        }

        empresaToUpdate = newEmpresa as Empresa;
        console.log('New empresa created:', empresaToUpdate);
      }

      // Subir logo si se proporciona
      if (logoFile && empresaToUpdate) {
        console.log('Uploading logo file...');
        const uploadedLogoUrl = await uploadLogo(logoFile, empresaToUpdate.id);
        if (uploadedLogoUrl) {
          logoUrl = uploadedLogoUrl;
          console.log('Logo uploaded, new URL:', logoUrl);
        } else {
          console.error('Failed to upload logo');
          return { success: false, error: 'Error al subir el logo' };
        }
      }

      // Actualizar los datos de la empresa
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
        .eq('id', empresaToUpdate.id)
        .select()
        .single();

      if (error) {
        console.error('Database update error:', error);
        return { success: false, error: `Error de base de datos: ${error.message}` };
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
