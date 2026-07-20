import 'package:flutter/material.dart';
import '../widgets/placeholder_screen.dart';

/// Employees management screen
class EmployeesScreen extends StatelessWidget {
  const EmployeesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Employee Management',
      icon: Icons.people,
    );
  }
}
