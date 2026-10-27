import React, { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ChevronRight, Home } from 'lucide-react';

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Generate simple breadcrumbs from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const formatBreadcrumb = (segment) => {
    if (segment.match(/^[0-9a-fA-F]{24}$/) || segment.startsWith('PRCL-')) {
      return 'Details';
    }
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

      {/* Main Container below Navbar */}
      <div className="flex-1 flex w-full">
        {/* Left Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* Breadcrumbs (shown on subpages) */}
          {pathSegments.length > 1 && (
            <nav className="flex items-center gap-2 text-xs text-brand-muted mb-4">
              <Link
                to="/dashboard"
                className="hover:text-brand-text flex items-center gap-1 transition-standard"
              >
                <Home size={13} />
                <span>Home</span>
              </Link>
              {pathSegments.map((segment, index) => {
                const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
                const isLast = index === pathSegments.length - 1;

                return (
                  <React.Fragment key={url}>
                    <ChevronRight size={12} className="text-gray-400" />
                    {isLast ? (
                      <span className="font-semibold text-brand-text">
                        {formatBreadcrumb(segment)}
                      </span>
                    ) : (
                      <Link
                        to={url}
                        className="hover:text-brand-text transition-standard"
                      >
                        {formatBreadcrumb(segment)}
                      </Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Child Page Output */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
