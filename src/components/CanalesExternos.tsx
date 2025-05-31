
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CanalesExternosProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nombreEmpresa: string;
}

const CanalesExternos = ({ open, onOpenChange, nombreEmpresa }: CanalesExternosProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Canales de Denuncia Externos</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-lg">INFORMACIÓN SOBRE CANALES EXTERNOS DE DENUNCIA</h3>
            
            <p>
              Sin perjuicio de la posibilidad de utilizar el canal interno de {nombreEmpresa}, 
              le informamos de que existen canales externos para la comunicación de infracciones:
            </p>

            <h3 className="font-semibold text-lg">1. AUTORIDAD INDEPENDIENTE DE PROTECCIÓN FISCAL</h3>
            <p>
              Para denuncias relacionadas con delitos contra la Hacienda Pública y la Seguridad Social:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web: <a href="https://www.airef.es" className="text-blue-600 underline">www.airef.es</a></li>
              <li>Email: airef@airef.es</li>
              <li>Teléfono: 91 582 06 00</li>
            </ul>

            <h3 className="font-semibold text-lg">2. FISCALÍA EUROPEA</h3>
            <p>
              Para denuncias que afecten a los intereses financieros de la Unión Europea:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web: <a href="https://www.eppo.europa.eu" className="text-blue-600 underline">www.eppo.europa.eu</a></li>
              <li>Email: Madrid.EPPO@eppo.europa.eu</li>
            </ul>

            <h3 className="font-semibold text-lg">3. MINISTERIO FISCAL</h3>
            <p>
              Para denuncias de delitos en general:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web: <a href="https://www.fiscal.es" className="text-blue-600 underline">www.fiscal.es</a></li>
              <li>Teléfono: 91 335 47 00</li>
            </ul>

            <h3 className="font-semibold text-lg">4. AGENCIA ESPAÑOLA DE PROTECCIÓN DE DATOS</h3>
            <p>
              Para denuncias relacionadas con protección de datos personales:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web: <a href="https://www.aepd.es" className="text-blue-600 underline">www.aepd.es</a></li>
              <li>Email: consultas@aepd.es</li>
              <li>Teléfono: 91 266 35 17</li>
            </ul>

            <h3 className="font-semibold text-lg">5. INSPECCIÓN DE TRABAJO Y SEGURIDAD SOCIAL</h3>
            <p>
              Para denuncias relacionadas con seguridad y salud laboral:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web: <a href="https://www.mites.gob.es" className="text-blue-600 underline">www.mites.gob.es</a></li>
              <li>Teléfono: 900 104 195</li>
            </ul>

            <h3 className="font-semibold text-lg">6. SERVICIO EJECUTIVO DE PREVENCIÓN DEL BLANQUEO DE CAPITALES (SEPBLAC)</h3>
            <p>
              Para denuncias relacionadas con blanqueo de capitales:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Web: <a href="https://www.sepblac.es" className="text-blue-600 underline">www.sepblac.es</a></li>
              <li>Email: sepblac@sepblac.es</li>
              <li>Teléfono: 91 583 51 00</li>
            </ul>

            <p className="mt-6 p-4 bg-blue-50 rounded-lg">
              <strong>Nota importante:</strong> La utilización de estos canales externos es 
              independiente y complementaria al canal interno de {nombreEmpresa}. El denunciante 
              tiene derecho a elegir el canal que considere más apropiado según las circunstancias 
              de cada caso.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CanalesExternos;
