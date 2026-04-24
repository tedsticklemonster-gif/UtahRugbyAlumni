export const haptics = {
  light:   () => navigator.vibrate?.(8),
  medium:  () => navigator.vibrate?.(20),
  success: () => navigator.vibrate?.([10, 50, 10]),
};
