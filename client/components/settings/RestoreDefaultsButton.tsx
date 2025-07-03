import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { RotateCcw, AlertTriangle, RefreshCw } from "lucide-react";

interface RestoreDefaultsButtonProps {
  onRestore: () => void;
  isResetting: boolean;
}

export function RestoreDefaultsButton({
  onRestore,
  isResetting,
}: RestoreDefaultsButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleConfirmRestore = () => {
    console.log("{{restoreDefaults}} - Restoring all settings to default");
    onRestore();
    setIsDialogOpen(false);
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          disabled={isResetting}
          className="border-red-600/50 text-red-400 hover:bg-red-900/20 hover:border-red-500"
        >
          {isResetting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RotateCcw className="h-4 w-4 mr-2" />
          )}
          {isResetting ? "Restableciendo..." : "Restablecer valores"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-gray-800 border-gray-700">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-900/30 border border-red-500/30">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <AlertDialogTitle className="text-white">
              ¿Restablecer configuraciones?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-400">
            Esta acción eliminará todas tus configuraciones personalizadas y
            restaurará los valores predeterminados del sistema. Esta operación
            no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Warning details */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3 my-4">
          <h4 className="text-red-300 font-medium text-sm mb-2">
            Se restablecerán los siguientes ajustes:
          </h4>
          <ul className="text-red-200/80 text-xs space-y-1">
            <li>• Idioma y zona horaria</li>
            <li>• Notificaciones y tema</li>
            <li>• Firma de mensajes personalizada</li>
            <li>• Plantillas y atajos de teclado</li>
            <li>• Todas las configuraciones avanzadas</li>
          </ul>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmRestore}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Sí, restablecer todo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
