import { useEffect, useState } from 'react';

/**
 * Settings Component
 * 
 * Component cho phép người dùng cấu hình:
 * - API Base URL: Thay đổi URL của backend API
 * - About: Thông tin về ứng dụng
 * 
 * Settings được lưu trong localStorage để persist giữa các sessions
 * 
 * @returns JSX Element
 */
export default function Settings() {
  // State quản lý API URL, lấy từ localStorage hoặc default
  // Giữ chỗ nếu cần dùng API URL sau này
  // const [apiUrl, setApiUrl] = useState(
  //   localStorage.getItem('apiUrl') || 'http://localhost:3000'
  // );
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
  });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    return (localStorage.getItem('fontSize') as 'small' | 'medium' | 'large') || 'medium';
  });

  // Áp dụng theme và kích thước chữ khi load trang
  useEffect(() => {
    applyTheme(theme);
    applyFontSize(fontSize);
  }, []);

  const applyTheme = (value: 'light' | 'dark') => {
    const root = document.documentElement;
    const isDark = value === 'dark';
    root.classList.toggle('dark', isDark);
    root.dataset.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', value);
  };

  const applyFontSize = (value: 'small' | 'medium' | 'large') => {
    const root = document.documentElement;
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    };
    root.style.fontSize = sizeMap[value];
    localStorage.setItem('fontSize', value);
  };



  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6 text-center md:text-left">Cài đặt</h2>

        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <label
              className="font-medium text-gray-700 text-sm md:text-base flex items-center"
            >
              Kích thước chữ
            </label>
              <select
                id="fontSize"
                value={fontSize}
                onChange={(e) => {
                  const value = e.target.value as 'small' | 'medium' | 'large';
                  setFontSize(value);
                  applyFontSize(value);
                }}
                className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>

        </div>
    

      
    </div>
  );
}
