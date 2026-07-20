import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:get_it/get_it.dart';
import 'core/constants/app_constants.dart';
import 'core/theme/app_theme.dart';
import 'presentation/routes/app_router.dart';
import 'presentation/providers/theme_provider.dart';
import 'presentation/widgets/app_shell.dart';

final getIt = GetIt.instance;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Set preferred orientations for desktop
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeLeft,
    DeviceOrientation.landscapeRight,
  ]);
  
  // Initialize dependencies
  await _initializeDependencies();
  
  runApp(const ProviderScope(child: RestaurantOfficeSuiteApp()));
}

Future<void> _initializeDependencies() async {
  // Register your services, repositories, and use cases here
  // Example:
  // final database = AppDatabase();
  // getIt.registerLazySingleton<AppDatabase>(() => database);
  // getIt.registerLazySingleton<EmployeeRepository>(() => EmployeeRepositoryImpl(database));
  // getIt.registerLazySingleton<EmployeeService>(() => EmployeeService(getIt<EmployeeRepository>()));
}

class RestaurantOfficeSuiteApp extends ConsumerWidget {
  const RestaurantOfficeSuiteApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isDarkMode = ref.watch(themeModeProvider);
    
    return MaterialApp.router(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: isDarkMode ? ThemeMode.dark : ThemeMode.light,
      routerConfig: appRouter,
      builder: (context, child) {
        return AppShell(child: child ?? const SizedBox.shrink());
      },
    );
  }
}
