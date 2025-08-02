function validateCookieName(name) {
  const dangerousChars = /[;,\s"\\]/;
  return !dangerousChars.test(name) && name.length <= 4096;
}
function validateCookieValue(value) {
  const dangerousChars = /[;\s"\\]/;
  return !dangerousChars.test(value) && value.length <= 4096;
}
function sanitizeCookies(cookies) {
  const cookiePairs = cookies.split(";");
  const validCookies = [];
  for (const pair of cookiePairs) {
    const [name, ...valueParts] = pair.trim().split("=");
    const value = valueParts.join("=");
    if (name && validateCookieName(name)) {
      if (!value || validateCookieValue(value)) {
        validCookies.push(`${name}=${value || ""}`);
      }
    }
  }
  return validCookies.join("; ");
}
const securityHeaders = {
  // Prevenir clickjacking
  "X-Frame-Options": "DENY",
  // Prevenir MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Control de referrer
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' ws: wss:",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join("; "),
  // Permissions Policy (anteriormente Feature-Policy)
  "Permissions-Policy": [
    "geolocation=()",
    "camera=()",
    "microphone=()",
    "payment=()",
    "usb=()",
    "magnetometer=()",
    "gyroscope=()",
    "accelerometer=()",
    "ambient-light-sensor=()",
    "autoplay=()",
    "encrypted-media=()",
    "picture-in-picture=()",
    "publickey-credentials-get=()",
    "screen-wake-lock=()",
    "xr-spatial-tracking=()"
  ].join(", "),
  // XSS Protection (legacy pero aún útil)
  "X-XSS-Protection": "1; mode=block",
  // Strict Transport Security (para HTTPS)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Cache Control para recursos sensibles
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0"
};
const handle = async ({ event, resolve }) => {
  const cookieHeader = event.request.headers.get("cookie");
  if (cookieHeader) {
    const sanitizedCookies = sanitizeCookies(cookieHeader);
    event.request.headers.set("cookie", sanitizedCookies);
  }
  const response = await resolve(event);
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  if (event.url.pathname.startsWith("/api/")) {
    response.headers.set("Access-Control-Allow-Origin", event.url.origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    response.headers.set("Access-Control-Max-Age", "86400");
  }
  return response;
};
export {
  handle
};
