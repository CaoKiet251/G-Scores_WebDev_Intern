import { useState } from 'react';
import { api } from '../../services/api';
import type { StudentScores } from '../../services/api';

export default function SearchScores() {
  const [sbd, setSbd] = useState('');
  const [scores, setScores] = useState<StudentScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sbd.trim()) {
      setError('Vui lòng nhập số báo danh');
      return;
    }

    if (sbd.length > 10) {
      setError('Số báo danh không được vượt quá 10 ký tự');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await api.getScoresBySbd(sbd.trim());
      setScores(data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Không tìm thấy thí sinh với số báo danh này');
      } else {
        setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
      }
      setScores(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-8">Tìm Kiếm Điểm</h2>

      <div className="flex flex-col gap-4 md:gap-6">
        {/* Registration Card */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">User Registration</h3>
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-3">
              <label htmlFor="sbd" className="font-medium text-gray-700 text-sm md:text-base">
                Registration Number:
              </label>
              <div className="flex gap-3 md:gap-4 items-start md:items-center flex-col md:flex-row">
                <input
                  id="sbd"
                  type="text"
                  className="flex-1 w-full px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-sm md:text-base font-sans focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter registration number"
                  value={sbd}
                  onChange={(e) => {
                    setSbd(e.target.value);
                    setError(null);
                  }}
                  maxLength={10}
                />
                <button
                  type="submit"
                  className="px-6 md:px-8 py-2 md:py-3 bg-black text-white rounded-lg text-sm md:text-base font-semibold font-sans cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Submit'}
                </button>
              </div>
              {error && (
                <div className="text-red-600 text-xs md:text-sm mt-2">{error}</div>
              )}
            </div>
          </form>
        </div>

        {/* Scores Card */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <h3 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">Detailed Scores</h3>
          {scores ? (
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                <p className="my-1 md:my-2 text-sm md:text-base text-gray-800">
                  <strong>SBD:</strong> {scores.sbd}
                </p>
                {scores.ma_ngoai_ngu && (
                  <p className="my-1 md:my-2 text-sm md:text-base text-gray-800">
                    <strong>Mã Ngoại Ngữ:</strong> {scores.ma_ngoai_ngu}
                  </p>
                )}
              </div>
              
              {scores.scores.length > 0 ? (
                <div className="overflow-x-auto -mx-4 md:mx-0">
                  <div className="inline-block min-w-full align-middle px-4 md:px-0">
                    <table className="min-w-full text-xs md:text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Môn Học</th>
                          <th className="px-3 md:px-4 py-2 md:py-3 text-left font-semibold text-primary border-b-2 border-gray-200">Điểm</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scores.scores.map((score, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 md:px-4 py-2 md:py-3 border-b border-gray-100">{score.subject.name}</td>
                            <td className={`px-3 md:px-4 py-2 md:py-3 border-b border-gray-100 ${
                              score.score !== null ? 'font-semibold text-primary' : 'text-gray-500 italic'
                            }`}>
                              {score.score !== null ? score.score.toFixed(2) : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4 text-sm md:text-base">Không có điểm số</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic text-center py-6 md:py-8 text-sm md:text-base">Detailed view of search scores here!</p>
          )}
        </div>
      </div>
    </div>
  );
}
