import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/database/app_database.dart';

/// Provider for the database instance
final databaseProvider = Provider<AppDatabase>((ref) {
  return AppDatabase();
});

/// Provider for dashboard statistics
final dashboardStatsProvider = FutureProvider.autoDispose((ref) async {
  final db = ref.watch(databaseProvider);
  return db.getDashboardStats();
});

/// Provider to check if premium features are enabled
final isPremiumProvider = FutureProvider.autoDispose((ref) async {
  final db = ref.watch(databaseProvider);
  return db.isPremiumEnabled();
});
