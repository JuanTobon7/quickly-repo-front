import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import Toaster from '../components/ui/Toaster';
import { queryClient } from '../config/queryClient';

export type AppProvidersProps = {
  children: ReactNode;
};

const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="p-10 text-muted">Cargando…</div>}>
        {children}
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
};

export default AppProviders;
