import 'package:go_router/go_router.dart';
import '../../core/constants/app_constants.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/employees/employees_screen.dart';
import '../screens/attendance/attendance_screen.dart';
import '../screens/leave/leave_screen.dart';
import '../screens/departments/departments_screen.dart';
import '../screens/expenses/expenses_screen.dart';
import '../screens/reports/reports_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/audit_logs/audit_logs_screen.dart';
import '../screens/licensing/licensing_screen.dart';

/// GoRouter configuration for the application
final appRouter = GoRouter(
  initialLocation: AppConstants.routeDashboard,
  routes: [
    GoRoute(
      path: AppConstants.routeDashboard,
      name: 'dashboard',
      builder: (context, state) => const DashboardScreen(),
    ),
    GoRoute(
      path: AppConstants.routeEmployees,
      name: 'employees',
      builder: (context, state) => const EmployeesScreen(),
    ),
    GoRoute(
      path: AppConstants.routeAttendance,
      name: 'attendance',
      builder: (context, state) => const AttendanceScreen(),
    ),
    GoRoute(
      path: AppConstants.routeLeave,
      name: 'leave',
      builder: (context, state) => const LeaveScreen(),
    ),
    GoRoute(
      path: AppConstants.routeDepartments,
      name: 'departments',
      builder: (context, state) => const DepartmentsScreen(),
    ),
    GoRoute(
      path: AppConstants.routeExpenses,
      name: 'expenses',
      builder: (context, state) => const ExpensesScreen(),
    ),
    GoRoute(
      path: AppConstants.routeReports,
      name: 'reports',
      builder: (context, state) => const ReportsScreen(),
    ),
    GoRoute(
      path: AppConstants.routeSettings,
      name: 'settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: AppConstants.routeAuditLogs,
      name: 'audit-logs',
      builder: (context, state) => const AuditLogsScreen(),
    ),
    GoRoute(
      path: AppConstants.routeLicensing,
      name: 'licensing',
      builder: (context, state) => const LicensingScreen(),
    ),
  ],
);
