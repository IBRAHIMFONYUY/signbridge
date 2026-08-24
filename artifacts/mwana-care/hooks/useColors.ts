import { useMwana } from "@/context/MwanaContext";
import colors from "@/constants/colors";

/**
 * Returns the active color palette driven by the in-app darkMode setting
 * (from MwanaContext) rather than the OS color scheme.
 */
export function useColors() {
  const { settings } = useMwana();
  const palette =
    settings.darkMode && "dark" in colors
      ? (colors as Record<string, typeof colors.light>).dark
      : colors.light;
  return { ...palette, radius: colors.radius };
}
