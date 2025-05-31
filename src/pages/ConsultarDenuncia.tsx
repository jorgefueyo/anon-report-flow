
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Clock, CheckCircle, AlertCircle, User } from "lucide-react";
import { Link } from "react-router-dom";

const ConsultarDenuncia = () => {
  const [codigoDenuncia, setCodigoDenuncia] = useState("");
  const [denunciaEncontrada, setDenunciaEncontrada] = useState(false);
  const [loading, setLoading] = useState(false);

  // Datos de ejemplo para mostrar el estado
  const denunciaEjemplo = {
    codigo: "DN-2024-001",
    fechaCreacion: "2024-01-15",
    estado: "En Trámite",
    descripcion: "Irregularidades en el proceso de contratación",
    historialEstados: [
      { estado: "Pendiente", fecha: "2024-01-15", descripcion: "Denuncia recibida y registrada en el sistema" },
      { estado: "Asignada", fecha: "2024-01-16", descripcion: "Asignada al supervisor Juan Pérez para revisión" },
      { estado: "En Trámite", fecha: "2024-01-18", descripcion: "Se está investigando el caso y recopilando evidencias" }
    ]
  };

  const consultarDenuncia = async () => {
    setLoading(true);
    // Simular consulta a la base de datos
    setTimeout(() => {
      if (codigoDenuncia === "DN-2024-001") {
        setDenunciaEncontrada(true);
      } else {
        setDenunciaEncontrada(false);
        alert("Código no encontrado. Verifica el código e intenta nuevamente.");
      }
      setLoading(false);
    }, 1000);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Pendiente": return "text-yellow-600 bg-yellow-100";
      case "Asignada": return "text-blue-600 bg-blue-100";
      case "En Trámite": return "text-orange-600 bg-orange-100";
      case "Finalizada": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Pendiente": return <Clock className="w-4 h-4" />;
      case "Asignada": return <User className="w-4 h-4" />;
      case "En Trámite": return <AlertCircle className="w-4 h-4" />;
      case "Finalizada": return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al inicio</span>
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Consultar Estado de Denuncia</h1>
          <div></div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!denunciaEncontrada ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Consultar Estado de Denuncia</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="max-w-md mx-auto">
                <div className="mb-6">
                  <Label htmlFor="codigo">Código de Denuncia</Label>
                  <Input
                    id="codigo"
                    value={codigoDenuncia}
                    onChange={(e) => setCodigoDenuncia(e.target.value)}
                    placeholder="Ej: DN-2024-001"
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Introduce el código que recibiste al registrar tu denuncia
                  </p>
                </div>
                
                <Button
                  onClick={consultarDenuncia}
                  disabled={loading || !codigoDenuncia.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>Consultar Estado</span>
                    </>
                  )}
                </Button>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Para probar el sistema, usa el código: <code className="bg-blue-200 px-2 py-1 rounded">DN-2024-001</code>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Información de la Denuncia */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Denuncia {denunciaEjemplo.codigo}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getEstadoColor(denunciaEjemplo.estado)}`}>
                    {getEstadoIcon(denunciaEjemplo.estado)}
                    <span>{denunciaEjemplo.estado}</span>
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <strong>Fecha de Creación:</strong> {denunciaEjemplo.fechaCreacion}
                  </div>
                  <div>
                    <strong>Estado Actual:</strong> {denunciaEjemplo.estado}
                  </div>
                  <div className="md:col-span-2">
                    <strong>Descripción:</strong> {denunciaEjemplo.descripcion}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Historial de Estados */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Estados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {denunciaEjemplo.historialEstados.map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 pb-4 border-b last:border-b-0">
                      <div className={`p-2 rounded-full ${getEstadoColor(item.estado)}`}>
                        {getEstadoIcon(item.estado)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold">{item.estado}</h4>
                          <span className="text-sm text-gray-500">{item.fecha}</span>
                        </div>
                        <p className="text-gray-600 text-sm">{item.descripcion}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6">
                <h3 className="font-semibold text-blue-900 mb-2">Información Importante</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Tu identidad permanece protegida durante todo el proceso</li>
                  <li>• Recibirás notificaciones por email cuando cambie el estado</li>
                  <li>• Puedes consultar el estado en cualquier momento con este código</li>
                  <li>• El tiempo de resolución depende de la complejidad del caso</li>
                </ul>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  setDenunciaEncontrada(false);
                  setCodigoDenuncia("");
                }}
              >
                Consultar Otra Denuncia
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConsultarDenuncia;
