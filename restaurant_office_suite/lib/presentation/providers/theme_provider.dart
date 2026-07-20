import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Theme mode provider for light/dark theme switching
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, bool>((ref) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<bool> {
  ThemeModeNotifier() : super(false); // false = light, true = dark

  void toggle() {
    state = !state;
  }

  void setDarkMode(bool isDark) {
    state = isDark;
  }
}
