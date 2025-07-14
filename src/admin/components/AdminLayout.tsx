import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';

const AdminLayout: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h1 className="text-2xl font-bold text-gold-500 mb-8">Admin Panel</h1>
        <nav className="flex-grow">
          <ul>
            <li><Link to="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700">Dashboard</Link></li>
            <li><Link to="/admin/assets" className="block py-2 px-4 rounded hover:bg-gray-700">Assets</Link></li>
            <li><Link to="/admin/filters" className="block py-2 px-4 rounded hover:bg-gray-700">Filters</Link></li>
            <li><Link to="/admin/designs" className="block py-2 px-4 rounded hover:bg-gray-700">Designs</Link></li>
            <li><Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-700">Users</Link></li>
            <li><Link to="/admin/tenants" className="block py-2 px-4 rounded hover:bg-gray-700">Tenants</Link></li>
            <li><Link to="/admin/formats" className="block py-2 px-4 rounded hover:bg-gray-700">Formats</Link></li>
            <li><Link to="/admin/analytics" className="block py-2 px-4 rounded hover:bg-gray-700">Analytics</Link></li>
            <li><Link to="/admin/settings" className="block py-2 px-4 rounded hover:bg-gray-700">Settings</Link></li>
          </ul>
        </nav>
        <div className="mt-auto">
          {auth.user && (
            <div className="text-center mb-4">
              <p className="text-sm font-medium">{auth.user.name}</p>
              <p className="text-xs text-gray-400">{auth.user.email}</p>
            </div>
          )}
          <Button onClick={handleLogout} className="w-full bg-red-600 hover:bg-red-700">
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
