import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'tables/all_tables.dart';

part 'app_database.g.dart';

/// Main database class for the Restaurant Office Suite
@DriftDatabase(tables: [
  Employees,
  Departments,
  Attendance,
  Leaves,
  Salaries,
  Expenses,
  Users,
  Roles,
  AuditLogs,
  Settings,
  Licenses,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;

  /// Get all employees with their department information
  Future<List<EmployeeWithDepartment>> getEmployeesWithDepartments() {
    final query = select(employees).join([
      leftOuterJoin(departments, departments.id.equalsExp(employees.departmentId)),
    ]);
    return query.map((row) {
      return EmployeeWithDepartment(
        employee: row.readTable(employees),
        department: row.readTableOrNull(departments),
      );
    }).get();
  }

  /// Get attendance records with employee details
  Future<List<AttendanceWithEmployee>> getAttendanceWithEmployees({
    DateTime? startDate,
    DateTime? endDate,
  }) {
    var query = select(attendance).join([
      innerJoin(employees, employees.id.equalsExp(attendance.employeeId)),
    ]);

    if (startDate != null) {
      query = query.where(attendance.date.isBiggerOrEqualValue(startDate));
    }
    if (endDate != null) {
      query = query.where(attendance.date.isSmallerOrEqualValue(endDate));
    }

    return query.map((row) {
      return AttendanceWithEmployee(
        attendance: row.readTable(attendance),
        employee: row.readTable(employees),
      );
    }).get();
  }

  /// Get leave requests with employee details
  Future<List<LeaveWithEmployee>> getLeavesWithEmployees() {
    final query = select(leaves).join([
      innerJoin(employees, employees.id.equalsExp(leaves.employeeId)),
    ]);
    return query.map((row) {
      return LeaveWithEmployee(
        leave: row.readTable(leaves),
        employee: row.readTable(employees),
      );
    }).get();
  }

  /// Get salary records with employee details
  Future<List<SalaryWithEmployee>> getSalariesWithEmployees({
    int? month,
    int? year,
  }) {
    var query = select(salaries).join([
      innerJoin(employees, employees.id.equalsExp(salaries.employeeId)),
    ]);

    if (month != null) {
      query = query.where(salaries.month.equalsValue(month));
    }
    if (year != null) {
      query = query.where(salaries.year.equalsValue(year));
    }

    return query.map((row) {
      return SalaryWithEmployee(
        salary: row.readTable(salaries),
        employee: row.readTable(employees),
      );
    }).get();
  }

  /// Get dashboard statistics
  Future<DashboardStats> getDashboardStats() async {
    final totalEmployees = await (select(employees)..where((e) => e.status.equals('active'))).count();
    final presentToday = await (select(attendance)
          ..where((a) => a.date.equals(DateTime.now()) & a.status.equals('present')))
        .count();
    final pendingLeaves = await (select(leaves)..where((l) => l.status.equals('pending'))).count();
    final totalExpenses = await (select(expenses).sum((e) => e.amount)) ?? 0;

    return DashboardStats(
      totalEmployees: totalEmployees,
      presentToday: presentToday,
      pendingLeaves: pendingLeaves,
      totalExpenses: totalExpenses,
    );
  }

  /// Get or create license
  Future<License?> getCurrentLicense() async {
    final licenses = await (select(licenses)..orderBy([(t) => OrderingTerm.desc(t.createdAt)])).get();
    return licenses.isNotEmpty ? licenses.first : null;
  }

  /// Check if premium features are enabled
  Future<bool> isPremiumEnabled() async {
    final license = await getCurrentLicense();
    return license?.licenseType == 'premium' && license?.status == 'active';
  }

  /// Log an audit entry
  Future<int> logAudit({
    required int userId,
    required String action,
    required String entity,
    int? entityId,
    String? oldValue,
    String? newValue,
    String? ipAddress,
  }) {
    return into(auditLogs).insert(AuditLogsCompanion(
      userId: Value(userId),
      action: Value(action),
      entity: Value(entity),
      entityId: Value(entityId),
      oldValue: Value(oldValue),
      newValue: Value(newValue),
      ipAddress: Value(ipAddress),
    ));
  }
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'restaurant_office.db'));
    return NativeDatabase.createInBackground(file);
  });
}

/// Data class for employee with department
class EmployeeWithDepartment {
  final Employee employee;
  final Department? department;

  EmployeeWithDepartment({required this.employee, this.department});
}

/// Data class for attendance with employee
class AttendanceWithEmployee {
  final Attendance attendance;
  final Employee employee;

  AttendanceWithEmployee({required this.attendance, required this.employee});
}

/// Data class for leave with employee
class LeaveWithEmployee {
  final Leave leave;
  final Employee employee;

  LeaveWithEmployee({required this.leave, required this.employee});
}

/// Data class for salary with employee
class SalaryWithEmployee {
  final Salary salary;
  final Employee employee;

  SalaryWithEmployee({required this.salary, required this.employee});
}

/// Dashboard statistics data class
class DashboardStats {
  final int totalEmployees;
  final int presentToday;
  final int pendingLeaves;
  final double totalExpenses;

  DashboardStats({
    required this.totalEmployees,
    required this.presentToday,
    required this.pendingLeaves,
    required this.totalExpenses,
  });
}
