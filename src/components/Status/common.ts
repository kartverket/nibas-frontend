export type StatusStyle = {
  icon: string;
  foreground: string;
  background: string;
};

export type Status = "error" | "warning" | "info";

export const statusStyles: Record<Status, StatusStyle> = {
  error: {
    icon: "dangerous",
    background: "var(--pink)",
    foreground: "var(--red_error_message)",
  },
  warning: {
    icon: "emergency_home",
    background: "var(--yellow_light)",
    foreground: "var(--yellow_darker)",
  },
  info: {
    icon: "help",
    background: "var(--blue_light)",
    foreground: "var(--blue_dark)",
  },
};
