import type { ReactNode } from 'react';

export type FormProviderProps = {
  children: ReactNode;
};

const FormProvider = ({ children }: FormProviderProps) => {
  return <>{children}</>;
};

export default FormProvider;
