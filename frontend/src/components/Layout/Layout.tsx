import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * LayoutProps Interface
 * 
 * Props cho Layout component
 */
interface LayoutProps {
  children: ReactNode;
}

/**
 * Layout Component
 * 
 * Component layout chính của ứng dụng, bao gồm:
 * - Header với logo và menu toggle (tất cả thiết bị)
 * - Sidebar với navigation menu có thể ẩn/mở
 * - Main content area
 * 
 * Features:
 * - Responsive: Sidebar có thể ẩn/mở trên mobile, tablet và desktop
 * - Lưu trạng thái sidebar vào localStorage
 * - Active route highlighting
 * - Smooth transitions
 * 
 * @param children - Nội dung chính của trang
 * @returns JSX Element
 */
export default function Layout({ children }: LayoutProps) {
  // Lấy current route để highlight active menu item
  const location = useLocation();
  
  // State quản lý sidebar mở/đóng
  // Mặc định mở trên desktop (>=1024), đóng trên mobile/tablet
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Kiểm tra localStorage trước
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      return saved === 'true';
    }
    // Mặc định: mở trên desktop (lg+), đóng trên mobile/tablet
    return window.innerWidth >= 1024;
  });

  // Lưu trạng thái sidebar vào localStorage khi thay đổi
  useEffect(() => {
    localStorage.setItem('sidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        // Không cưỡng bức mở trên tablet/mobile
        const saved = localStorage.getItem('sidebarOpen');
        if (saved !== null) {
          setSidebarOpen(saved === 'true');
        } else {
          setSidebarOpen(false);
        }
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    // Desktop luôn mở, không toggle
    if (window.innerWidth >= 1024) return;
    setSidebarOpen((prev) => !prev);
  };

  // Danh sách menu items với path, label và icon component
  const menuItems = [
    { path: '/', label: 'Tổng quan', icon: HomeIcon },
    { path: '/search', label: 'Tra cứu điểm', icon: MagnifyingGlassIcon },
    { path: '/reports', label: 'Báo cáo', icon: ChartBarIcon },
    { path: '/settings', label: 'Cài đặt', icon: Cog6ToothIcon },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-50">
      {/* Header - Sticky ở top */}
      <header className="bg-primary text-white py-6 px-4 md:py-4 md:px-8 flex items-center justify-center shadow-lg sticky top-0 z-50 relative">
        <button
          onClick={toggleSidebar}
          className="absolute lg:hidden left-4 text-white p-2 hover:bg-white/20 rounded-lg transition-all duration-200 hover:scale-110"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
        
        {/* Logo/Title - Căn giữa hoàn toàn */}
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">G-Scores</h1>
      </header>
      
      <div className="flex flex-1 min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-76px)]">
        {/* Sidebar Overlay - Hiển thị khi sidebar mở trên mobile (bên dưới header) */}
        {sidebarOpen && (
          <div
            className="fixed inset-x-0 top-[64px] md:top-[76px] bottom-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed md:static top-[64px] md:top-[76px] bottom-0 left-0 z-40 bg-gradient-to-b from-blue-900 via-primary to-blue-900 shadow-md transform transition-all duration-300 ease-in-out ${
            sidebarOpen
              ? 'translate-x-0 w-56 md:w-56 p-4 md:p-6'
              : '-translate-x-full w-0 p-0'
          }`}
        >
          {/* Sidebar header */}
          <div className={`relative flex items-center justify-center mb-6 transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            <h2 className="text-lg md:text-xl text-center font-bold text-white whitespace-nowrap w-full">
              Menu
            </h2>
            
          </div>
          
          {/* Navigation menu */}
          <nav className={`flex flex-col gap-2 transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    // Chỉ đóng sidebar trên mobile khi click menu item
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`group flex items-center gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 ease-in-out text-left no-underline whitespace-nowrap ${
                    // Highlight active route
                    isActive
                      ? 'font-bold shadow-lg translate-x-2 scale-105' // Active state
                      : 'font-medium hover:bg-white/40 hover:translate-x-2 hover:scale-105 hover:shadow-md' // Default state với hover effects
                  }`}
                >
                  <IconComponent 
                    className={`w-5 h-5 md:w-6 md:h-6 flex-shrink-0 transition-all duration-300 text-white ${
                      isActive 
                        ? 'scale-110 rotate-3' 
                        : 'group-hover:scale-110 group-hover:rotate-3'
                    }`} 
                  />
                  <span className={`text-sm md:text-base text-white transition-all duration-300 ${
                    isActive 
                      ? 'text-white' 
                      : 'group-hover:text-white group-hover:font-semibold'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main
          className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-thin transition-all duration-300"
        >
          <div className="max-w-6xl xl:max-w-7xl mx-auto w-full pb-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
