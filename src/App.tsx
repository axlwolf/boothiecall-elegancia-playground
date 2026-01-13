import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./admin/hooks/useAuth";
import { lazy, Suspense } from 'react';
import { Loader2 } from "lucide-react";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const CameraTestPage = lazy(() => import("./pages/CameraTestPage"));
const Login = lazy(() => import("./admin/pages/Login"));

// Admin components
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const ProtectedRoute = lazy(() => import("./admin/components/ProtectedRoute"));
const Dashboard = lazy(() => import("./admin/pages/Dashboard"));
const Assets = lazy(() => import("./admin/pages/Assets"));
const Filters = lazy(() => import("./admin/pages/Filters"));
const Designs = lazy(() => import("./admin/pages/Designs"));
const Users = lazy(() => import("./admin/pages/Users"));
const Tenants = lazy(() => import("./admin/pages/Tenants"));
const Formats = lazy(() => import("./admin/pages/Formats"));
const Analytics = lazy(() => import("./admin/pages/Analytics"));
const Settings = lazy(() => import("./admin/pages/Settings"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const App = () => {
  // Detect environment
  const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');
  // Determine router and basename per environment
  const pathname = typeof window !== 'undefined' ? (window.location.pathname || '/') : '/';
  const basename = isVercel ? '' : (pathname.startsWith('/playground') ? '/playground' : '');
  const Router: React.ComponentType<React.ComponentProps<typeof BrowserRouter>> = (isVercel ? (HashRouter as unknown as typeof BrowserRouter) : BrowserRouter);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <Router basename={basename}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/camera-test" element={<CameraTestPage />} />
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route path="" element={<AdminLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="assets" element={<Assets />} />
                    <Route path="filters" element={<Filters />} />
                    <Route path="designs" element={<Designs />} />
                    <Route path="users" element={<Users />} />
                    <Route path="tenants" element={<Tenants />} />
                    <Route path="formats" element={<Formats />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
