import { Navigate, Route, Routes } from 'react-router-dom';

import InventoryPage from '../pages/InventoryPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/" element={<Navigate to="/inventory" replace />} />
      <Route path="*" element={<Navigate to="/inventory" replace />} />
    </Routes>
  );
};

export default AppRoutes;
