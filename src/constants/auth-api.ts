/** Django DRF v1 auth endpoints (relative to HMIS_API_URL, server-only). */
export const AUTH_API_PATHS = {
  signinRequestOtp: "/auth/signin/request-otp/",
  signinVerify: "/auth/signin/verify/",
  signupRequestOtp: "/auth/signup/request-otp/",
  signupVerifyEmail: "/auth/signup/verify-email/",
  signupVerify: "/auth/signup/verify/",
  tokenRefresh: "/auth/token/refresh/",
  logout: "/auth/logout/",
  me: "/users/me/",
  userDetail: (userId: number) => `/users/${userId}/`,
} as const;
