import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/search', label: 'Search Scores', icon: '🔍' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Header */}
      <header className="bg-primary text-white py-3 px-4 md:py-4 md:px-8 flex items-center justify-between shadow-lg sticky top-0 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-white p-2 hover:bg-white/20 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">G-Scores</h1>
        <div className="w-10 md:w-0"></div> {/* Spacer for mobile menu button */}
      </header>
      
      <div className="flex flex-1 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-76px)]">
        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-yellow-400 via-yellow-300 to-green-500 p-4 md:p-8 shadow-md transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="flex items-center justify-between mb-6 md:mb-0">
            <h2 className="text-lg md:text-xl font-bold text-black pb-3 border-b-2 border-black/10">
              Menu
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-black p-1 hover:bg-white/30 rounded"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 md:px-5 py-2 md:py-3 rounded-lg transition-all duration-200 text-left no-underline ${
                  location.pathname === item.path
                    ? 'bg-white/60 font-bold shadow-lg translate-x-1'
                    : 'bg-white/20 font-medium hover:bg-white/40 hover:translate-x-1'
                }`}
              >
                <span className="text-lg md:text-xl">{item.icon}</span>
                <span className="text-sm md:text-base">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin">
          {children}
        </main>
      </div>
    </div>
  );
}
