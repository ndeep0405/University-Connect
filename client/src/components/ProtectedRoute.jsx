import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly }) => {
  const token = localStorage.getItem('uc_token');
  const user = localStorage.getItem('uc_user') ? JSON.parse(localStorage.getItem('uc_user')) : null;
  if (!token) {
    return <Navigate to="/login" />;
  }
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

export default ProtectedRoute;
