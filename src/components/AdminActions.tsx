
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RotateCcw } from "lucide-react";

interface AdminActionsProps {
  adminId: string;
  adminEmail: string;
}

const AdminActions = ({ adminId, adminEmail }: AdminActionsProps) => {
  const { toast } = useToast();

  const resetPassword = async () => {
    try {
      // Aquí implementarías la lógica para resetear la contraseña
      // Por ahora simularemos la acción
      console.log('Reseteando contraseña para:', adminEmail);
      
      toast({
        title: "Contraseña reseteada",
        description: `Se ha enviado un email de reset de contraseña a ${adminEmail}`,
      });
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      toast({
        title: "Error",
        description: "No se pudo resetear la contraseña",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        size="sm"
        variant="outline"
        onClick={resetPassword}
        title="Resetear contraseña"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default AdminActions;
