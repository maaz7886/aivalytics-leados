// src/pages/Today.tsx
import { useApp } from '../context/AppContext';
import Dashboard from './Dashboard';
import SalespersonWorkspace from './SalespersonWorkspace';

export default function Today() {
  const { currentUser } = useApp();

  // If logged in as Salesperson, render their dedicated Calling Mode Workspace
  if (currentUser?.role === 'Salesperson') {
    return <SalespersonWorkspace />;
  }

  // If Admin, render executive Dashboard with Exceptions Center
  return <Dashboard />;
}
