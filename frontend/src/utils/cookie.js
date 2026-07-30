import Cookies from 'js-cookie';

const TOKEN_KEY = 'userToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_ROLE_KEY = 'userRole';

export const setToken = (token) => {
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
};

export const getToken = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken = () => {
  Cookies.remove(TOKEN_KEY);
};

export const setRefreshToken = (token) => {
  Cookies.set(REFRESH_TOKEN_KEY, token, { expires: 30, secure: true, sameSite: 'strict' });
};

export const getRefreshToken = () => {
  return Cookies.get(REFRESH_TOKEN_KEY);
};

export const removeRefreshToken = () => {
  Cookies.remove(REFRESH_TOKEN_KEY);
};

export const setRole = (role) => {
  Cookies.set(USER_ROLE_KEY, role, { expires: 7, secure: true, sameSite: 'strict' });
};

export const getRole = () => {
  return Cookies.get(USER_ROLE_KEY);
};

export const removeRole = () => {
  Cookies.remove(USER_ROLE_KEY);
};

export const clearAuth = () => {
  removeToken();
  removeRefreshToken();
  removeRole();
};
