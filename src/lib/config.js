export const appConfig = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  jwtCookieName: process.env.JWT_COOKIE_NAME,
};
