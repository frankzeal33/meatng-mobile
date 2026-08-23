import { useAuthStore } from "@/store/AuthStore";
import { useProfileStore } from "@/store/ProfileStore";
import axios from "axios";
import { router } from "expo-router";

const mobileHeaders = {
  "x-client-type": "mobile",
  "x-mobile-app-key": process.env.EXPO_PUBLIC_MOBILE_APP_KEY,
};

const axiosClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_SERVER_URI,
  withCredentials: true,
  headers: mobileHeaders,
});

axiosClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().token;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

const clearSession = async () => {
  await Promise.all([
    useAuthStore.getState().logout(),
    useProfileStore.getState().clearProfile(),
  ]);
  router.replace("/(onboarding)/Login");
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const shouldRefresh =
      status === 401 &&
      (message === "Invalid access token" ||
        message === "Access token is required" ||
        message === "Invalid or expired access token") &&
      originalRequest &&
      !originalRequest._retry;

    if (shouldRefresh) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token is available.");
        }

        const response = await axios.post(
          `${process.env.EXPO_PUBLIC_SERVER_URI}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true, headers: mobileHeaders },
        );

        const responseData = response.data;
        const tokenData = responseData?.data?.attributes?.token
        const accessToken = tokenData?.accessToken;
        const newRefreshToken = tokenData?.refreshToken;

        if (!accessToken) {
          throw new Error("The refreshed access token was not returned.");
        }

        await useAuthStore
          .getState()
          .login(accessToken, newRefreshToken ?? undefined);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        await clearSession();
        return Promise.reject(refreshError);
      }
    }

    const shouldLogout =
      status === 401 &&
      (message === "Invalid or expired token" ||
        message === "Access token is required" ||
        message === "Invalid or expired access token");

    if (shouldLogout) {
      await clearSession();
    }

    return Promise.reject(error);
  },
);

export { axiosClient };
