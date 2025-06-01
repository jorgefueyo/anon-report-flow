
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, RotateCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

interface UserManagementActionsProps {
  userId: string;
  userEmail: string;
  userName: string;
  onUserUpdated: () => void;
}

const UserManagementActions = ({ 
  userId, 
  userEmail, 
  userName, 
  onUserUpdated 
}: UserManagementActionsProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editEmail, setEditEmail] = useState(userEmail);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleEditUser = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('administradores')
        .update({
          nombre: editName,
          email: editEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario han sido actualizados correctamente",
      });

      setEditDialogOpen(false);
      onUserUpdated();
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('administradores')
        .update({ activo: false })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Usuario desactivado",
        description: "El usuario ha sido desactivado correctamente",
      });

      setDeleteDialogOpen(false);
      onUserUpdated();
    } catch (error: any) {
      console.error('Error desactivando usuario:', error);
      toast({
        title: "Error",
        description: "No se pudo desactivar el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('administradores')
        .update({ 
          requiere_cambio_password: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Contraseña marcada para reset",
        description: `Se ha marcado la contraseña de ${userName} para ser reseteada en el próximo login`,
      });
    } catch (error: any) {
      console.error('Error reseteando contraseña:', error);
      toast({
        title: "Error",
        description: "No se pudo resetear la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex space-x-2">
      {/* Editar Usuario */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" title="Editar usuario">
            <Edit className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nombre del usuario"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email del usuario"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Eliminar Usuario */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" title="Desactivar usuario">
            <Trash2 className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desactivar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres desactivar al usuario {userName}? 
              Esta acción se puede revertir más tarde.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={loading}>
              {loading ? 'Desactivando...' : 'Desactivar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resetear Contraseña */}
      <Button
        size="sm"
        variant="outline"
        onClick={handleResetPassword}
        disabled={loading}
        title="Resetear contraseña"
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default UserManagementActions;
