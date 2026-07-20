/// Application-wide constants
class AppConstants {
  AppConstants._();

  // App info
  static const String appName = 'Restaurant Office Suite';
  static const String appVersion = '1.0.0';

  // Database
  static const String databaseName = 'restaurant_office.db';

  // License types
  static const String licenseBasic = 'basic';
  static const String licensePremium = 'premium';

  // Date formats
  static const String dateFormat = 'yyyy-MM-dd';
  static const String dateTimeFormat = 'yyyy-MM-dd HH:mm:ss';
  static const String timeFormat = 'HH:mm:ss';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // Attendance status
  static const String attendancePresent = 'present';
  static const String attendanceAbsent = 'absent';
  static const String attendanceLate = 'late';
  static const String attendanceHalfDay = 'half_day';

  // Leave status
  static const String leavePending = 'pending';
  static const String leaveApproved = 'approved';
  static const String leaveRejected = 'rejected';
  static const String leaveCancelled = 'cancelled';

  // Employee status
  static const String employeeActive = 'active';
  static const String employeeInactive = 'inactive';
  static const String employeeTerminated = 'terminated';

  // Gender options
  static const String genderMale = 'male';
  static const String genderFemale = 'female';
  static const String genderOther = 'other';

  // Expense categories
  static const String expenseFood = 'food';
  static const String expenseTransport = 'transport';
  static const String expenseUtilities = 'utilities';
  static const String expenseMaintenance = 'maintenance';
  static const String expenseOther = 'other';

  // Routes
  static const String routeDashboard = '/';
  static const String routeEmployees = '/employees';
  static const String routeAttendance = '/attendance';
  static const String routeLeave = '/leave';
  static const String routeDepartments = '/departments';
  static const String routeExpenses = '/expenses';
  static const String routeReports = '/reports';
  static const String routeSettings = '/settings';
  static const String routeAuditLogs = '/audit-logs';
  static const String routeLicensing = '/licensing';

  // Storage keys
  static const String storageTheme = 'theme_mode';
  static const String storageLicense = 'license_type';
  static const String storageUserId = 'user_id';
}
