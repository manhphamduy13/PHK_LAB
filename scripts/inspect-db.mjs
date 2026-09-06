import { createClient } from "@libsql/client";

const client = createClient({ url: "file:local.db" });

async function run() {
  console.log("=== ROLES ===");
  const roles = await client.execute("SELECT * FROM roles");
  console.log(roles.rows);

  console.log("=== USERS ===");
  const users = await client.execute("SELECT id, name, email, role_id FROM users");
  console.log(users.rows);

  console.log("=== CLASSES ===");
  const classes = await client.execute("SELECT * FROM classes");
  console.log(classes.rows);

  console.log("=== ENROLLMENTS ===");
  const enrollments = await client.execute("SELECT * FROM enrollments");
  console.log(enrollments.rows);

  console.log("=== COURSES ===");
  const courses = await client.execute("SELECT id, title, teacher_id FROM courses");
  console.log(courses.rows);

  console.log("=== ASSIGNMENTS ===");
  const assignments = await client.execute("SELECT * FROM assignments");
  console.log(assignments.rows);
}

run().catch(console.error);
