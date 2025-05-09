import useSWR from "swr";
import { AuthConfig } from "types/api";

const isLocalhost = () => {
  const { hostname } = window.location;
  return hostname.includes("localhost") || hostname.includes("127.0.0.1");
};

export const isAuthEnabled = () => {
  return !isAuthDisabled();
};

export const isAuthDisabled = () => {
  return isLocalhost() && import.meta.env["VITE_DISABLE_AUTH"] === "true";
};

const authConfigFetcher = async (url: "v1/auth/config"): Promise<AuthConfig> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`Error fetching auth config: ${error}`);
  }
};

export const useAuthenticationConfig = () => {
  const { data: authConfig } = useSWR("v1/auth/config", authConfigFetcher);

  return authConfig;
};
