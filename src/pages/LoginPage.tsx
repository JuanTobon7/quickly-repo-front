import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { login, storeAuth } from '@/services/api/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Por favor, complete todos los campos');
      return;
    }

    // 🔧 BYPASS TEMPORAL PARA PRUEBAS
    if (email === 'admin@test.com' && password === 'admin123') {
      const mockResponse = {
        token: 'mock-token-for-testing-' + Date.now(),
        type: 'Bearer',
        employee: {
          id: '00000000-0000-0000-0000-000000000000',
          name: 'Admin',
          lastname: 'Test',
          email: 'admin@test.com',
          createdAt: new Date().toISOString(),
          costCenterIds: []
        }
      };
      
      storeAuth(mockResponse);
      toast.success(`Bienvenido, ${mockResponse.employee.name}!`);
      navigate('/');
      return;
    }

    setIsLoading(true);

    try {
      const response = await login({ email, password });
      
      // Store token and user data
      storeAuth(response);
      
      toast.success(`Bienvenido, ${response.employee.name}!`);
      
      // Redirect to home
      navigate('/');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // El interceptor ya mostró el toast, solo manejamos casos específicos
      if (error.status === 401) {
        // El mensaje ya fue mostrado por el interceptor o es un error de red
        // Solo mostramos si no hay mensaje previo
        if (!error.message || error.message === 'No autorizado') {
          toast.error('Email o contraseña incorrectos');
        }
      }
      // No mostramos toast para otros errores porque el interceptor ya lo hizo
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-4 border-primary/40 bg-primary/15 text-4xl font-bold text-primary shadow-lg">
            EM
          </div>
          <h1 className="text-3xl font-bold text-secondary">El Mayorista</h1>
          <p className="mt-2 text-sm text-muted">Sistema de Punto de Venta</p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-white p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary">Iniciar Sesión</h2>
            <p className="mt-1 text-sm text-muted">Ingrese sus credenciales para continuar</p>
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-xs text-amber-800">
                <strong>Bypass temporal:</strong> admin@test.com / admin123
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-secondary">
                Correo Electrónico
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                placeholder="usuario@ejemplo.com"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-muted"
                autoComplete="email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-secondary">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                placeholder="••••••••"
                className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-gray-50 disabled:text-muted"
                autoComplete="current-password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted">
          © 2025 El Mayorista SAS. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
