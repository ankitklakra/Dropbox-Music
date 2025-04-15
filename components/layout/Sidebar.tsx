'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiHome, FiMusic, FiList, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { logout } from '@/lib/services/dropboxService';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome className="w-5 h-5" /> },
    { name: 'Library', path: '/library', icon: <FiMusic className="w-5 h-5" /> },
    { name: 'Playlists', path: '/playlists', icon: <FiList className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <FiSettings className="w-5 h-5" /> },
  ];

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Sidebar content (used for both desktop and mobile)
  const sidebarContent = (
    <>
      <div className="p-4 sm:p-5">
        <h1 className="text-xl sm:text-2xl font-bold text-accent md:text-left text-center">
          <span className="text-primary">Dropbox</span> Music
        </h1>
      </div>

      <nav className="flex-1 px-2 py-2 sm:py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`sidebar-link ${pathname === item.path ? 'active-link' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-3 text-sm sm:text-base">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-3 sm:p-4 border-t border-secondary-lighter">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full justify-start"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="ml-3 text-sm sm:text-base">Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={`hidden md:flex w-64 h-full flex-col bg-secondary border-r border-secondary-lighter ${className}`}>
        {sidebarContent}
      </div>
      
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-2 left-2 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-full bg-secondary-light shadow-md text-accent hover:bg-secondary-lighter transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
        </button>
      </div>
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      >
        {/* Mobile Sidebar */}
        <div 
          className={`w-4/5 max-w-xs h-full flex flex-col bg-secondary shadow-xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar; 