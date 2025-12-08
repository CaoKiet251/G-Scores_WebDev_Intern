# G-Scores – Tra cứu & phân tích điểm thi THPT 2024

Ứng dụng web cho phép tìm kiếm điểm thi THPT theo số báo danh, xem top thí sinh theo từng khối và dựng biểu đồ nhanh. Kiến trúc gồm frontend React + Vite, backend NestJS + Prisma, PostgreSQL và Redis cache. Bộ dữ liệu mẫu nằm tại `dataset/diem_thi_thpt_2024.csv` và có script nhập liệu tự động.

## Kiến trúc tổng quan
- Frontend: React 19, Vite, TailwindCSS, Chart.js, React Router.
- Backend: NestJS 11, Prisma ORM, Redis cache (ioredis), script nhập CSV theo batch.
- Hạ tầng: PostgreSQL 15, Redis 7, Docker Compose hỗ trợ chạy full stack.

## Yêu cầu hệ thống
- Node.js 18+ và npm.
- PostgreSQL 15+ và Redis 7+ (nếu không dùng Docker).
- Docker & Docker Compose (tùy chọn, chạy nhanh toàn bộ stack).


## Chạy nhanh bằng Docker
1) Sao chép repo, đảm bảo Docker đang chạy.
2) Khởi động stack:
   - `docker compose up -d --build`
   - Backend sẽ chạy ở port `3000`, frontend ở `5173`.
3) (Khuyến nghị) Chạy migrate thủ công nếu cần:
   - `docker compose exec backend npx prisma migrate deploy`
4) Nhập dữ liệu mẫu:
   - `docker compose exec backend npm run import:data`
5) Mở trình duyệt: http://localhost:5173

## Chạy thủ công 
### 1. Backend
```bash
cd backend
npm install
```

Tạo file `.env` tham khảo file .env mẫu:
```bash
# Database
DATABASE_URL= # Chuỗi kết nối đến cơ sở dữ liệu 
```
Chạy migrate:
```bash
npx prisma migrate dev --name init
```

Nhập dữ liệu điểm thi (đọc từ `../dataset/diem_thi_thpt_2024.csv`):
```bash
npm run import:data
```

Khởi động API:
```bash
npm run start:dev   # hot reload
# hoặc
npm run start       # build TS và chạy
```

### 2. Frontend
```bash
cd frontend
npm install
```

Chạy dev server:
```bash
npm run dev
```
Mặc định Vite dùng port `5173`.
