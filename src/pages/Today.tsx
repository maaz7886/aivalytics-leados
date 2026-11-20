// src/pages/Today.tsx
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Dashboard from './Dashboard';
import SalespersonWorkspace from './SalespersonWorkspace';

export default function Today() {
  const { currentUser } = useApp();

  if (!currentUser) {
    return <Navigate to="/auth/signin?redirect=/today" replace />;
  }

  // If logged in as Salesperson, render their dedicated Calling Mode Workspace
  if (currentUser.role === 'Salesperson') {
    return <SalespersonWorkspace />;
  }

  // If Admin, render executive Dashboard with Exceptions Center
  if (currentUser.role === 'Admin') {
    return <Dashboard />;
  }

  return <Navigate to="/auth/signin" replace />;
}
