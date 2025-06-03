import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NuevaDenuncia from "./pages/NuevaDenuncia";
import ConsultarDenuncia from "./pages/ConsultarDenuncia";
import BackofficeLogin from "./pages/BackofficeLogin";
import BackofficeDashboard from "./pages/BackofficeDashboard";
import BackofficeDenuncias from "./pages/BackofficeDenuncias";
import BackofficeGestionDenuncia from "./pages/BackofficeGestionDenuncia";
import BackofficeEmpresa from "./pages/BackofficeEmpresa";
import BackofficeConfiguracionCorreo from "./pages/BackofficeConfiguracionCorreo";
import BackofficeAdmin from "./pages/BackofficeAdmin";
import CambiarPassword from "./pages/CambiarPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename="/anon-report-flow">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nueva-denuncia" element={<NuevaDenuncia />} />
          <Route path="/consultar" element={<ConsultarDenuncia />} />
          <Route path="/backoffice/login" element={<BackofficeLogin />} />
          <Route path="/backoffice" element={<BackofficeDashboard />} />
          <Route path="/backoffice/denuncias" element={<BackofficeDenuncias />} />
          <Route path="/backoffice/denuncias/:id" element={<BackofficeGestionDenuncia />} />
          <Route path="/backoffice/empresa" element={<BackofficeEmpresa />} />
          <Route path="/backoffice/configuracion-correo" element={<BackofficeConfiguracionCorreo />} />
          <Route path="/backoffice/admin" element={<BackofficeAdmin />} />
          <Route path="/backoffice/cambiar-password" element={<CambiarPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
