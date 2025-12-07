/**
 * Script import dữ liệu điểm thi THPT từ file CSV vào database
 * 
 * Quy trình xử lý:
 * 1. Import danh sách môn học 
 * 2. Đọc file CSV theo batch để tránh quá tải memory
 * 3. Với mỗi batch: Import Students -> Import Scores tương ứng
 * 
 * Tối ưu:
 * - Sử dụng streaming để đọc file lớn 
 * - Batch processing để giảm số lượng database queries
 * - skipDuplicates để tránh lỗi khi chạy lại script
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import csv from "fast-csv";
import { SUBJECTS, SUBJECT_MAP } from "./subjects.js";

const prisma = new PrismaClient();

// Kích thước batch để xử lý dữ liệu (số dòng CSV mỗi lần xử lý)
// Giá trị này cân bằng giữa memory usage và số lượng database queries
const BATCH_SIZE = 10000;

/**
 * Import danh sách môn học vào database
 * @returns {Promise<Object>} Map chứa code môn học -> ID (ví dụ: { "TOAN": 1, "NGU_VAN": 2 })
 */
async function importSubjects() {
  console.log("Importing subjects...");
  await prisma.subject.createMany({
    data: SUBJECTS,
    skipDuplicates: true, // Bỏ qua nếu môn học đã tồn tại
  });

  // Lấy lại danh sách môn học từ DB để có ID (cần cho việc tạo foreign key)
  const dbSubjects = await prisma.subject.findMany();
  const subjectIdMap = {};
  dbSubjects.forEach((s) => (subjectIdMap[s.code] = s.id));
  return subjectIdMap;
}

/**
 * Import danh sách học sinh từ batch dữ liệu CSV
 * @param {Array} rows - Mảng các dòng dữ liệu từ CSV (mỗi dòng là một object)
 * @returns {Promise<Object>} Map chứa SBD -> Student ID (ví dụ: { "01000001": 1, "01000002": 2 })
 */
async function importStudents(rows) {
  console.log(`Importing ${rows.length} students...`);

  // Chèn học sinh vào database (bỏ qua nếu SBD đã tồn tại)
  await prisma.student.createMany({
    data: rows.map((r) => ({
      sbd: r.sbd,
      ma_ngoai_ngu: r.ma_ngoai_ngu || null, // Chuyển empty string thành null
    })),
    skipDuplicates: true,
  });

  // Lấy lại danh sách học sinh vừa chèn để có ID (cần cho foreign key trong bảng Score)
  const students = await prisma.student.findMany({
    where: { sbd: { in: rows.map((r) => r.sbd) } },
  });

  const studentIdMap = {};
  students.forEach((s) => (studentIdMap[s.sbd] = s.id));

  return studentIdMap;
}

/**
 * Import điểm số từ batch dữ liệu CSV
 * Duyệt qua từng dòng và từng môn học để tạo bản ghi Score
 * @param {Array} rows - Mảng các dòng dữ liệu từ CSV
 * @param {Object} studentIdMap - Map SBD -> Student ID
 * @param {Object} subjectIdMap - Map subject code -> Subject ID
 */
async function importScores(rows, studentIdMap, subjectIdMap) {
  const scores = [];

  // Duyệt qua từng học sinh và từng môn học để tạo bản ghi điểm
  for (const row of rows) {
    for (const key in SUBJECT_MAP) {
      // Chỉ tạo bản ghi nếu điểm không rỗng
      if (row[key] !== "" && row[key] != null) {
        scores.push({
          studentId: studentIdMap[row.sbd],
          subjectId: subjectIdMap[SUBJECT_MAP[key]], // Chuyển đổi từ tên cột CSV sang code môn học
          score: parseFloat(row[key]),
        });
      }
    }
  }

  console.log(`Importing ${scores.length} scores...`);

  // Chèn tất cả điểm vào database trong một lần (batch insert)
  await prisma.score.createMany({
    data: scores,
    skipDuplicates: true, // Bỏ qua nếu đã tồn tại (studentId + subjectId unique)
  });
}

/**
 * Hàm chính: Đọc file CSV theo streaming và xử lý theo batch
 * Sử dụng streaming để tránh load toàn bộ file vào memory
 */
async function main() {
  console.log("Starting import...");
  const subjectIdMap = await importSubjects();

  let batch = [];

  // Tạo stream đọc file CSV và parse theo dòng
  const stream = fs
    .createReadStream("../dataset/diem_thi_thpt_2024.csv")
    .pipe(csv.parse({ headers: true, trim: true })) // trim: loại bỏ khoảng trắng thừa
    .on("data", (row) => {
      batch.push(row);

      // Khi đủ batch size, tạm dừng stream và xử lý batch
      if (batch.length >= BATCH_SIZE) {
        stream.pause(); // Tạm dừng đọc để xử lý batch hiện tại
        processBatch(batch, subjectIdMap).then(() => {
          batch = []; // Reset batch sau khi xử lý xong
          stream.resume(); // Tiếp tục đọc dòng tiếp theo
        });
      }
    })
    .on("end", async () => {
      // Xử lý batch cuối cùng nếu còn dữ liệu
      if (batch.length > 0) await processBatch(batch, subjectIdMap);
      console.log("Import completed!");
      process.exit(0);
    });
}

/**
 * Xử lý một batch dữ liệu: Import Students trước, sau đó import Scores tương ứng
  @param {Array} batch - Mảng các dòng dữ liệu từ CSV
  @param {Object} subjectIdMap - Map subject code -> Subject ID
 */
async function processBatch(batch, subjectIdMap) {
  console.log(`\nProcessing batch of ${batch.length} rows...`);

  const studentIdMap = await importStudents(batch);
  await importScores(batch, studentIdMap, subjectIdMap);
}

main();
