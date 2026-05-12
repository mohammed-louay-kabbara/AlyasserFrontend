const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds
const LOGIN_TIMESTAMP_KEY = "auth_login_timestamp";

/**
 * Saves the login timestamp to localStorage
 */
export const saveLoginTimestamp = (): void => {
  localStorage.setItem(LOGIN_TIMESTAMP_KEY, Date.now().toString());
};

/**
 * Gets the login timestamp from localStorage
 */
export const getLoginTimestamp = (): number | null => {
  const timestamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);
  return timestamp ? parseInt(timestamp, 10) : null;
};

/**
 * Clears the login timestamp from localStorage
 */
export const clearLoginTimestamp = (): void => {
  localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
};

/**
 * Checks if the session has expired
 * Returns true if session is expired, false otherwise
 */
export const isSessionExpired = (): boolean => {
  const loginTimestamp = getLoginTimestamp();
  if (!loginTimestamp) return true;

  const currentTime = Date.now();
  const elapsed = currentTime - loginTimestamp;
  return elapsed >= SESSION_DURATION_MS;
};

/**
 * Gets the remaining session time in milliseconds
 * Returns 0 if session is expired or no timestamp exists
 */
export const getRemainingSessionTime = (): number => {
  const loginTimestamp = getLoginTimestamp();
  if (!loginTimestamp) return 0;

  const currentTime = Date.now();
  const elapsed = currentTime - loginTimestamp;
  const remaining = SESSION_DURATION_MS - elapsed;
  return remaining > 0 ? remaining : 0;
};

/**
 * Checks session expiration and performs auto-logout if expired
 * Returns true if session is valid, false if expired and logged out
 */
export const checkSessionExpiration = (): boolean => {
  if (isSessionExpired()) {
    clearAuthData();
    return false;
  }
  return true;
};

/**
 * Clears all auth data from localStorage
 * This should be called when session expires
 * Note: Does not perform redirect - caller should handle navigation
 */
export const clearAuthData = (): void => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  clearLoginTimestamp();
};
