import { BrowserRouter } from 'react-router-dom';
import type { FC } from 'react';

import AppRoutes from './routes';

const App: FC = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
