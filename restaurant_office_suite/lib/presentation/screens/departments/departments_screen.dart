import 'package:flutter/material.dart';
import '../widgets/placeholder_screen.dart';

/// Departments management screen
class DepartmentsScreen extends StatelessWidget {
  const DepartmentsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Departments',
      icon: Icons.business,
    );
  }
}
