import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { api } from '../../services/api';
import type { StudentScores } from '../../services/api';

/**
 * SearchScores Component
 * 
 * Component tìm kiếm điểm của thí sinh theo số báo danh (SBD)
 * - Real-time validation khi user nhập
 * - Hiển thị visual feedback (border màu đỏ/xanh)
 * - Hiển thị warning/success messages
 * - Tự động filter chỉ cho phép nhập số
 * 
 * @returns 
 */
export default function SearchScores() {
  // State quản lý số báo danh người dùng nhập
  const [sbd, setSbd] = useState('');
  
  // State lưu kết quả tìm kiếm điểm
  const [scores, setScores] = useState<StudentScores | null>(null);
  
  // State quản lý trạng thái loading khi gọi API
  const [loading, setLoading] = useState(false);
  // State lưu error message từ API
  const [error, setError] = useState<string | null>(null);
  // Modal thông báo không tìm thấy SBD
  const [notFoundModal, setNotFoundModal] = useState<string | null>(null);
  
  // State lưu validation warning message 
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  /**
   * Validate số báo danh (SBD)
   * 
   * Rules:
   * - Phải đủ 8 ký tự
   * - Chỉ chứa số (0-9)
   * 
   * @param value - Giá trị SBD cần validate
   * @returns Error message nếu không hợp lệ, null nếu hợp lệ
   */
  const validateSbd = (value: string): string | null => {
    const trimmed = value.trim();
    
    // Không hiển thị warning khi input rỗng
    if (!trimmed) {
      return null;
    }

    // Kiểm tra độ dài chính xác
    if (trimmed.length !== 8) {
      return 'Số báo danh phải đủ 8 ký tự';
    }

    // Kiểm tra chỉ chứa số
    if (!/^[0-9]+$/.test(trimmed)) {
      return 'Số báo danh chỉ được chứa số';
    }

    return null; // Hợp lệ
  };

  /**
   * Real-time validation khi user nhập
   * Tự động kiểm tra và hiển thị warning ngay khi có thay đổi
   */
  useEffect(() => {
    if (sbd.trim()) {
      const warning = validateSbd(sbd);
      setValidationWarning(warning);
    } else {
      // Clear warning khi input rỗng
      setValidationWarning(null);
    }
  }, [sbd]);

  /**
   * Xử lý submit form tìm kiếm
   * 
   * Flow:
   * 1. Validate input
   * 2. Gọi API để lấy điểm
   * 3. Hiển thị kết quả hoặc error
   * 
   * @param e - Form submit event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate trước khi gọi API
    const validationError = validateSbd(sbd);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setValidationWarning(null);
      setNotFoundModal(null);
      
      // Gọi API để lấy điểm theo SBD
      const data = await api.getScoresBySbd(sbd.trim());
      setScores(data);
    } catch (err: any) {
      // Xử lý các loại error khác nhau
      if (err.response?.status === 404) {
        setError('Không tìm thấy thí sinh với số báo danh này');
        setNotFoundModal('Không tìm thấy số báo danh bạn vừa nhập. Vui lòng kiểm tra và thử lại.');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Dữ liệu đầu vào không hợp lệ');
      } else {
        setError('Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.');
      }
      setScores(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Xử lý thay đổi input
   * 
   * - Tự động filter chỉ cho phép nhập số
   * - Clear error khi user đang nhập
   * 
   * @param e - Input change event
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Chỉ cho phép nhập số, tự động loại bỏ ký tự không phải số
    const numericValue = value.replace(/[^0-9]/g, '');
    setSbd(numericValue);
    
    // Clear error khi user đang nhập để không làm phiền
    if (error) {
      setError(null);
    }
  };

  // Tính toán trạng thái input để hiển thị visual feedback
  const isInputValid = !validationWarning && sbd.trim().length === 8;
  const isInputInvalid = validationWarning !== null && sbd.trim().length > 0;
  const hasScoreData = scores && scores.scores && scores.scores.length > 0;

  /**
   * Modal thông báo khi không tìm thấy SBD
   */
  const NotFoundModal = ({ message }: { message: string }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
        <div className="bg-primary rounded-t-xl px-6 py-4 border-b border-gray-200 flex items-center justify-end">
          <button
            aria-label="Đóng thông báo"
            className="text-white hover:text-gray-100"
            onClick={() => setNotFoundModal(null)}
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="px-6 py-6 text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <p className="text-sm md:text-base font-semibold text-gray-800">Nhập sai số báo danh</p>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
        </div>
        <div className="px-6 py-3 border-t border-gray-200 flex justify-center">
          <button
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm md:text-base font-semibold hover:bg-primary-dark transition-colors"
            onClick={() => setNotFoundModal(null)}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Modal thông báo không tìm thấy SBD */}
      {notFoundModal && <NotFoundModal message={notFoundModal} />}

      <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 md:mb-6 text-center md:text-left">
        Tra cứu điểm thi tốt nghiệp THPT
      </h2>

      <div className="flex flex-col gap-4 md:gap-6">
        {/* Form tìm kiếm */}
        <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 md:gap-4 items-start md:items-center flex-col md:flex-row">
                <div className="flex-1 w-full md:w-auto">
                  <div className="relative">
                    {/* Warning badge hiển thị ngay phía trên ô nhập khi không hợp lệ */}
                    {validationWarning && (
                      <div className="absolute -top-7 right-0 text-xs md:text-sm text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 shadow-sm flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                        <span>{validationWarning}</span>
                      </div>
                    )}

                    {/* Input field với real-time validation */}
                    <input
                      id="sbd"
                      type="text"
                      inputMode="numeric" // Hiển thị bàn phím số trên mobile
                      pattern="[0-9]*" // Pattern validation cho HTML5
                      className={`w-full px-3 md:px-4 py-2 md:py-3 border rounded-lg text-sm md:text-base font-sans focus:outline-none focus:ring-2 transition-all ${
                        // Dynamic border color dựa trên validation state
                        isInputInvalid
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' // Invalid: đỏ
                          : isInputValid
                          ? 'border-green-500 focus:ring-green-500 focus:border-green-500' // Valid: xanh
                          : 'border-gray-300 focus:ring-primary focus:border-transparent' // Default: xám
                      }`}
                      placeholder="01000001" // SBD mẫu
                      value={sbd}
                      onChange={handleInputChange}
                      maxLength={8} // Giới hạn tối đa 8 ký tự
                    />
                  </div>
                 
                </div>
                
                {/* Submit button */}
                <button
                  type="submit"
                  className="px-6 md:px-8 py-2 md:py-3 bg-black text-white rounded-lg text-sm md:text-base font-semibold font-sans cursor-pointer transition-all hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap w-full md:w-auto"
                  disabled={loading || isInputInvalid || !isInputValid} // Disable khi đang loading, input invalid hoặc chưa đủ/đúng độ dài
                >
                  Tra cứu
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Card hiển thị kết quả tìm kiếm (chỉ hiển thị khi đang loading hoặc có dữ liệu điểm) */}
        {(loading || hasScoreData) && (
          <div className="bg-white rounded-lg md:rounded-xl p-4 md:p-6 shadow-lg hover:shadow-xl transition-shadow">
            <h3 className="text-lg md:text-xl font-semibold text-primary mb-4 md:mb-6">Chi tiết điểm số</h3>
            
            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-6 md:py-8 text-gray-600">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm md:text-base">Đang tra cứu...</p>
              </div>
            )}

            {/* Kết quả */}
            {!loading && hasScoreData && scores && (
              <div className="flex flex-col gap-4 md:gap-6">
                {/* Thông tin thí sinh */}
                <div className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <p className="my-1 md:my-2 text-sm md:text-base text-gray-800">
                    <strong>SBD:</strong> {scores.sbd}
                  </p>
                  {/* Hiển thị mã ngoại ngữ nếu có */}
                  {scores.ma_ngoai_ngu && (
                    <p className="my-1 md:my-2 text-sm md:text-base text-gray-800">
                      <strong>Mã Ngoại Ngữ:</strong> {scores.ma_ngoai_ngu}
                    </p>
                  )}
                </div>
                
                {/* Bảng điểm các môn học */}
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
                              {/* Hiển thị điểm hoặc N/A nếu không có điểm */}
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
            )}

          </div>
        )}
      </div>
    </div>
  );
}
