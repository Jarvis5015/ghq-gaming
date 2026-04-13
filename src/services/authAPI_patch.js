export const authAPI = {
  register:   (body)    => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:      (body)    => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  getMe:      ()        => request('/auth/me'),
  googleAuth: (idToken) => request('/auth/google',   { method: 'POST', body: JSON.stringify({ idToken }) }),
}
