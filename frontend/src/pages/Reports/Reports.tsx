import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { api } from '../../services/api';
import type { ScoreLevelStatistics } from '../../services/api';

/**
 * Register Chart.js components
 * Cần register các components trước khi sử dụng
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Reports Component
 * 
 * Component hiển thị báo cáo thống kê điểm số với các biểu đồ:
 * - Bar Chart: So sánh điểm theo môn học (4 mức độ)
 * - Doughnut Chart: Phân bố tổng quan tất cả môn
 * - Line Chart: Xu hướng tổng điểm theo môn
 * - Summary Cards: Tổng số học sinh ở mỗi mức điểm
 * - Data Table: Bảng dữ liệu chi tiết
 * 
 * @returns JSX Element
 */
export default function Reports() {
  // State lưu thống kê điểm theo môn học
  const [statistics, setStatistics] = useState<ScoreLevelStatistics[]>([]);
  
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  /**
   * Fetch thống kê điểm số khi component mount
   */
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        // Gọi API để lấy thống kê điểm theo 4 mức độ
        const data = await api.getScoreLevelStatistics();
        setStatistics(data);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []); // Chỉ chạy 1 lần khi component mount

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  // Chuẩn bị dữ liệu cho các biểu đồ
  // Lấy danh sách tên môn học để làm labels
  const subjectNames = statistics.map((stat) => stat.subjectName);
  
  /**
   * Bar Chart Data - So sánh điểm theo môn học
   * Hiển thị 4 mức độ điểm cho từng môn học
   */
  const barChartData = {
    labels: subjectNames,
    datasets: [
      {
        label: 'Xuất Sắc (≥8)',
        data: statistics.map((stat) => stat.levelExcellent),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: 'Khá (6-8)',
        data: statistics.map((stat) => stat.levelGood),
        backgroundColor: 'rgba(6, 182, 212, 0.8)',
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 1,
      },
      {
        label: 'Trung Bình (4-6)',
        data: statistics.map((stat) => stat.levelAverage),
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderColor: 'rgba(251, 191, 36, 1)',
        borderWidth: 1,
      },
      {
        label: 'Yếu (<4)',
        data: statistics.map((stat) => stat.levelPoor),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  /**
   * Doughnut Chart Data - Phân bố tổng quan
   * Tính tổng số học sinh ở mỗi mức điểm trên tất cả các môn
   */
  const totalExcellent = statistics.reduce((sum, stat) => sum + stat.levelExcellent, 0);
  const totalGood = statistics.reduce((sum, stat) => sum + stat.levelGood, 0);
  const totalAverage = statistics.reduce((sum, stat) => sum + stat.levelAverage, 0);
  const totalPoor = statistics.reduce((sum, stat) => sum + stat.levelPoor, 0);

  const doughnutChartData = {
    labels: ['Xuất Sắc (≥8)', 'Khá (6-8)', 'Trung Bình (4-6)', 'Yếu (<4)'],
    datasets: [
      {
        data: [totalExcellent, totalGood, totalAverage, totalPoor],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(6, 182, 212, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  /**
   * Line Chart Data - Xu hướng tổng điểm theo môn
   * Hiển thị tổng số học sinh có điểm ở mỗi môn học
   */
  const lineChartData = {
    labels: subjectNames,
    datasets: [
      {
        label: 'Tổng số điểm',
        data: statistics.map((stat) => stat.total),
        borderColor: 'rgba(30, 58, 95, 1)',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  /**
   * Chart Options - Cấu hình chung cho Bar và Line charts
   * - Responsive: Tự động điều chỉnh kích thước
   * - Font: Sử dụng font Rubik
   * - Colors: Màu sắc tối ưu cho accessibility
   */
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 10,
          font: {
            size: 12,
            family: 'Rubik',
          },
          boxWidth: 15,
        },
      },
      tooltip: {
        padding: 10,
        titleFont: {
          size: 14,
          family: 'Rubik',
        },
        bodyFont: {
          size: 12,
          family: 'Rubik',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Rubik',
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        ticks: {
          font: {
            family: 'Rubik',
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
  };

  /**
   * Doughnut Chart Options - Cấu hình riêng cho Doughnut chart
   * Legend ở bottom để dễ nhìn hơn
   */
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
            family: 'Rubik',
          },
          boxWidth: 15,
        },
      },
      tooltip: {
        padding: 10,
        titleFont: {
          size: 14,
          family: 'Rubik',
        },
        bodyFont: {
          size: 12,
          family: 'Rubik',
        },
      },
    },
  };

  return (
    <div className="w-full space-y-4 md:space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-8">Báo Cáo Thống Kê</h2>

      {/* Summary Cards - Hiển thị tổng số học sinh ở mỗi mức điểm */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Xuất Sắc</p>
              <p className="text-lg md:text-2xl font-bold text-green-600">{totalExcellent.toLocaleString()}</p>
            </div>
            <div className="text-xl md:text-3xl">🏆</div>
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Khá</p>
              <p className="text-lg md:text-2xl font-bold text-cyan-600">{totalGood.toLocaleString()}</p>
            </div>
            <div className="text-xl md:text-3xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Trung Bình</p>
              <p className="text-lg md:text-2xl font-bold text-yellow-600">{totalAverage.toLocaleString()}</p>
            </div>
            <div className="text-xl md:text-3xl">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Yếu</p>
              <p className="text-lg md:text-2xl font-bold text-red-600">{totalPoor.toLocaleString()}</p>
            </div>
            <div className="text-xl md:text-3xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Charts Grid - Hiển thị Bar và Doughnut charts cạnh nhau */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        {/* Bar Chart - So sánh điểm theo môn học */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">So Sánh Điểm Theo Môn Học</h3>
          <div className="h-64 md:h-80">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart - Phân bố tổng quan tất cả môn */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">Phân Bố Tổng Quan</h3>
          <div className="h-64 md:h-80">
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Line Chart - Xu hướng tổng điểm theo môn học */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">Xu Hướng Tổng Điểm Theo Môn</h3>
        <div className="h-64 md:h-80">
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>

      {/* Data Table - Bảng dữ liệu chi tiết với tổng kết */}
      <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
        <h3 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">Bảng Dữ Liệu Chi Tiết</h3>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full text-xs md:text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Môn Học</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Xuất Sắc</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Khá</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Trung Bình</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Yếu</th>
                  <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
                </tr>
              </thead>
              <tbody>
                {statistics.map((stat) => (
                  <tr key={stat.subjectCode} className="hover:bg-gray-50 transition-colors">
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-medium text-primary text-xs md:text-sm">{stat.subjectName}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-green-600">{stat.levelExcellent.toLocaleString()}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-cyan-600">{stat.levelGood.toLocaleString()}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-yellow-600">{stat.levelAverage.toLocaleString()}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-red-600">{stat.levelPoor.toLocaleString()}</td>
                    <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-bold text-primary">{stat.total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t-2 border-gray-200">
          <h4 className="text-base md:text-lg font-semibold text-primary mb-3 md:mb-4">Tổng Kết</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="flex justify-between items-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-600 text-sm md:text-base">Tổng số môn học:</span>
              <span className="text-lg md:text-xl font-bold text-primary">{statistics.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 md:p-4 bg-gray-50 rounded-lg">
              <span className="font-medium text-gray-600 text-sm md:text-base">Tổng số điểm:</span>
              <span className="text-lg md:text-xl font-bold text-primary">
                {statistics.reduce((sum, stat) => sum + stat.total, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
