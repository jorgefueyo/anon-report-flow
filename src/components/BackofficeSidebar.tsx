
import { useNavigate } from "react-router-dom";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { 
  Building2, 
  FileText, 
  Users, 
  BarChart3
} from "lucide-react";

interface BackofficeSidebarProps {
  admin: any;
  activeItem?: string;
}

const BackofficeSidebar = ({ admin, activeItem }: BackofficeSidebarProps) => {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <Building2 className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-lg font-bold">Backoffice</h2>
            <p className="text-sm text-gray-600">{admin.nombre}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/backoffice')}
              className={`w-full ${activeItem === 'dashboard' ? 'bg-blue-100' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/backoffice/denuncias')}
              className={`w-full ${activeItem === 'denuncias' ? 'bg-blue-100' : ''}`}
            >
              <FileText className="w-4 h-4" />
              Denuncias
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/backoffice/empresa')}
              className={`w-full ${activeItem === 'empresa' ? 'bg-blue-100' : ''}`}
            >
              <Building2 className="w-4 h-4" />
              Configurar Empresa
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={() => navigate('/backoffice/admin')}
              className={`w-full ${activeItem === 'admin' ? 'bg-blue-100' : ''}`}
            >
              <Users className="w-4 h-4" />
              Admin. Sistema
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
};

export default BackofficeSidebar;
