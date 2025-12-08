import { useState } from 'react';

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
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('apiUrl') || 'http://localhost:3000'
  );

  /**
   * Xử lý lưu settings
   * Lưu API URL vào localStorage để sử dụng ở các lần truy cập sau
   */
  const handleSave = () => {
    localStorage.setItem('apiUrl', apiUrl);
    alert('Settings saved successfully!');
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-8">Settings</h2>

      {/* API Configuration Card */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">API Configuration</h3>
        <div className="flex flex-col gap-4 md:gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="apiUrl" className="font-medium text-gray-700 text-sm md:text-base">
              API Base URL:
            </label>
            {/* Input để nhập API URL */}
            <input
              id="apiUrl"
              type="text"
              className="w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
            <small className="text-gray-500 text-xs md:text-sm">
              Base URL for the backend API
            </small>
          </div>
          {/* Button lưu settings */}
          <button
            onClick={handleSave}
            className="px-5 md:px-6 py-2 md:py-3 bg-primary text-white rounded-lg text-sm md:text-base font-semibold font-sans cursor-pointer transition-all hover:bg-primary-dark self-start"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* About Card */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">About</h3>
        <div className="flex flex-col gap-2 text-gray-800 text-sm md:text-base">
          <p><strong>G-Scores</strong> - Hệ thống quản lý điểm thi THPT</p>
          <p>Version: 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
