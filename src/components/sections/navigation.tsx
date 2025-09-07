"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { label: 'Home', href: '/' },
    { label: 'Blood Test', href: '/blood-test' },
    { label: 'Special Offer', href: '/special-offer' },
    { label: 'Blog', href: '/blog' },
    { label: 'All Packages', href: '/packages' },
    { label: 'Admin', href: '/admin' },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link 
              href="/" 
              className="text-2xl font-bold text-secondary hover:text-primary transition-colors duration-300"
            >
              Thyrocare
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`text-base font-medium transition-colors duration-300 hover:text-primary relative group ${
                    pathname === item.href
                      ? 'text-primary'
                      : 'text-gray-700'
                  }`}
                >
                  {item.label}
                  <span 
                    className={`absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 ${
                      pathname === item.href 
                        ? 'w-full' 
                        : 'w-0 group-hover:w-full'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-sm bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-xl font-bold text-secondary">Menu</span>
          <button
            onClick={closeMobileMenu}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            aria-label="Close mobile menu"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        <div className="py-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobileMenu}
              className={`flex items-center px-6 py-4 text-base font-medium transition-colors duration-300 hover:bg-gray-50 hover:text-primary border-l-4 ${
                pathname === item.href
                  ? 'text-primary bg-red-50 border-primary'
                  : 'text-gray-700 border-transparent hover:border-primary'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-500">© 2024 Thyrocare</p>
            <p className="text-sm text-gray-500">All Rights Reserved</p>
          </div>
        </div>
      </div>

      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16" />
    </>
  );
};