import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { TopGroupAStudent, ScoreLevelStatistics } from '../../services/api';

/**
 * Dashboard Component
 * 
 * Component hiển thị tổng quan dữ liệu:
 * - Top 10 học sinh khối A (Toán, Vật Lý, Hóa Học)
 * - Thống kê điểm theo môn học với 4 mức độ
 * 
 * @returns JSX Element
 */
export default function Dashboard() {
  // State lưu danh sách top học sinh khối A
  const [topStudents, setTopStudents] = useState<TopGroupAStudent[]>([]);
  
  // State lưu thống kê điểm theo môn học
  const [statistics, setStatistics] = useState<ScoreLevelStatistics[]>([]);
  
  // State quản lý trạng thái loading
  const [loading, setLoading] = useState(true);

  /**
   * Fetch dữ liệu cho dashboard khi component mount
   * Sử dụng Promise.all để fetch song song 2 API, tăng tốc độ
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch song song 2 API để tối ưu thời gian
        const [topData, statsData] = await Promise.all([
          api.getTopGroupA(10), // Top 10 học sinh khối A
          api.getScoreLevelStatistics(), // Thống kê điểm theo môn
        ]);
        
        setTopStudents(topData);
        setStatistics(statsData);
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Chỉ chạy 1 lần khi component mount

  // Hiển thị loading state
  if (loading) {
    return (
      <div className="w-full">
        <div className="text-center py-8 text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-8">Dashboard</h2>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Card hiển thị Top 10 học sinh khối A */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">Top 10 Học Sinh Khối A</h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">STT</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">SBD</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Toán</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Vật Lý</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Hóa Học</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render từng học sinh trong top 10 */}
                  {topStudents.map((student, index) => (
                    <tr key={student.sbd} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{index + 1}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-medium">{student.sbd}</td>
                      {/* Hiển thị điểm từng môn, format 2 chữ số thập phân */}
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.toan?.toFixed(2) || '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.vat_li?.toFixed(2) || '-'}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100">{student.hoa_hoc?.toFixed(2) || '-'}</td>
                      {/* Tổng điểm được highlight */}
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-primary">{student.totalScore.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Card hiển thị thống kê điểm theo môn học */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-3 md:mb-4">Thống Kê Điểm Theo Môn Học</h3>
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <div className="inline-block min-w-full align-middle px-4 md:px-0">
              <table className="min-w-full text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Môn</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">≥8</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">6-8</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">4-6</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">&lt;4</th>
                    <th className="px-2 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Tổng</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render thống kê từng môn học */}
                  {statistics.map((stat) => (
                    <tr key={stat.subjectCode} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-medium text-primary text-xs md:text-sm">{stat.subjectName}</td>
                      {/* Mỗi mức điểm có màu riêng để dễ phân biệt */}
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-green-600">{stat.levelExcellent}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-cyan-600">{stat.levelGood}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-yellow-600">{stat.levelAverage}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-semibold text-red-600">{stat.levelPoor}</td>
                      <td className="px-2 md:px-4 py-2 md:py-3 border-b border-gray-100 font-bold text-primary">{stat.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
