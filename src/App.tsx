import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NuevaDenuncia from "./pages/NuevaDenuncia";
import ConsultarDenuncia from "./pages/ConsultarDenuncia";
import Login from "./pages/Login";
import SetupAdmin from "./pages/SetupAdmin";
import Backoffice from "./pages/Backoffice";
import GestionDenuncias from "./pages/GestionDenuncias";
import GestionUsuarios from "./pages/GestionUsuarios";
import GestionEmpresa from "./pages/GestionEmpresa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/nueva-denuncia" element={<NuevaDenuncia />} />
          <Route path="/consultar" element={<ConsultarDenuncia />} />
          <Route path="/login" element={<Login />} />
          <Route path="/setup-admin" element={<SetupAdmin />} />
          <Route path="/backoffice" element={<Backoffice />} />
          <Route path="/backoffice/denuncias" element={<GestionDenuncias />} />
          <Route path="/backoffice/usuarios" element={<GestionUsuarios />} />
          <Route path="/backoffice/empresa" element={<GestionEmpresa />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
