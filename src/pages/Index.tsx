
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Plus, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Canal de Denuncias</h1>
          </div>
          <div className="text-sm text-gray-500">
            Sistema Anónimo y Confidencial
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Canal de Denuncias Empresarial
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Sistema seguro y anónimo para reportar irregularidades. 
            Tu identidad permanecerá protegida durante todo el proceso.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Ver Estado de Denuncia */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Ver Estado de Denuncia
              </h3>
              <p className="text-gray-600 mb-6">
                Consulta el progreso de tu denuncia utilizando el código que recibiste al registrarla.
              </p>
              <Link to="/consultar-denuncia">
                <Button 
                  size="lg" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                >
                  Consultar Estado
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Registrar Nueva Denuncia */}
          <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Registrar Nueva Denuncia
              </h3>
              <p className="text-gray-600 mb-6">
                Reporta una irregularidad de forma anónima y segura. Te proporcionaremos un código de seguimiento.
              </p>
              <Link to="/nueva-denuncia">
                <Button 
                  size="lg" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
                >
                  Crear Denuncia
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="bg-white border-2 border-gray-100">
          <CardContent className="p-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              ¿Cómo funciona nuestro sistema?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Registro Anónimo</h4>
                <p className="text-gray-600 text-sm">
                  Completa el formulario sin revelar tu identidad. Tu email será encriptado.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Seguimiento</h4>
                <p className="text-gray-600 text-sm">
                  Recibe un código único para consultar el estado de tu denuncia en cualquier momento.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-xl">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Resolución</h4>
                <p className="text-gray-600 text-sm">
                  Nuestro equipo gestiona tu denuncia hasta su resolución completa.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500">
          <p>© 2024 Canal de Denuncias Empresarial. Todos los derechos reservados.</p>
          <p className="mt-2 text-sm">Sistema seguro y confidencial para la gestión de denuncias.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
