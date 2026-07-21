import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Neon DB...");

  // Departments
  const departments = [
    { id: 101, name: "Management", employeeCount: 1 },
    { id: 102, name: "Kitchen", employeeCount: 2 },
    { id: 103, name: "Service", employeeCount: 1 },
    { id: 104, name: "Finance", employeeCount: 1 },
  ];
  for (const d of departments) {
    await prisma.department.upsert({ where: { id: d.id }, update: d, create: d });
  }

  // Employees
  const employees = [
    { id: 1, firstName: "Ahmed", lastName: "Khan", email: "ahmed@malir.com", phone: "0301-1234567", position: "Manager", department: "Management", hireDate: "2023-01-15", salary: 85000, status: "active" },
    { id: 2, firstName: "Sara", lastName: "Ali", email: "sara@malir.com", phone: "0321-2345678", position: "Chef", department: "Kitchen", hireDate: "2023-03-20", salary: 65000, status: "active" },
    { id: 3, firstName: "Hassan", lastName: "Raza", email: "hassan@malir.com", phone: "0333-3456789", position: "Waiter", department: "Service", hireDate: "2023-06-10", salary: 35000, status: "active" },
    { id: 4, firstName: "Fatima", lastName: "Noor", email: "fatima@malir.com", phone: "0345-4567890", position: "Cashier", department: "Finance", hireDate: "2024-01-05", salary: 40000, status: "active" },
    { id: 5, firstName: "Usman", lastName: "Tariq", email: "usman@malir.com", phone: "0300-5678901", position: "Sous Chef", department: "Kitchen", hireDate: "2023-09-01", salary: 55000, status: "inactive" },
  ];
  for (const e of employees) {
    await prisma.employee.upsert({ where: { id: e.id }, update: e, create: e });
  }

  // Attendance
  const today = new Date().toISOString().split("T")[0];
  const attendance = [
    { id: 201, employeeId: 1, employeeName: "Ahmed Khan", date: today, checkIn: "09:00", checkOut: "", status: "present", notes: "" },
    { id: 202, employeeId: 2, employeeName: "Sara Ali", date: today, checkIn: "08:45", checkOut: "", status: "present", notes: "" },
    { id: 203, employeeId: 3, employeeName: "Hassan Raza", date: today, checkIn: "09:15", checkOut: "", status: "late", notes: "Traffic" },
    { id: 204, employeeId: 4, employeeName: "Fatima Noor", date: today, checkIn: "", checkOut: "", status: "absent", notes: "On leave" },
  ];
  for (const a of attendance) {
    await prisma.attendance.upsert({ where: { id: a.id }, update: a, create: a });
  }

  // Leaves
  const leaves = [
    { id: 301, employeeId: 4, employeeName: "Fatima Noor", startDate: today, endDate: today, type: "sick", status: "approved", reason: "Feeling unwell" },
    { id: 302, employeeId: 3, employeeName: "Hassan Raza", startDate: "2026-07-25", endDate: "2026-07-27", type: "vacation", status: "pending", reason: "Family trip" },
  ];
  for (const l of leaves) {
    await prisma.leave.upsert({ where: { id: l.id }, update: l, create: l });
  }

  // Expenses
  const expenses = [
    { id: 401, category: "Utilities", amount: 15000, description: "Electricity bill", date: "2026-07-01" },
    { id: 402, category: "Inventory", amount: 45000, description: "Weekly grocery restock", date: "2026-07-05" },
    { id: 403, category: "Maintenance", amount: 8000, description: "AC servicing", date: "2026-07-10" },
    { id: 404, category: "Salary", amount: 280000, description: "Monthly payroll", date: "2026-07-01" },
  ];
  for (const e of expenses) {
    await prisma.expense.upsert({ where: { id: e.id }, update: e, create: e });
  }

  // Audit Logs
  const auditLogs = [
    { id: 501, action: "CREATE", entity: "Employee", entityId: 1, details: "Added Ahmed Khan", timestamp: "2023-01-15T10:00:00Z", user: "Admin" },
    { id: 502, action: "UPDATE", entity: "Attendance", entityId: 3, details: "Marked Hassan Raza as late", timestamp: today + "T09:15:00Z", user: "System" },
  ];
  for (const l of auditLogs) {
    await prisma.auditLog.upsert({ where: { id: l.id }, update: l, create: l });
  }

  console.log("Seed complete!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
