
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDenuncias } from '@/hooks/useDenuncias';
import { FormularioDenuncia } from '@/types/denuncia';
import FileUpload from '@/components/FileUpload';
import AppHeader from '@/components/AppHeader';
import { FileText, Shield, AlertTriangle } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
  nombre: z.string().optional(),
  telefono: z.string().optional(),
  domicilio: z.string().optional(),
  relacion_empresa: z.string().optional(),
  categoria: z.string().optional(),
  hechos: z.string().min(10, 'Describe los hechos con al menos 10 caracteres'),
  fecha_hechos: z.string().optional(),
  lugar_hechos: z.string().optional(),
  testigos: z.string().optional(),
  personas_implicadas: z.string().optional(),
});

const NuevaDenuncia = () => {
  const navigate = useNavigate();
  const { crearDenuncia, loading } = useDenuncias();
  const [archivos, setArchivos] = useState<File[]>([]);
  const [codigoGenerado, setCodigoGenerado] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      nombre: '',
      telefono: '',
      domicilio: '',
      relacion_empresa: '',
      categoria: '',
      hechos: '',
      fecha_hechos: '',
      lugar_hechos: '',
      testigos: '',
      personas_implicadas: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const datos: FormularioDenuncia = {
      ...values,
      archivos,
    };

    const codigo = await crearDenuncia(datos);
    if (codigo) {
      setCodigoGenerado(codigo);
    }
  };

  if (codigoGenerado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <AppHeader />
        <div className="max-w-2xl mx-auto p-6 mt-8">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Denuncia Enviada Exitosamente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Tu código de seguimiento es:
                </h3>
                <div className="text-2xl font-bold text-green-900 bg-white p-3 rounded border">
                  {codigoGenerado}
                </div>
                <p className="text-sm text-green-700 mt-2">
                  Guarda este código para consultar el estado de tu denuncia
                </p>
              </div>
              
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/consultar')}
                  className="w-full"
                >
                  Consultar Estado de Denuncia
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Volver al Inicio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <AppHeader />
      
      <div className="max-w-4xl mx-auto p-6 mt-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Realizar una Denuncia
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Tu identidad será protegida. Toda la información es confidencial.
            </p>
          </CardHeader>
          
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800">Información importante</h4>
                  <p className="text-sm text-yellow-700">
                    Todos los datos personales son encriptados para garantizar tu anonimato.
                    Solo el equipo autorizado podrá acceder a esta información cuando sea necesario.
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Datos del denunciante */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Datos de contacto (opcional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="tu@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="telefono"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="domicilio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domicilio</FormLabel>
                          <FormControl>
                            <Input placeholder="Opcional" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Relación con la empresa */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Relación con la empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="relacion_empresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relación con la empresa</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una opción" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="empleado">Empleado</SelectItem>
                              <SelectItem value="cliente">Cliente</SelectItem>
                              <SelectItem value="proveedor">Proveedor</SelectItem>
                              <SelectItem value="externo">Externo</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría de la denuncia</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona una categoría" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="acoso">Acoso laboral</SelectItem>
                              <SelectItem value="discriminacion">Discriminación</SelectItem>
                              <SelectItem value="corrupcion">Corrupción</SelectItem>
                              <SelectItem value="fraude">Fraude</SelectItem>
                              <SelectItem value="seguridad">Seguridad laboral</SelectItem>
                              <SelectItem value="etico">Comportamiento no ético</SelectItem>
                              <SelectItem value="otro">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Descripción de los hechos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Descripción de los hechos</h3>
                  
                  <FormField
                    control={form.control}
                    name="hechos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción detallada de los hechos *</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe los hechos de manera detallada..."
                            className="min-h-32"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fecha_hechos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de los hechos</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="lugar_hechos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lugar de los hechos</FormLabel>
                          <FormControl>
                            <Input placeholder="Ubicación donde ocurrieron los hechos" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="testigos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Testigos</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Personas que presenciaron los hechos"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="personas_implicadas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Personas implicadas</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Personas involucradas en los hechos"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Archivos adjuntos */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Documentos de apoyo</h3>
                  <p className="text-sm text-gray-600">
                    Puedes adjuntar documentos, imágenes o cualquier evidencia que apoye tu denuncia
                  </p>
                  <FileUpload 
                    files={archivos}
                    onFilesChange={setArchivos}
                    maxFiles={5}
                  />
                </div>

                <div className="flex justify-between pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/')}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="min-w-32"
                  >
                    {loading ? 'Enviando...' : 'Enviar Denuncia'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NuevaDenuncia;
