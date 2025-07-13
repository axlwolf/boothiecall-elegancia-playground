import { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Gallery Background */}
      <div className="gallery-background" />
      
      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;