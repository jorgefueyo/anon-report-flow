
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface EstadoBadgeProps {
  estado: 'pendiente' | 'en_proceso' | 'finalizada';
}

const EstadoBadge = ({ estado }: EstadoBadgeProps) => {
  const getEstadoConfig = (estado: string) => {
    const estados = {
      'pendiente': { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'Pendiente' 
      },
      'en_proceso': { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: 'En Proceso' 
      },
      'finalizada': { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Finalizada' 
      }
    };
    
    return estados[estado as keyof typeof estados] || estados.pendiente;
  };

  const config = getEstadoConfig(estado);
  
  return (
    <Badge className={`${config.color} font-medium`}>
      {config.text}
    </Badge>
  );
};

export default EstadoBadge;
