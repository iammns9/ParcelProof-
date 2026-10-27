import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  CheckCircle,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ParcelProofLogo from '../../assets/logo/ParcelProofLogo';

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/parcels?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'SP';

  return (
    <header className="sticky top-0 z-40 w-full h-[70px] bg-white border-b border-brand-border px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-3 md:gap-6">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-brand-muted hover:text-brand-text md:hidden rounded-lg hover:bg-gray-100 transition-standard"
          aria-label="Toggle navigation drawer"
        >
          <Menu size={22} />
        </button>

        <Link to="/dashboard" className="flex items-center">
          <ParcelProofLogo variant="dark" size="md" />
        </Link>
      </div>

      {/* Center: Global Search Input */}
      <div className="flex-1 max-w-xl mx-4 hidden sm:block">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search parcels by code, order ID, customer, tracking number..."
            className="w-full h-10 pl-10 pr-4 text-xs md:text-sm bg-[#F5F6F8] border border-brand-border rounded-lg text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-red focus:bg-white transition-standard"
          />
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none"
          />
        </form>
      </div>

      {/* Right: Notifications, Seller Profile & Dropdown */}
      <div className="flex items-center gap-3">
        {/* Notifications Icon & Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2.5 text-brand-muted hover:text-brand-text hover:bg-gray-100 rounded-lg transition-standard"
            aria-label="View notifications"
          >
            <Bell size={19} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-brand-red rounded-full ring-2 ring-white"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-brand-border rounded-xl shadow-dropdown py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-brand-border flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                  System Alerts
                </span>
                <span className="text-[11px] text-brand-red font-medium">Live Node</span>
              </div>
              <div className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                <div className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3">
                  <CheckCircle size={16} className="text-brand-success mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-brand-text">
                      Cryptographic Hashing Active
                    </p>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      SHA-256 verification online for parcel evidence.
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3">
                  <FileText size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-brand-text">
                      Evidence Library Ready
                    </p>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Photos, videos, and PDFs stored securely.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Seller Avatar and Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-gray-100 transition-standard focus:outline-none"
            aria-expanded={profileDropdownOpen}
          >
            <div className="w-9 h-9 rounded-full bg-[#17191D] text-white flex items-center justify-center font-heading font-bold text-xs tracking-wider border border-gray-200">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-brand-text leading-tight truncate max-w-[120px]">
                {user?.fullName || 'Seller'}
              </span>
              <span className="text-[11px] text-brand-muted leading-tight truncate max-w-[120px]">
                {user?.shopName || 'Online Shop'}
              </span>
            </div>
            <ChevronDown size={14} className="text-brand-muted hidden sm:block" />
          </button>

          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-brand-border rounded-xl shadow-dropdown py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-brand-border">
                <p className="text-xs font-semibold text-brand-text truncate">
                  {user?.fullName}
                </p>
                <p className="text-[11px] text-brand-muted truncate">
                  {user?.email}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-brand-text hover:bg-gray-50 transition-standard"
                >
                  <User size={15} className="text-brand-muted" />
                  Seller Profile
                </Link>
                <Link
                  to="/settings/account"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-brand-text hover:bg-gray-50 transition-standard"
                >
                  <Settings size={15} className="text-brand-muted" />
                  Account Settings
                </Link>
              </div>

              <div className="pt-1 border-t border-brand-border">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-brand-red hover:bg-red-50 transition-standard text-left"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
