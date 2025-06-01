
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { validateEmail, sanitizeInput } from "@/utils/secureEncryption";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";

const SecureLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const { login, loginLoading } = useSecureAuth();

  // Rate limiting - block after 5 failed attempts
  const maxAttempts = 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      return;
    }

    // Input validation
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    if (!validateEmail(sanitizedEmail)) {
      return;
    }

    if (!sanitizedPassword || sanitizedPassword.length < 6) {
      return;
    }

    const success = await login(sanitizedEmail, sanitizedPassword);

    if (!success) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= maxAttempts) {
        setIsBlocked(true);
        // In production, implement server-side blocking
        setTimeout(() => {
          setIsBlocked(false);
          setAttempts(0);
        }, 15 * 60 * 1000); // 15 minutes
      }
    } else {
      setAttempts(0);
      setIsBlocked(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Acceso Administrativo Seguro
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isBlocked && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Demasiados intentos fallidos. Acceso bloqueado temporalmente por seguridad.
              </AlertDescription>
            </Alert>
          )}

          {attempts > 0 && attempts < maxAttempts && (
            <Alert className="mb-4 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-700">
                Intento {attempts} de {maxAttempts}. Verificar credenciales.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isBlocked}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isBlocked}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isBlocked}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loginLoading || isBlocked}
            >
              {loginLoading ? "Verificando..." : "Acceder"}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-gray-600">
            <p>Sistema protegido con cifrado AES-256</p>
            <p className="text-xs mt-1">© 2024 - Acceso autorizado únicamente</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecureLoginForm;
