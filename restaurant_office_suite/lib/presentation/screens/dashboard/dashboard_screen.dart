import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/constants/app_colors.dart';
import '../../presentation/providers/database_provider.dart';

/// Dashboard screen with statistics cards and charts
class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);

    return Container(
      color: Theme.of(context).scaffoldBackgroundColor,
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Welcome header
          Text(
            'Welcome to Restaurant Office Suite',
            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Manage your restaurant staff, attendance, payroll, and more from one place.',
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          
          const SizedBox(height: 32),
          
          // Statistics Cards
          statsAsync.when(
            data: (stats) => Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        _buildStatCard(
                          context,
                          title: 'Total Employees',
                          value: '${stats.totalEmployees}',
                          icon: Icons.people,
                          color: AppColors.primary,
                        ),
                        const SizedBox(width: 16),
                        _buildStatCard(
                          context,
                          title: 'Present Today',
                          value: '${stats.presentToday}',
                          icon: Icons.check_circle,
                          color: AppColors.success,
                        ),
                        const SizedBox(width: 16),
                        _buildStatCard(
                          context,
                          title: 'Pending Leaves',
                          value: '${stats.pendingLeaves}',
                          icon: Icons.beach_access,
                          color: AppColors.warning,
                        ),
                        const SizedBox(width: 16),
                        _buildStatCard(
                          context,
                          title: 'Total Expenses',
                          value: '\$${stats.totalExpenses.toStringAsFixed(2)}',
                          icon: Icons.receipt_long,
                          color: AppColors.error,
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Charts placeholder
                    Row(
                      children: [
                        Expanded(
                          child: _buildChartCard(
                            context,
                            title: 'Attendance Overview',
                            child: Center(
                              child: Text(
                                'Attendance Chart\n(fl_chart integration)',
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: _buildChartCard(
                            context,
                            title: 'Expense Trends',
                            child: Center(
                              child: Text(
                                'Expense Chart\n(fl_chart integration)',
                                textAlign: TextAlign.center,
                                style: Theme.of(context).textTheme.bodyMedium,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 32),
                    
                    // Recent Activity placeholder
                    _buildChartCard(
                      context,
                      title: 'Recent Activity',
                      child: ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: 5,
                        itemBuilder: (context, index) {
                          return ListTile(
                            leading: CircleAvatar(
                              backgroundColor: AppColors.primary.withOpacity(0.1),
                              child: Icon(
                                Icons.notifications,
                                size: 20,
                                color: AppColors.primary,
                              ),
                            ),
                            title: Text('Activity item ${index + 1}'),
                            subtitle: Text('Description of the activity'),
                            trailing: Text(
                              '${index + 1}h ago',
                              style: Theme.of(context).textTheme.bodySmall,
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (error, stack) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 48, color: AppColors.error),
                  const SizedBox(height: 16),
                  Text('Error loading dashboard: $error'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => ref.invalidate(dashboardStatsProvider),
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(
    BuildContext context, {
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Expanded(
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      value,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChartCard(
    BuildContext context, {
    required String title,
    required Widget child,
  }) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 250,
              child: child,
            ),
          ],
        ),
      ),
    );
  }
}
