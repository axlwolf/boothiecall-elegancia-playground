import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-gray-800">
        <h1 className="text-xl font-bold text-gold-500">Admin Panel</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 p-4 flex-col transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex transition-transform duration-200 ease-in-out`}>
          <h1 className="text-2xl font-bold text-gold-500 mb-8 hidden lg:block">Admin Panel</h1>
          <nav className="flex-grow">
            <ul>
              <li><Link to="/admin/dashboard" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
              <li><Link to="/admin/assets" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Assets</Link></li>
              <li><Link to="/admin/filters" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Filters</Link></li>
              <li><Link to="/admin/designs" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Designs</Link></li>
              <li><Link to="/admin/users" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Users</Link></li>
              <li><Link to="/admin/tenants" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Tenants</Link></li>
              <li><Link to="/admin/formats" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Formats</Link></li>
              <li><Link to="/admin/analytics" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Analytics</Link></li>
              <li><Link to="/admin/settings" className="block py-2 px-4 rounded hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Settings</Link></li>
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

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;