import 'package:drift/drift.dart';

/// Employee entity representing staff members in the restaurant
class Employees extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  TextColumn get firstName => text().withLength(min: 1, max: 50)();
  TextColumn get lastName => text().withLength(min: 1, max: 50)();
  TextColumn get email => text().unique()();
  TextColumn get phone => text().withLength(min: 1, max: 20)();
  TextColumn get address => text().nullable()();
  
  TextColumn get gender => text().withDefault(const Constant('male'))();
  DateTimeColumn get dateOfBirth => dateTime().nullable()();
  
  IntColumn get departmentId => integer().nullable().references(Departments, #id)();
  
  TextColumn get position => text().nullable()();
  RealColumn get baseSalary => real().withDefault(const Constant(0))();
  
  DateTimeColumn get hireDate => dateTime()();
  TextColumn get status => text().withDefault(const Constant('active'))();
  
  TextColumn get emergencyContactName => text().nullable()();
  TextColumn get emergencyContactPhone => text().nullable()();
  
  BlobColumn get photo => blob().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// Department entity for organizing employees
class Departments extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  TextColumn get name => text().withLength(min: 1, max: 100)();
  TextColumn get description => text().nullable()();
  
  TextColumn get status => text().withDefault(const Constant('active'))();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// Attendance record for tracking employee presence
class Attendance extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  IntColumn get employeeId => integer().references(Employees, #id)();
  DateColumn get date => date()();
  
  TextColumn get status => text().withDefault(const Constant('absent'))();
  TimeColumn get checkIn => time().nullable()();
  TimeColumn get checkOut => time().nullable()();
  
  TextColumn get notes => text().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// Leave request entity
class Leaves extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  IntColumn get employeeId => integer().references(Employees, #id)();
  TextColumn get leaveType => text()();
  
  DateTimeColumn get startDate => dateTime()();
  DateTimeColumn get endDate => dateTime()();
  
  TextColumn get reason => text().nullable()();
  TextColumn get status => text().withDefault(const Constant('pending'))();
  
  IntColumn get approvedBy => integer().nullable();
  DateTimeColumn get approvedAt => dateTime().nullable()();
  
  TextColumn get rejectionReason => text().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// Salary and payroll records
class Salaries extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  IntColumn get employeeId => integer().references(Employees, #id)();
  
  IntColumn get month => integer()();
  IntColumn get year => integer()();
  
  RealColumn get baseSalary => real()();
  RealColumn get allowances => real().withDefault(const Constant(0))();
  RealColumn get deductions => real().withDefault(const Constant(0))();
  RealColumn get bonus => real().withDefault(const Constant(0))();
  RealColumn get overtime => real().withDefault(const Constant(0))();
  
  RealColumn get netSalary => real()();
  
  TextColumn get paymentStatus => text().withDefault(const Constant('pending'))();
  DateTimeColumn get paidDate => dateTime().nullable()();
  
  TextColumn get notes => text().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// Expense records for restaurant operations
class Expenses extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  TextColumn get category => text()();
  TextColumn get description => text()();
  
  RealColumn get amount => real()();
  DateColumn get date => date()();
  
  IntColumn get addedBy => integer().nullable();
  
  TextColumn get status => text().withDefault(const Constant('pending'))();
  TextColumn get notes => text().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// User accounts for system access
class Users extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  TextColumn get username => text().unique()();
  TextColumn get password => text()();
  TextColumn get email => text().unique()();
  
  TextColumn get role => text().withDefault(const Constant('user'))();
  
  IntColumn? get employeeId => integer().nullable().references(Employees, #id)();
  
  TextColumn get status => text().withDefault(const Constant('active'))();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get lastLogin => dateTime().nullable()();
}

/// Roles and permissions
class Roles extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  TextColumn get name => text().unique()();
  TextColumn get description => text().nullable()();
  
  TextColumn get permissions => text().nullable(); // JSON string of permissions
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

/// Audit logs for tracking system changes
class AuditLogs extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  IntColumn get userId => integer().nullable().references(Users, #id)();
  TextColumn get action => text()();
  TextColumn get entity => text()();
  IntColumn get entityId => integer().nullable()();
  
  TextColumn get oldValue => text().nullable(); // JSON string
  TextColumn get newValue => text().nullable(); // JSON string
  
  TextColumn get ipAddress => text().nullable()();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
}

/// Application settings (key-value store)
class Settings extends Table {
  TextColumn get key => text().unique()();
  TextColumn get value => text()();
  
  TextColumn get type => text().withDefault(const Constant('string'))();
  TextColumn get description => text().nullable()();
  
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}

/// License information for feature management
class Licenses extends Table {
  IntColumn get id => integer().autoIncrement()();
  
  TextColumn get licenseKey => text().unique()();
  TextColumn get licenseType => text().withDefault(const Constant('basic'))();
  
  DateTimeColumn get activatedAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn? get expiresAt => dateTime().nullable()();
  
  TextColumn get status => text().withDefault(const Constant('active'))();
  
  DateTimeColumn get createdAt => dateTime().withDefault(currentDateAndTime)();
  DateTimeColumn get updatedAt => dateTime().withDefault(currentDateAndTime)();
}
