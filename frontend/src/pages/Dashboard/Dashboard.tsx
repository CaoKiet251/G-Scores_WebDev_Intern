import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { api } from '../../services/api';
import type { ScoreDistribution } from '../../services/api';

/**
 * Register Chart.js components
 */
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Dashboard Component
 * 
 * Component hiển thị biểu đồ phổ điểm của các môn học theo mẫu:
 * - Biểu đồ cột (Bar Chart) cho từng môn học
 * - Phân bố điểm theo các khoảng: [0, 0.5], [0.5, 1], ..., [9.5, 10] (20 khoảng, mỗi khoảng 0.5 điểm)
 * - Tiêu đề: "Biểu đồ phổ điểm thi THPT môn [Tên môn] - năm 2025"
 * 
 * @returns JSX Element
 */
export default function Dashboard() {
  // State lưu phổ điểm của các môn học
  const [scoreDistribution, setScoreDistribution] = useState<ScoreDistribution[]>([]);
  
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  // Lấy năm hiện tại
  const currentYear = new Date().getFullYear();

  /**
   * Format số với dấu phẩy ngăn cách hàng nghìn
   */
  const formatNumber = (num: number): string => {
    return num.toLocaleString('vi-VN');
  };

  /**
   * Fetch dữ liệu phổ điểm khi component mount
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await api.getScoreDistribution();
        setScoreDistribution(data);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Chuẩn bị dữ liệu cho biểu đồ của một môn học
   * Sử dụng màu xanh dương thống nhất cho tất cả các cột
   */
  const prepareChartData = (subject: ScoreDistribution) => {
    const ranges = subject.distribution.map((item) => item.range);
    const counts = subject.distribution.map((item) => item.count);

    return {
      labels: ranges,
      datasets: [
        {
          label: 'Số lượng thí sinh',
          data: counts,
          backgroundColor: 'rgba(59, 130, 246, 0.8)', 
          borderColor: 'rgba(59, 130, 246, 1)', 
          borderWidth: 0, 
        },
      ],
    };
  };

  /**
   * Tính toán step size cho trục Y dựa trên giá trị max
   */
  const calculateYAxisStep = (maxValue: number): number => {
    if (maxValue <= 1000) return 100;
    if (maxValue <= 10000) return 1000;
    if (maxValue <= 100000) return 10000;
    if (maxValue <= 1000000) return 20000;
    return 50000;
  };

  /**
   * Cấu hình chung cho biểu đồ
   * Tối ưu cho hiển thị đẹp mắt theo mẫu
   */
  const getChartOptions = (maxValue: number) => {
    const stepSize = calculateYAxisStep(maxValue);

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          padding: 10,
          titleFont: {
            size: 13,
            weight: 'bold' as const,
          },
          bodyFont: {
            size: 12,
          },
          callbacks: {
            label: (context: any) => {
              return `Số lượng: ${formatNumber(context.parsed.y)} thí sinh`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
            drawBorder: true,
            borderColor: 'rgba(0, 0, 0, 0.2)',
          },
          ticks: {
            stepSize: stepSize,
            precision: 0,
            font: {
              size: 11,
            },
            color: 'rgba(0, 0, 0, 0.7)',
            callback: function(value: any) {
              return formatNumber(value);
            },
          },
          title: {
            display: true,
            text: 'Số lượng thí sinh',
            font: {
              size: 13,
              weight: 'bold' as const,
            },
            color: 'rgba(0, 0, 0, 0.8)',
            padding: {
              top: 10,
              bottom: 10,
            },
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            font: {
              size: 9,
            },
            color: 'rgba(0, 0, 0, 0.7)',
            maxRotation: 45,
            minRotation: 45,
          },
          title: {
            display: true,
            text: 'Điểm',
            font: {
              size: 13,
              weight: 'bold' as const,
            },
            color: 'rgba(0, 0, 0, 0.8)',
            padding: {
              top: 10,
              bottom: 5,
            },
          },
        },
      },
      datasets: {
        bar: {
          categoryPercentage: 1.0, // Cột liền nhau
          barPercentage: 0.9, // Độ rộng cột
        },
      },
    };
  };

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-lg text-gray-600">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6">
        Biểu đồ phổ điểm thi THPT các môn học năm {currentYear}
      </h2>

      {/* Grid hiển thị biểu đồ cho từng môn học - 1/2/3 cột tùy màn hình */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {scoreDistribution.map((subject) => {
          const totalStudents = subject.distribution.reduce((sum, item) => sum + item.count, 0);
          const maxCount = Math.max(...subject.distribution.map((item) => item.count), 1);
          
          // Chỉ hiển thị môn học có dữ liệu
          if (totalStudents === 0) return null;

          return (
            <div
              key={subject.subjectCode}
              className="bg-white rounded-lg md:rounded-xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200"
            >
              {/* Tiêu đề biểu đồ theo mẫu */}
              <h3 className="text-base md:text-lg font-bold text-gray-800 mb-4 text-center">
                Phổ điểm môn {subject.subjectName}
              </h3>

              {/* Biểu đồ phổ điểm */}
              <div className="h-72 md:h-80 mb-4">
                <Bar 
                  data={prepareChartData(subject)} 
                  options={getChartOptions(maxCount)} 
                />
              </div>

              {/* Thông tin tổng quan */}
              <div className="text-center text-sm text-gray-600 border-t pt-3">
                <span className="font-medium">Tổng số thí sinh: </span>
                <span className="font-bold text-blue-600">{formatNumber(totalStudents)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Thông báo nếu không có dữ liệu */}
      {scoreDistribution.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Không có dữ liệu phổ điểm để hiển thị.
        </div>
      )}
    </div>
  );
}
