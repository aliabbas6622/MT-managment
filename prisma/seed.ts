import { PrismaClient, LeaveStatus, LeaveType, AttendanceStatus, SalaryStatus, EmployeeStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  console.log('Seeding database...');

  // Departments
  const departmentNames = ['Management', 'Kitchen', 'Service', 'Finance', 'Cleaning'];
  const departments: Record<string, string> = {};
  for (const name of departmentNames) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    departments[name] = dept.id;
  }
  console.log(`Departments: ${Object.keys(departments).length}`);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@malir-tonight.com' },
    update: {},
    create: {
      name: 'Ali Abbas',
      email: 'admin@malir-tonight.com',
      passwordHash: '$2b$10$placeholderhashforadmin123456789',
      role: UserRole.ADMIN,
    },
  });
  console.log(`Admin user: ${admin.name}`);

  // Employees
  const employeeData = [
    { firstName: 'Ali', lastName: 'Abbas', email: 'ali@malir-tonight.com', position: 'General Manager', department: 'Management', salary: 120000 },
    { firstName: 'Sara', lastName: 'Khan', email: 'sara@malir-tonight.com', position: 'Head Chef', department: 'Kitchen', salary: 85000 },
    { firstName: 'Ahmed', lastName: 'Raza', email: 'ahmed@malir-tonight.com', position: 'Sous Chef', department: 'Kitchen', salary: 65000 },
    { firstName: 'Fatima', lastName: 'Noor', email: 'fatima@malir-tonight.com', position: 'Front Desk Lead', department: 'Service', salary: 55000 },
    { firstName: 'Hassan', lastName: 'Ali', email: 'hassan@malir-tonight.com', position: 'Waiter', department: 'Service', salary: 35000 },
    { firstName: 'Ayesha', lastName: 'Malik', email: 'ayesha@malir-tonight.com', position: 'Accountant', department: 'Finance', salary: 70000 },
    { firstName: 'Omar', lastName: 'Sheikh', email: 'omar@malir-tonight.com', position: 'Accountant', department: 'Finance', salary: 60000 },
    { firstName: 'Zainab', lastName: 'Ahmed', email: 'zainab@malir-tonight.com', position: 'Cleaning Supervisor', department: 'Cleaning', salary: 40000 },
    { firstName: 'Bilal', lastName: 'Hussain', email: 'bilal@malir-tonight.com', position: 'Line Cook', department: 'Kitchen', salary: 45000 },
    { firstName: 'Nadia', lastName: 'Akhtar', email: 'nadia@malir-tonight.com', position: 'Waitress', department: 'Service', salary: 35000 },
  ];

  const employees: string[] = [];
  for (const emp of employeeData) {
    const created = await prisma.employee.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        firstName: emp.firstName,
        lastName: emp.lastName,
        email: emp.email,
        phone: `+92-3${Math.floor(100000000 + Math.random() * 900000000)}`,
        position: emp.position,
        departmentId: departments[emp.department],
        hireDate: randomDate(new Date('2023-01-01'), new Date('2024-06-01')),
        salary: emp.salary,
        status: EmployeeStatus.ACTIVE,
      },
    });
    employees.push(created.id);
  }
  console.log(`Employees: ${employees.length}`);

  // Attendance for last 7 days
  let attendanceCount = 0;
  for (let day = 0; day < 7; day++) {
    const date = daysAgo(day);
    const statuses: AttendanceStatus[] = [AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT];
    for (const empId of employees) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const checkIn = new Date(date);
      checkIn.setHours(9 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));
      const checkOut = new Date(date);
      checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

      await prisma.attendance.create({
        data: {
          employeeId: empId,
          date,
          checkIn: status === AttendanceStatus.ABSENT ? null : checkIn,
          checkOut: status === AttendanceStatus.ABSENT ? null : checkOut,
          status,
        },
      });
      attendanceCount++;
    }
  }
  console.log(`Attendance records: ${attendanceCount}`);

  // Leaves
  const leaveData = [
    { empIndex: 0, type: LeaveType.SICK, status: LeaveStatus.APPROVED, reason: 'Fever and cold', daysAgoStart: 5, daysAgoEnd: 3 },
    { empIndex: 2, type: LeaveType.PERSONAL, status: LeaveStatus.PENDING, reason: 'Family function', daysAgoStart: 2, daysAgoEnd: 2 },
    { empIndex: 4, type: LeaveType.VACATION, status: LeaveStatus.APPROVED, reason: 'Annual vacation', daysAgoStart: 10, daysAgoEnd: 7 },
    { empIndex: 7, type: LeaveType.SICK, status: LeaveStatus.REJECTED, reason: 'Not feeling well', daysAgoStart: 1, daysAgoEnd: 1 },
  ];

  for (const leave of leaveData) {
    await prisma.leave.create({
      data: {
        employeeId: employees[leave.empIndex],
        startDate: daysAgo(leave.daysAgoStart),
        endDate: daysAgo(leave.daysAgoEnd),
        type: leave.type,
        status: leave.status,
        reason: leave.reason,
        approvedBy: leave.status === LeaveStatus.APPROVED ? admin.id : null,
      },
    });
  }
  console.log(`Leaves: ${leaveData.length}`);

  // Expenses
  const expenseData = [
    { category: 'Utilities', amount: 45000, description: 'Electricity and water bill - June 2026', daysAgo: 5 },
    { category: 'Inventory', amount: 120000, description: 'Weekly grocery and meat inventory', daysAgo: 3 },
    { category: 'Maintenance', amount: 25000, description: 'Kitchen equipment repair', daysAgo: 7 },
    { category: 'Salary', amount: 550000, description: 'Monthly staff salaries - June 2026', daysAgo: 1 },
    { category: 'Marketing', amount: 30000, description: 'Social media ads and flyers', daysAgo: 4 },
    { category: 'Inventory', amount: 85000, description: 'Beverages and supplies restock', daysAgo: 2 },
  ];

  for (const exp of expenseData) {
    await prisma.expense.create({
      data: {
        category: exp.category,
        amount: exp.amount,
        description: exp.description,
        date: daysAgo(exp.daysAgo),
        createdBy: admin.id,
      },
    });
  }
  console.log(`Expenses: ${expenseData.length}`);

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: admin.id,
        details: { method: 'email', ip: '192.168.1.100' },
        ipAddress: '192.168.1.100',
      },
      {
        userId: admin.id,
        action: 'CREATE',
        entity: 'Employee',
        entityId: employees[1],
        details: { name: 'Sara Khan', position: 'Head Chef' },
        ipAddress: '192.168.1.100',
      },
    ],
  });
  console.log('Audit logs: 2');

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
