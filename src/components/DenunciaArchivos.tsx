import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Download, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DenunciaArchivo {
  id: string;
  nombre_archivo: string;
  tipo_archivo: string;
  tamano_archivo: number;
  ruta_archivo: string;
}

interface DenunciaArchivosProps {
  denunciaId: string;
}

const DenunciaArchivos = ({ denunciaId }: DenunciaArchivosProps) => {
  const [archivos, setArchivos] = useState<DenunciaArchivo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    cargarArchivos();
  }, [denunciaId]);

  const cargarArchivos = async () => {
    try {
      setLoading(true);
      console.log('Cargando archivos para denuncia:', denunciaId);

      const { data, error } = await supabase
        .from('denuncia_archivos')
        .select('*')
        .eq('denuncia_id', denunciaId);

      if (error) {
        console.error('Error cargando archivos:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los archivos",
          variant: "destructive",
        });
        return;
      }

      console.log('Archivos encontrados:', data);
      setArchivos(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Error al cargar los archivos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const descargarArchivo = async (archivo: DenunciaArchivo) => {
    try {
      console.log('Descargando archivo:', archivo);

      // Intentar descargar usando URL pública primero
      const { data: urlData } = await supabase.storage
        .from('denuncia-archivos')
        .getPublicUrl(archivo.ruta_archivo);

      if (urlData?.publicUrl) {
        // Crear enlace temporal para descarga
        const link = document.createElement('a');
        link.href = urlData.publicUrl;
        link.download = archivo.nombre_archivo;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Descarga iniciada",
          description: `Descargando ${archivo.nombre_archivo}`,
        });
      } else {
        throw new Error('No se pudo obtener la URL del archivo');
      }
    } catch (error) {
      console.error('Error descargando archivo:', error);
      toast({
        title: "Error",
        description: "Error al descargar el archivo",
        variant: "destructive",
      });
    }
  };

  const previsualizarArchivo = async (archivo: DenunciaArchivo) => {
    try {
      // Usar URL pública para previsualización
      const { data: urlData } = await supabase.storage
        .from('denuncia-archivos')
        .getPublicUrl(archivo.ruta_archivo);

      if (urlData?.publicUrl) {
        window.open(urlData.publicUrl, '_blank');
      } else {
        toast({
          title: "Error",
          description: "No se pudo generar la URL de previsualización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error previsualizando archivo:', error);
      toast({
        title: "Error",
        description: "No se pudo previsualizar el archivo",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (tipoArchivo: string) => {
    if (tipoArchivo.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Archivos Adjuntos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (archivos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Archivos Adjuntos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No hay archivos adjuntos en esta denuncia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Archivos Adjuntos ({archivos.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex items-center space-x-3">
                {getFileIcon(archivo.tipo_archivo)}
                <div>
                  <p className="text-sm font-medium">{archivo.nombre_archivo}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(archivo.tamano_archivo || 0)} • {archivo.tipo_archivo}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {archivo.tipo_archivo.startsWith('image/') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => previsualizarArchivo(archivo)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Ver
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => descargarArchivo(archivo)}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Descargar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  function getFileIcon(tipoArchivo: string) {
    if (tipoArchivo.startsWith('image/')) {
      return <Image className="w-4 h-4" />;
    }
    return <FileText className="w-4 h-4" />;
  }

  function formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default DenunciaArchivos;
