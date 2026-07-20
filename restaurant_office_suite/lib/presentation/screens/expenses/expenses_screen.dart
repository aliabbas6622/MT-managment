import 'package:flutter/material.dart';
import '../widgets/placeholder_screen.dart';

/// Expenses management screen
class ExpensesScreen extends StatelessWidget {
  const ExpensesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const PlaceholderScreen(
      title: 'Expenses',
      icon: Icons.receipt_long,
    );
  }
}
