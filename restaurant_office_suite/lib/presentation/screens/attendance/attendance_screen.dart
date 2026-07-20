import 'package:flutter/material.dart';
import '../widgets/placeholder_screen.dart';

/// Attendance tracking screen
class AttendanceScreen extends StatelessWidget {
  const AttendanceScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Attendance Tracking',
      icon: Icons.access_time,
    );
  }
}
