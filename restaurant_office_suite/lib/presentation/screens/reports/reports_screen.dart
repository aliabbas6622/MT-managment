import 'package:flutter/material.dart';
import '../widgets/placeholder_screen.dart';

/// Reports screen
class ReportsScreen extends StatelessWidget {
  const ReportsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Reports',
      icon: Icons.assessment,
    );
  }
}
