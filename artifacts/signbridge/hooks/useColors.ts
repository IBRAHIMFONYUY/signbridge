import { useApp } from "@/context/AppContext";
import colors from "@/constants/colors";

/**
 * Returns the active color palette driven by the in-app darkMode setting
 * (from AppContext) rather than the OS color scheme. This lets the Settings
 * toggle take immediate effect everywhere without restarting the app.
 */
export function useColors() {
  const { settings } = useApp();
  const palette =
    settings.darkMode && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
