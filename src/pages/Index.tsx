
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, FileText, Search, Users } from "lucide-react";
import AppHeader from "@/components/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Canal de Denuncias Anónimo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Un espacio seguro y confidencial para reportar irregularidades, 
            promoviendo la transparencia y la integridad en nuestra organización.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-blue-600">
                <FileText className="w-6 h-6 mr-2" />
                Nueva Denuncia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Presenta una denuncia de forma anónima y segura. 
                Recibirás un código de seguimiento para consultar el estado.
              </p>
              <Link to="/nueva-denuncia">
                <Button className="w-full">
                  Realizar Denuncia
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <Search className="w-6 h-6 mr-2" />
                Consultar Estado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Consulta el estado de tu denuncia utilizando el código 
                de seguimiento que recibiste.
              </p>
              <Link to="/consultar">
                <Button variant="outline" className="w-full">
                  Consultar Denuncia
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="text-center">
            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Confidencialidad</h3>
            <p className="text-gray-600">
              Tu identidad está protegida. Todas las denuncias se procesan 
              de forma anónima y segura.
            </p>
          </div>
          
          <div className="text-center">
            <FileText className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Seguimiento</h3>
            <p className="text-gray-600">
              Recibe un código único para consultar el progreso y estado 
              de tu denuncia en cualquier momento.
            </p>
          </div>
          
          <div className="text-center">
            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Compromiso</h3>
            <p className="text-gray-600">
              Nuestro equipo se compromete a investigar y dar seguimiento 
              a cada denuncia recibida.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
