export async function apiFetch(path, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
  return fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    ...options,
  });
}
