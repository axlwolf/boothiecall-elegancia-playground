import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <aside className="w-64 bg-gray-800 p-4">
        <h1 className="text-2xl font-bold text-gold-500 mb-8">Admin Panel</h1>
        <nav>
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
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;