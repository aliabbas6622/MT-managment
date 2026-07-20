import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_constants.dart';
import '../../presentation/providers/theme_provider.dart';

/// Main application shell with sidebar navigation
class AppShell extends ConsumerWidget {
  final Widget child;

  const AppShell({super.key, required this.child});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(themeModeProvider);
    final currentRoute = GoRouterState.of(context).uri.path;

    return Scaffold(
      body: Row(
        children: [
          // Left Sidebar Navigation
          _buildSidebar(context, currentRoute, isDarkMode),
          
          // Main Content Area
          Expanded(
            child: Column(
              children: [
                // Top App Bar
                _buildAppBar(context, ref, isDarkMode),
                
                // Content
                Expanded(child: child),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebar(BuildContext context, String currentRoute, bool isDarkMode) {
    return Container(
      width: 260,
      color: AppColors.sidebarBackground,
      child: Column(
        children: [
          // App Logo/Title
          Padding(
            padding: const EdgeInsets.all(20.0),
            child: Row(
              children: [
                Icon(
                  Icons.restaurant_menu,
                  color: AppColors.primaryLight,
                  size: 32,
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Text(
                    'Restaurant\nOffice Suite',
                    style: TextStyle(
                      color: AppColors.sidebarText,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      height: 1.3,
                    ),
                  ),
                ),
              ],
            ),
          ),
          
          const Divider(color: AppColors.sidebarItemSelected),
          
          // Navigation Items
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 8),
              children: [
                _buildNavItem(
                  context,
                  icon: Icons.dashboard,
                  label: 'Dashboard',
                  route: AppConstants.routeDashboard,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.people,
                  label: 'Employees',
                  route: AppConstants.routeEmployees,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.access_time,
                  label: 'Attendance',
                  route: AppConstants.routeAttendance,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.beach_access,
                  label: 'Leave Management',
                  route: AppConstants.routeLeave,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.business,
                  label: 'Departments',
                  route: AppConstants.routeDepartments,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.receipt_long,
                  label: 'Expenses',
                  route: AppConstants.routeExpenses,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.assessment,
                  label: 'Reports',
                  route: AppConstants.routeReports,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.history,
                  label: 'Audit Logs',
                  route: AppConstants.routeAuditLogs,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.settings,
                  label: 'Settings',
                  route: AppConstants.routeSettings,
                  currentRoute: currentRoute,
                ),
                _buildNavItem(
                  context,
                  icon: Icons.card_membership,
                  label: 'Licensing',
                  route: AppConstants.routeLicensing,
                  currentRoute: currentRoute,
                ),
              ],
            ),
          ),
          
          // Bottom section with version info
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              'Version ${AppConstants.appVersion}',
              style: const TextStyle(
                color: AppColors.sidebarTextInactive,
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context, {
    required IconData icon,
    required String label,
    required String route,
    required String currentRoute,
  }) {
    final isSelected = currentRoute == route;
    
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? AppColors.primaryLight : AppColors.sidebarTextInactive,
        size: 22,
      ),
      title: Text(
        label,
        style: TextStyle(
          color: isSelected ? AppColors.sidebarText : AppColors.sidebarTextInactive,
          fontSize: 14,
          fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      selectedTileColor: AppColors.sidebarItemSelected,
      onTap: () {
        if (currentRoute != route) {
          context.go(route);
        }
      },
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
    );
  }

  Widget _buildAppBar(BuildContext context, WidgetRef ref, bool isDarkMode) {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: isDarkMode ? AppColors.surfaceDark : AppColors.surface,
        border: Border(
          bottom: BorderSide(
            color: isDarkMode ? AppColors.borderDark : AppColors.border,
            width: 1,
          ),
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Page title can be added here dynamically
          Expanded(
            child: Text(
              _getPageTitle(GoRouterState.of(context).uri.path),
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w600,
                color: isDarkMode ? AppColors.textPrimary : AppColors.textPrimary,
              ),
            ),
          ),
          
          // Theme toggle button
          IconButton(
            icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode),
            onPressed: () => ref.read(themeModeProvider.notifier).toggle(),
            tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
          ),
          
          const SizedBox(width: 8),
          
          // User profile placeholder
          CircleAvatar(
            backgroundColor: AppColors.primary,
            radius: 20,
            child: const Icon(
              Icons.person,
              color: AppColors.textOnPrimary,
              size: 20,
            ),
          ),
        ],
      ),
    );
  }

  String _getPageTitle(String route) {
    switch (route) {
      case '/':
        return 'Dashboard';
      case '/employees':
        return 'Employee Management';
      case '/attendance':
        return 'Attendance Tracking';
      case '/leave':
        return 'Leave Management';
      case '/departments':
        return 'Departments';
      case '/expenses':
        return 'Expenses';
      case '/reports':
        return 'Reports';
      case '/audit-logs':
        return 'Audit Logs';
      case '/settings':
        return 'Settings';
      case '/licensing':
        return 'Licensing';
      default:
        return 'Restaurant Office Suite';
    }
  }
}
