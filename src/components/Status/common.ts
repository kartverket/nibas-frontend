export type StatusStyle = {
  icon: string;
  foreground: string;
  background: string;
  shadow: string;
};

export type Status = "error" | "warning" | "info" | "success";

export const statusStyles: Record<Status, StatusStyle> = {
  error: {
    icon: "dangerous",
    background: "var(--pink)",
    foreground: "var(--red_error_message)",
    shadow: "rgba(163, 47, 0, 0.2)",
  },
  warning: {
    icon: "emergency_home",
    background: "var(--yellow_light)",
    foreground: "var(--yellow_darker)",
    shadow: "rgba(255, 205, 41, 0.2)",
  },
  info: {
    icon: "help",
    background: "var(--blue_light)",
    foreground: "var(--blue_dark)",
    shadow: "rgba(26, 88, 159, 0.2)",
  },
  success: {
    icon: "check_circle",
    background: "var(--green_light)",
    foreground: "var(--green_dark)",
    shadow: "rgba(122, 210, 150, 0.2)",
  },
};
