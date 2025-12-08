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
import {
  TrophyIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid';
import { Bar, Doughnut } from 'react-chartjs-2';
import { api } from '../../services/api';
import type {
  ScoreLevelStatistics,
  TopGroupAStudent,
  TopGroupBStudent,
  TopGroupCStudent,
  TopGroupDStudent,
} from '../../services/api';

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
  const [topAStudents, setTopAStudents] = useState<TopGroupAStudent[]>([]);
  const [topBStudents, setTopBStudents] = useState<TopGroupBStudent[]>([]);
  const [topCStudents, setTopCStudents] = useState<TopGroupCStudent[]>([]);
  const [topDStudents, setTopDStudents] = useState<TopGroupDStudent[]>([]);
  
  // State quản lý trạng thái loading
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTopA, setLoadingTopA] = useState(false);
  const [loadingTopB, setLoadingTopB] = useState(false);
  const [loadingTopC, setLoadingTopC] = useState(false);
  const [loadingTopD, setLoadingTopD] = useState(false);

  // Tab state: 'report' | 'topA'
  const [activeTab, setActiveTab] = useState<'report' | 'topA' | 'topB' | 'topC' | 'topD'>('report');

  /**
   * Fetch thống kê điểm số khi component mount
   */
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoadingStats(true);
        // Gọi API để lấy thống kê điểm theo 4 mức độ
        const data = await api.getScoreLevelStatistics();
        setStatistics(data);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStatistics();
  }, []); // Chỉ chạy 1 lần khi component mount

  const fetchTopA = async () => {
    if (topAStudents.length > 0) return;
    try {
      setLoadingTopA(true);
      const data = await api.getTopGroupA(10);
      setTopAStudents(data);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingTopA(false);
    }
  };

  const fetchTopB = async () => {
    if (topBStudents.length > 0) return;
    try {
      setLoadingTopB(true);
      const data = await api.getTopGroupB(10);
      setTopBStudents(data);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingTopB(false);
    }
  };

  const fetchTopC = async () => {
    if (topCStudents.length > 0) return;
    try {
      setLoadingTopC(true);
      const data = await api.getTopGroupC(10);
      setTopCStudents(data);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingTopC(false);
    }
  };

  const fetchTopD = async () => {
    if (topDStudents.length > 0) return;
    try {
      setLoadingTopD(true);
      const data = await api.getTopGroupD(10);
      setTopDStudents(data);
    } catch (error) {
      // Silent error handling
    } finally {
      setLoadingTopD(false);
    }
  };

  // Hiển thị loading state
  if (loadingStats && activeTab === 'report') {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-lg text-gray-600">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
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
        backgroundColor: 'rgba(16, 185, 129, 0.85)', // emerald
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Khá (6-8)',
        data: statistics.map((stat) => stat.levelGood),
        backgroundColor: 'rgba(14, 165, 233, 0.85)', // sky
        borderColor: 'rgba(14, 165, 233, 1)',
        borderWidth: 1,
      },
      {
        label: 'Trung Bình (4-6)',
        data: statistics.map((stat) => stat.levelAverage),
        backgroundColor: 'rgba(245, 158, 11, 0.85)', // amber
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 1,
      },
      {
        label: 'Yếu (<4)',
        data: statistics.map((stat) => stat.levelPoor),
        backgroundColor: 'rgba(239, 68, 68, 0.9)', // red
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
          'rgba(16, 185, 129, 0.85)',
          'rgba(14, 165, 233, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(239, 68, 68, 0.9)',
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(14, 165, 233, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
        ],
        borderWidth: 2,
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
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6">Báo Cáo và Thống Kê</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-2 md:mb-4">
        <button
          className={`px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${
            activeTab === 'report'
              ? 'bg-primary text-white shadow'
              : 'bg-white text-primary border border-primary hover:bg-primary/10'
          }`}
          onClick={() => setActiveTab('report')}
        >
          Báo cáo
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${
            activeTab === 'topA'
              ? 'bg-primary text-white shadow'
              : 'bg-white text-primary border border-primary hover:bg-primary/10'
          }`}
          onClick={() => {
            setActiveTab('topA');
            fetchTopA();
          }}
        >
          Top 10 khối A
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${
            activeTab === 'topB'
              ? 'bg-primary text-white shadow'
              : 'bg-white text-primary border border-primary hover:bg-primary/10'
          }`}
          onClick={() => {
            setActiveTab('topB');
            fetchTopB();
          }}
        >
          Top 10 khối B
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${
            activeTab === 'topC'
              ? 'bg-primary text-white shadow'
              : 'bg-white text-primary border border-primary hover:bg-primary/10'
          }`}
          onClick={() => {
            setActiveTab('topC');
            fetchTopC();
          }}
        >
          Top 10 khối C
        </button>
        <button
          className={`px-4 py-2 rounded-lg text-sm md:text-base font-semibold transition-all ${
            activeTab === 'topD'
              ? 'bg-primary text-white shadow'
              : 'bg-white text-primary border border-primary hover:bg-primary/10'
          }`}
          onClick={() => {
            setActiveTab('topD');
            fetchTopD();
          }}
        >
          Top 10 khối D
        </button>
      </div>

      {activeTab === 'report' && (
        <>
      {/* Summary Cards - Hiển thị tổng số học sinh ở mỗi mức điểm */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Xuất Sắc</p>
              <p className="text-lg md:text-2xl font-bold text-emerald-600">{totalExcellent.toLocaleString()}</p>
            </div>
            <TrophyIcon className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-sky-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Khá</p>
              <p className="text-lg md:text-2xl font-bold text-sky-600">{totalGood.toLocaleString()}</p>
            </div>
            <ChartBarIcon className="w-8 h-8 md:w-10 md:h-10 text-sky-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-amber-400">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Trung Bình</p>
              <p className="text-lg md:text-2xl font-bold text-amber-600">{totalAverage.toLocaleString()}</p>
            </div>
            <ArrowTrendingUpIcon className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg border-l-4 border-rose-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Yếu</p>
              <p className="text-lg md:text-2xl font-bold text-rose-600">{totalPoor.toLocaleString()}</p>
            </div>
            <ExclamationTriangleIcon className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />
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

      </div>
      </>
      )}

      {['topA', 'topB', 'topC', 'topD'].includes(activeTab) && (
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-semibold text-primary">
              {activeTab === 'topA' && 'Top 10 Khối A (Toán, Lý, Hóa)'}
              {activeTab === 'topB' && 'Top 10 Khối B (Toán, Hóa, Sinh)'}
              {activeTab === 'topC' && 'Top 10 Khối C (Văn, Sử, Địa)'}
              {activeTab === 'topD' && 'Top 10 Khối D (Toán, Văn, Ngoại ngữ)'}
            </h3>
            {(loadingTopA && activeTab === 'topA') ||
            (loadingTopB && activeTab === 'topB') ||
            (loadingTopC && activeTab === 'topC') ||
            (loadingTopD && activeTab === 'topD') ? (
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : null}
          </div>

          {activeTab === 'topA' && !loadingTopA && topAStudents.length === 0 && (
            <p className="text-gray-500 text-sm md:text-base">Không có dữ liệu.</p>
          )}
          {activeTab === 'topB' && !loadingTopB && topBStudents.length === 0 && (
            <p className="text-gray-500 text-sm md:text-base">Không có dữ liệu.</p>
          )}
          {activeTab === 'topC' && !loadingTopC && topCStudents.length === 0 && (
            <p className="text-gray-500 text-sm md:text-base">Không có dữ liệu.</p>
          )}
          {activeTab === 'topD' && !loadingTopD && topDStudents.length === 0 && (
            <p className="text-gray-500 text-sm md:text-base">Không có dữ liệu.</p>
          )}

          {activeTab === 'topA' && !loadingTopA && topAStudents.length > 0 && (
            <TopTableA rows={topAStudents} />
          )}
          {activeTab === 'topB' && !loadingTopB && topBStudents.length > 0 && (
            <TopTableB rows={topBStudents} />
          )}
          {activeTab === 'topC' && !loadingTopC && topCStudents.length > 0 && (
            <TopTableC rows={topCStudents} />
          )}
          {activeTab === 'topD' && !loadingTopD && topDStudents.length > 0 && (
            <TopTableD rows={topDStudents} />
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Bảng Top khối A (Toán, Lý, Hóa)
 */
function TopTableA({ rows }: { rows: TopGroupAStudent[] }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">#</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">SBD</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Toán</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Lý</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Hóa</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student, idx) => (
              <tr key={student.sbd} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-gray-700">{idx + 1}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-primary">{student.sbd}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.toan?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.vat_li?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.hoa_hoc?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-bold text-primary">{student.totalScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Bảng Top khối B (Toán, Hóa, Sinh)
 */
function TopTableB({ rows }: { rows: TopGroupBStudent[] }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">#</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">SBD</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Toán</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Hóa</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Sinh</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student, idx) => (
              <tr key={student.sbd} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-gray-700">{idx + 1}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-primary">{student.sbd}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.toan?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.hoa_hoc?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.sinh_hoc?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-bold text-primary">{student.totalScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Bảng Top khối C (Văn, Sử, Địa)
 */
function TopTableC({ rows }: { rows: TopGroupCStudent[] }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">#</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">SBD</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Văn</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Sử</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Địa</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student, idx) => (
              <tr key={student.sbd} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-gray-700">{idx + 1}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-primary">{student.sbd}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.ngu_van?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.lich_su?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.dia_li?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-bold text-primary">{student.totalScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Bảng Top khối D (Toán, Văn, Ngoại ngữ)
 */
function TopTableD({ rows }: { rows: TopGroupDStudent[] }) {
  return (
    <div className="overflow-x-auto -mx-4 md:mx-0">
      <div className="inline-block min-w-full align-middle">
        <table className="min-w-full text-xs md:text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">#</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">SBD</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Toán</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Văn</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Ngoại ngữ</th>
              <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student, idx) => (
              <tr key={student.sbd} className="hover:bg-gray-50 transition-colors">
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-gray-700">{idx + 1}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-primary">{student.sbd}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.toan?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.ngu_van?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.ngoai_ngu?.toFixed(2) ?? 'N/A'}</td>
                <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-bold text-primary">{student.totalScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
