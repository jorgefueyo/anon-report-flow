
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TerminosUsoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nombreEmpresa: string;
}

const TerminosUso = ({ open, onOpenChange, nombreEmpresa }: TerminosUsoProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Términos de Uso del Canal de Denuncias</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-lg">1. OBJETO</h3>
            <p>
              Los presentes términos de uso regulan las condiciones de utilización del Canal de Denuncias 
              puesto a disposición por {nombreEmpresa} para la comunicación de irregularidades o incumplimientos 
              normativos en el ámbito de la empresa.
            </p>

            <h3 className="font-semibold text-lg">2. FINALIDAD DEL CANAL</h3>
            <p>
              El Canal de Denuncias tiene como finalidad facilitar la comunicación de posibles infracciones 
              o irregularidades relacionadas con:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Delitos contra la integridad física</li>
              <li>Delitos contra la libertad e indemnidad sexuales</li>
              <li>Corrupción en los sectores público y privado</li>
              <li>Delitos contra la Hacienda Pública y la Seguridad Social</li>
              <li>Blanqueo de capitales</li>
              <li>Delitos contra el mercado y los consumidores</li>
              <li>Delitos contra el medio ambiente</li>
              <li>Seguridad y salud en el trabajo</li>
              <li>Protección de datos personales</li>
            </ul>

            <h3 className="font-semibold text-lg">3. USUARIOS</h3>
            <p>
              Pueden utilizar este canal cualquier persona que tenga conocimiento de posibles infracciones 
              en el ámbito de {nombreEmpresa}, ya sean empleados, clientes, proveedores o terceros.
            </p>

            <h3 className="font-semibold text-lg">4. CONFIDENCIALIDAD</h3>
            <p>
              {nombreEmpresa} garantiza la confidencialidad de la información recibida a través del canal, 
              así como la protección de la identidad del denunciante, salvo en los casos en que la 
              revelación sea requerida por la legislación aplicable.
            </p>

            <h3 className="font-semibold text-lg">5. PROHIBICIÓN DE REPRESALIAS</h3>
            <p>
              {nombreEmpresa} prohíbe expresamente cualquier tipo de represalia contra las personas que 
              utilicen el canal de buena fe para comunicar posibles infracciones.
            </p>

            <h3 className="font-semibold text-lg">6. RESPONSABILIDADES</h3>
            <p>
              El usuario se compromete a utilizar el canal de forma responsable y veraz, absteniéndose 
              de realizar comunicaciones falsas, maliciosas o que puedan dañar injustificadamente la 
              reputación de terceros.
            </p>

            <h3 className="font-semibold text-lg">7. TRATAMIENTO DE DATOS</h3>
            <p>
              Los datos personales proporcionados serán tratados conforme a la normativa de protección 
              de datos aplicable y a la política de privacidad de {nombreEmpresa}.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TerminosUso;
