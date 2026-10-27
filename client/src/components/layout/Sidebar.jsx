import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShieldCheck,
  RotateCcw,
  Scale,
  BarChart3,
  Settings,
  LogOut,
  X,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ParcelProofLogo from '../../assets/logo/ParcelProofLogo';

export const Sidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: LayoutDashboard,
      planned: false,
    },
    {
      name: 'Parcels',
      path: '/parcels',
      icon: Package,
      planned: false,
    },
    {
      name: 'Evidence',
      path: '/evidence',
      icon: ShieldCheck,
      planned: false,
    },
    {
      name: 'Returns',
      path: '/returns',
      icon: RotateCcw,
      planned: true,
    },
    {
      name: 'Disputes',
      path: '/disputes',
      icon: Scale,
      planned: true,
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: BarChart3,
      planned: true,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden animate-fadeIn"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 md:top-[70px] left-0 z-50 md:z-30 w-[250px] h-screen md:h-[calc(100vh-70px)] bg-brand-sidebar text-white flex flex-col justify-between transition-transform duration-200 ease-in-out border-r border-[#262A33] ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Mobile Header */}
          <div className="flex md:hidden items-center justify-between px-5 h-[70px] border-b border-[#262A33]">
            <ParcelProofLogo variant="light" size="sm" />
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-[#232730]"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Section Header */}
          <div className="px-5 pt-6 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Navigation Menu
            </span>
          </div>

          {/* Nav List */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs md:text-sm font-medium transition-standard ${
                      isActive
                        ? 'bg-brand-red text-white shadow-sm'
                        : 'text-gray-300 hover:text-white hover:bg-[#232730]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className="flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.planned && (
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-[#2A2E37] text-gray-300 border border-[#3A404D]">
                      <Clock size={10} />
                      Planned
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings & Logout */}
        <div className="p-3 border-t border-[#262A33]">
          <div className="px-2 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Account
            </span>
          </div>
          <div className="space-y-1">
            <NavLink
              to="/settings/profile"
              onClick={() => {
                if (window.innerWidth < 768) onClose();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-standard ${
                  isActive
                    ? 'bg-brand-red text-white'
                    : 'text-gray-300 hover:text-white hover:bg-[#232730]'
                }`
              }
            >
              <Settings size={18} />
              <span>Settings</span>
            </NavLink>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium text-gray-300 hover:text-red-400 hover:bg-[#232730] transition-standard text-left"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>

          {/* System Environment Indicator */}
          <div className="mt-4 px-3 py-2 bg-[#1C1F26] rounded-md border border-[#2D323E] flex items-center justify-between text-[11px] text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-success"></span>
              <span>SHA-256 Node</span>
            </div>
            <span className="font-mono text-[10px] text-gray-400">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
