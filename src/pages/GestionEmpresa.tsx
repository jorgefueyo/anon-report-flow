
import { useState, useEffect } from "react";
import { supabase } from "@/hooks/useSupabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Building2, Upload, Save } from "lucide-react";

const GestionEmpresa = () => {
  const [empresa, setEmpresa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadEmpresa();
  }, []);

  const loadEmpresa = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Obtener empresa del usuario
    const { data: userData } = await supabase
      .from('usuarios_backoffice')
      .select('empresa_id, rol')
      .eq('auth_user_id', user.id)
      .single();

    if (!userData || userData.rol !== 'admin') {
      toast({
        title: "Acceso denegado",
        description: "Solo los administradores pueden gestionar la empresa",
        variant: "destructive",
      });
      navigate('/backoffice');
      return;
    }

    // Cargar datos de la empresa
    const { data: empresaData } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', userData.empresa_id)
      .single();

    if (empresaData) {
      setEmpresa(empresaData);
      if (empresaData.logo_url) {
        setLogoPreview(empresaData.logo_url);
      }
    }

    setLoading(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamaño y tipo de archivo
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast({
          title: "Archivo muy grande",
          description: "El logo debe ser menor a 2MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de archivo inválido",
          description: "Solo se permiten imágenes",
          variant: "destructive",
        });
        return;
      }

      setLogoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async () => {
    if (!logoFile || !empresa) return null;

    const fileExt = logoFile.name.split('.').pop();
    const fileName = `${empresa.id}-logo.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('company-logos')
      .upload(filePath, logoFile, { upsert: true });

    if (uploadError) {
      console.error('Error uploading logo:', uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('company-logos')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const saveEmpresa = async () => {
    if (!empresa) return;

    setSaving(true);
    try {
      let logoUrl = empresa.logo_url;

      // Subir nuevo logo si se seleccionó uno
      if (logoFile) {
        logoUrl = await uploadLogo();
      }

      const { error } = await supabase
        .from('empresas')
        .update({
          nombre: empresa.nombre,
          cif: empresa.cif,
          direccion: empresa.direccion,
          telefono: empresa.telefono,
          email: empresa.email,
          logo_url: logoUrl,
          color_primario: empresa.color_primario,
          color_secundario: empresa.color_secundario
        })
        .eq('id', empresa.id);

      if (error) {
        toast({
          title: "Error al guardar",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Datos guardados",
        description: "Los datos de la empresa se han actualizado correctamente",
      });

      // Recargar datos
      loadEmpresa();
      setLogoFile(null);

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar los datos",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  if (!empresa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600">No se pudieron cargar los datos de la empresa</p>
            <Button onClick={() => navigate('/backoffice')} className="mt-4">
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/backoffice')}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Gestión de Empresa
            </h1>
            <p className="text-gray-600">
              Administra los datos de tu empresa
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información básica */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building2 className="w-5 h-5 mr-2" />
                    Información de la Empresa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nombre">Nombre de la empresa</Label>
                      <Input
                        id="nombre"
                        value={empresa.nombre}
                        onChange={(e) => setEmpresa({...empresa, nombre: e.target.value})}
                        placeholder="Nombre de la empresa"
                      />
                    </div>
                    <div>
                      <Label htmlFor="cif">CIF</Label>
                      <Input
                        id="cif"
                        value={empresa.cif}
                        onChange={(e) => setEmpresa({...empresa, cif: e.target.value})}
                        placeholder="CIF de la empresa"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Textarea
                      id="direccion"
                      value={empresa.direccion || ''}
                      onChange={(e) => setEmpresa({...empresa, direccion: e.target.value})}
                      placeholder="Dirección completa de la empresa"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={empresa.telefono || ''}
                        onChange={(e) => setEmpresa({...empresa, telefono: e.target.value})}
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={empresa.email || ''}
                        onChange={(e) => setEmpresa({...empresa, email: e.target.value})}
                        placeholder="Email de contacto"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="colorPrimario">Color primario</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="colorPrimario"
                          type="color"
                          value={empresa.color_primario}
                          onChange={(e) => setEmpresa({...empresa, color_primario: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={empresa.color_primario}
                          onChange={(e) => setEmpresa({...empresa, color_primario: e.target.value})}
                          placeholder="#1e40af"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="colorSecundario">Color secundario</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="colorSecundario"
                          type="color"
                          value={empresa.color_secundario}
                          onChange={(e) => setEmpresa({...empresa, color_secundario: e.target.value})}
                          className="w-16 h-10"
                        />
                        <Input
                          value={empresa.color_secundario}
                          onChange={(e) => setEmpresa({...empresa, color_secundario: e.target.value})}
                          placeholder="#3b82f6"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Logo */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Logo de la Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo de la empresa"
                        className="w-32 h-32 mx-auto object-contain border-2 border-gray-200 rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="logo">Subir logo (400x400px recomendado)</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Formatos: JPG, PNG, GIF. Máximo 2MB.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={saveEmpresa} disabled={saving}>
              {saving ? (
                "Guardando..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GestionEmpresa;
