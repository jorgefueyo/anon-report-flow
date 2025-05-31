import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, FileText, User, Users, MapPin } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { encryptData } from "@/utils/encryption";

const NuevaDenuncia = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [codigoSeguimiento, setCodigoSeguimiento] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Datos del denunciante
    nombre: "",
    email: "",
    telefono: "",
    domicilio: "",
    
    // Hechos
    hechos: "",
    fecha: "",
    lugar: "",
    relacionEmpresa: "",
    categoria: "",
    
    // Testigos
    testigos: "",
    
    // Personas implicadas
    personasImplicadas: "",
    
    // Documentos adicionales
    observaciones: ""
  });

  const totalSteps = 4;

  const categoriasDenuncia = [
    "Irregularidades contables o financieras",
    "Corrupción, soborno o conflicto de intereses",
    "Fraude o malversación de fondos",
    "Discriminación o acoso laboral",
    "Incumplimiento de normativas de seguridad y salud",
    "Violación de políticas internas",
    "Uso indebido de recursos de la empresa",
    "Irregularidades en procesos de contratación",
    "Incumplimiento de normativas medioambientales",
    "Violación de la protección de datos",
    "Otras irregularidades éticas o legales"
  ];

  const relacionesEmpresa = [
    "Empleado/a",
    "Ex-empleado/a",
    "Cliente",
    "Proveedor",
    "Contratista",
    "Visitante",
    "Tercero/Otro"
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.hechos) {
      toast({
        title: "Error",
        description: "El email y la descripción de hechos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Get the default company (for demo purposes, in production you'd have proper company selection)
      const { data: empresa, error: empresaError } = await supabase
        .from('empresas')
        .select('id')
        .limit(1)
        .single();

      if (empresaError || !empresa) {
        toast({
          title: "Error",
          description: "No se pudo encontrar la empresa",
          variant: "destructive",
        });
        return;
      }

      // Insert the complaint with proper encryption
      const { data, error } = await supabase
        .from('denuncias')
        .insert({
          empresa_id: empresa.id,
          email_encriptado: encryptData(formData.email),
          nombre_encriptado: formData.nombre ? encryptData(formData.nombre) : null,
          telefono_encriptado: formData.telefono ? encryptData(formData.telefono) : null,
          domicilio_encriptado: formData.domicilio ? encryptData(formData.domicilio) : null,
          relacion_empresa: formData.relacionEmpresa,
          categoria: formData.categoria,
          hechos: formData.hechos,
          fecha_hechos: formData.fecha || null,
          lugar_hechos: formData.lugar,
          testigos: formData.testigos,
          personas_implicadas: formData.personasImplicadas,
          estado: 'pendiente'
        })
        .select('codigo_seguimiento')
        .single();

      if (error) {
        console.error('Error inserting complaint:', error);
        toast({
          title: "Error",
          description: "Error al enviar la denuncia",
          variant: "destructive",
        });
        return;
      }

      setCodigoSeguimiento(data.codigo_seguimiento);
      toast({
        title: "Denuncia enviada",
        description: `Tu código de seguimiento es: ${data.codigo_seguimiento}`,
      });

      // Redirect to success page after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);

    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al enviar la denuncia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="w-5 h-5" />;
      case 2: return <FileText className="w-5 h-5" />;
      case 3: return <Users className="w-5 h-5" />;
      case 4: return <MapPin className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  // If complaint was successfully submitted, show success message
  if (codigoSeguimiento) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">¡Denuncia Enviada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="font-semibold">Tu código de seguimiento es:</p>
              <p className="text-xl font-mono text-green-700">{codigoSeguimiento}</p>
            </div>
            <p className="text-sm text-gray-600">
              Guarda este código para consultar el estado de tu denuncia
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Nueva Denuncia</h1>
          <div className="text-sm text-gray-500">
            Paso {currentStep} de {totalSteps}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex items-center space-x-2 ${
                  step <= currentStep ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {getStepIcon(step)}
                </div>
                <span className="hidden md:block font-medium">
                  {step === 1 && "Datos Personales"}
                  {step === 2 && "Hechos"}
                  {step === 3 && "Testigos"}
                  {step === 4 && "Revisión"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {currentStep === 1 && "Datos del Denunciante"}
              {currentStep === 2 && "Descripción de los Hechos"}
              {currentStep === 3 && "Testigos y Personas Implicadas"}
              {currentStep === 4 && "Revisión y Envío"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Step 1: Datos Personales */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nombre">Nombre Completo (Opcional)</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange("nombre", e.target.value)}
                      placeholder="Deja en blanco para mantener anonimato"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email de Contacto</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@ejemplo.com"
                      className="mt-2"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tu email será encriptado para mantener tu anonimato
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="telefono">Teléfono (Opcional)</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="+34 600 000 000"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="domicilio">Domicilio (Opcional)</Label>
                    <Input
                      id="domicilio"
                      value={formData.domicilio}
                      onChange={(e) => handleInputChange("domicilio", e.target.value)}
                      placeholder="Ciudad, dirección"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Hechos */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="hechos">Descripción de los Hechos</Label>
                  <Textarea
                    id="hechos"
                    value={formData.hechos}
                    onChange={(e) => handleInputChange("hechos", e.target.value)}
                    placeholder="Describe detalladamente los hechos que quieres denunciar..."
                    className="mt-2 min-h-32"
                    required
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="relacionEmpresa">Relación con la Empresa</Label>
                    <Select value={formData.relacionEmpresa} onValueChange={(value) => handleInputChange("relacionEmpresa", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona tu relación con la empresa" />
                      </SelectTrigger>
                      <SelectContent>
                        {relacionesEmpresa.map((relacion) => (
                          <SelectItem key={relacion} value={relacion}>
                            {relacion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoría de la Denuncia</Label>
                    <Select value={formData.categoria} onValueChange={(value) => handleInputChange("categoria", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Selecciona la categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasDenuncia.map((categoria) => (
                          <SelectItem key={categoria} value={categoria}>
                            {categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fecha">Fecha de los Hechos</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lugar">Lugar de los Hechos</Label>
                    <Input
                      id="lugar"
                      value={formData.lugar}
                      onChange={(e) => handleInputChange("lugar", e.target.value)}
                      placeholder="Ubicación donde ocurrieron los hechos"
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Testigos */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="testigos">Testigos (Opcional)</Label>
                  <Textarea
                    id="testigos"
                    value={formData.testigos}
                    onChange={(e) => handleInputChange("testigos", e.target.value)}
                    placeholder="Nombres y datos de contacto de posibles testigos..."
                    className="mt-2 min-h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="personasImplicadas">Personas Implicadas</Label>
                  <Textarea
                    id="personasImplicadas"
                    value={formData.personasImplicadas}
                    onChange={(e) => handleInputChange("personasImplicadas", e.target.value)}
                    placeholder="Nombres y cargos de las personas implicadas en los hechos..."
                    className="mt-2 min-h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange("observaciones", e.target.value)}
                    placeholder="Cualquier información adicional relevante..."
                    className="mt-2 min-h-24"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Revisión */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-lg mb-4">Resumen de la Denuncia</h3>
                  <div className="grid gap-4">
                    <div>
                      <strong>Email:</strong> {formData.email || "No proporcionado"}
                    </div>
                    <div>
                      <strong>Relación con la empresa:</strong> {formData.relacionEmpresa || "No proporcionada"}
                    </div>
                    <div>
                      <strong>Categoría:</strong> {formData.categoria || "No proporcionada"}
                    </div>
                    <div>
                      <strong>Hechos:</strong> {formData.hechos || "No proporcionado"}
                    </div>
                    <div>
                      <strong>Fecha:</strong> {formData.fecha || "No proporcionada"}
                    </div>
                    <div>
                      <strong>Lugar:</strong> {formData.lugar || "No proporcionado"}
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Importante:</strong> Una vez enviada la denuncia, recibirás un código de seguimiento
                    en tu email para consultar el estado del proceso. Tu identidad permanecerá protegida.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Enviando..." : "Enviar Denuncia"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NuevaDenuncia;
