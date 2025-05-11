//export const host = "https://crex-gclass-backend-29d64edfb6e9.herokuapp.com";
export const host = "http://127.0.0.1:8000";
export function getJwtToken() {
  return sessionStorage.getItem("jwtToken");
}
