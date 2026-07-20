import 'package:flutter/material.dart';
import '../widgets/placeholder_screen.dart';

/// Leave management screen
class LeaveScreen extends StatelessWidget {
  const LeaveScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Leave Management',
      icon: Icons.beach_access,
    );
  }
}
