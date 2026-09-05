import { db } from "./index";
import { roles, subjects, grades, courses, chapters, lessons, users } from "./schema";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

export async function seed() {
  console.log("Seeding database...");
  
  // Seed Roles
  const adminRoleId = uuidv4();
  const teacherRoleId = uuidv4();
  const studentRoleId = uuidv4();
  
  await db.insert(roles).values([
    { id: adminRoleId, name: 'SUPER_ADMIN' },
    { id: teacherRoleId, name: 'TEACHER' },
    { id: studentRoleId, name: 'STUDENT' },
  ]).onConflictDoNothing();

  // Seed Users
  const adminId = uuidv4();
  const teacherId = uuidv4();
  const studentId = uuidv4();
  
  const defaultPassword = await bcrypt.hash('password123', 10);
  
  await db.insert(users).values([
    { id: adminId, email: 'admin@phk.edu', password: defaultPassword, name: 'Admin', roleId: adminRoleId, createdAt: new Date() },
    { id: teacherId, email: 'khe.pham@phk.edu', password: defaultPassword, name: 'Phạm Hữu Khê', roleId: teacherRoleId, createdAt: new Date() },
    { id: studentId, email: 'student@phk.edu', password: defaultPassword, name: 'Học sinh Demo', roleId: studentRoleId, createdAt: new Date() },
  ]).onConflictDoNothing();

  // Seed Grades
  const grade10Id = uuidv4();
  const grade11Id = uuidv4();
  const grade12Id = uuidv4();
  
  await db.insert(grades).values([
    { id: grade10Id, name: 'Lớp 10' },
    { id: grade11Id, name: 'Lớp 11' },
    { id: grade12Id, name: 'Lớp 12' },
  ]).onConflictDoNothing();

  // Seed Subjects
  const physicsId = uuidv4();
  const mathId = uuidv4();
  
  await db.insert(subjects).values([
    { id: physicsId, name: 'Vật Lý', description: 'Khám phá thế giới vật chất' },
    { id: mathId, name: 'Toán Học', description: 'Tư duy logic' },
  ]).onConflictDoNothing();

  // Seed Courses
  const course1Id = uuidv4();
  
  await db.insert(courses).values([
    { id: course1Id, title: 'Vật Lý 10 Cơ Bản', description: 'Động học chất điểm', teacherId: teacherId, subjectId: physicsId, gradeId: grade10Id }
  ]).onConflictDoNothing();
  
  console.log("Seeding completed.");
}

seed().catch(console.error);
