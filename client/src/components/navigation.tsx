import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, CheckCircle } from 'lucide-react';

export function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const navItems = [
    { href: '/github', label: 'GitHub', icon: '📊' },
    { href: '/resume', label: 'Resume', icon: '📄' },
    { href: '/portfolio', label: 'Portfolio', icon: '🌐' },
    { href: '/manual', label: 'Skills', icon: '⚡' },
    { href: '/insights', label: 'Insights', icon: '📈' },
    { href: '/builder', label: 'Resume Builder', icon: '🎯', highlight: true },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <CheckCircle className="h-8 w-8 text-primary mr-3" />
              <span className="text-xl font-bold text-slate-900">CareerValid AI</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === item.href
                      ? 'text-primary bg-blue-50'
                      : item.highlight
                      ? 'bg-primary text-white hover:bg-blue-700'
                      : 'text-slate-600 hover:text-primary'
                  }`}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-slate-200">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  location === item.href
                    ? 'text-primary bg-blue-50'
                    : item.highlight
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:text-primary hover:bg-slate-50'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
