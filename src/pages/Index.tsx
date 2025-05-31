
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import AppHeader from "@/components/AppHeader";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <AppHeader />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
            Tu voz importa. Denuncia de forma segura y anónima.
          </h2>
          <p className="text-lg text-gray-700 mb-8">
            Nuestro canal de denuncias te permite reportar irregularidades de manera confidencial.
            Tu identidad está protegida y tu reporte contribuye a un ambiente laboral más transparente.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link to="/nueva-denuncia">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Realizar una Denuncia
              </Button>
            </Link>
            <Link to="/consultar">
              <Button variant="outline">
                Consultar Estado
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Anonimato Garantizado</h3>
            <p className="text-gray-600">
              Tu identidad se mantiene en secreto. Utilizamos tecnología de encriptación para proteger tus datos personales.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Seguimiento Transparente</h3>
            <p className="text-gray-600">
              Recibe un código de seguimiento único para monitorear el estado de tu denuncia sin revelar tu identidad.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Compromiso con la Integridad</h3>
            <p className="text-gray-600">
              Cada denuncia es revisada por un equipo especializado que garantiza una investigación justa y objetiva.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Canal de Denuncias. Todos los derechos reservados.
          </p>
          <p className="text-xs mt-2">
            Este canal cumple con las normativas de protección de datos y garantiza la confidencialidad de la información.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
