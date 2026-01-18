const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000';
const apiBase = `${baseUrl}/api/v1`;

export async function apiFetch(path, options = {}) {
  return fetch(`${apiBase}${path}`, {
    credentials: 'include',
    ...options,
  });
}

export async function fetchApi(endpoint, options = {}) {
  const url = `${apiBase}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

export async function getHealthStatus() {
  try {
    return await fetchApi('/info');
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

export async function getSupabaseUsers(token, params = {}) {
  const searchParams = new URLSearchParams();

  if (params.page) {
    searchParams.set('page', String(params.page));
  }

  if (params.perPage) {
    searchParams.set('per_page', String(params.perPage));
  }

  const query = searchParams.toString();
  const endpoint = query ? `/supabase/users?${query}` : '/supabase/users';

  return fetchApi(endpoint, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}

export async function getApiKey(username, password) {
  return fetchApi('/auth/api-key', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  });
}
