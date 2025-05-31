
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NuevaDenuncia from "./pages/NuevaDenuncia";
import ConsultarDenuncia from "./pages/ConsultarDenuncia";
import Login from "./pages/Login";
import Backoffice from "./pages/Backoffice";
import GestionDenuncias from "./pages/GestionDenuncias";
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
          <Route path="/consultar-denuncia" element={<ConsultarDenuncia />} />
          <Route path="/login" element={<Login />} />
          <Route path="/backoffice" element={<Backoffice />} />
          <Route path="/backoffice/denuncias" element={<GestionDenuncias />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
