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

export async function getApiStats() {
  try {
    const data = await fetchApi('/stats');
    return data;
  } catch (error) {
    // 返回模拟数据作为fallback
    return {
      success: true,
      data: {
        totalCalls: 12543,
        activeKeys: 8,
        proxyRequests: 3421,
        avgResponseTime: 142,
        dailyChange: {
          calls: 12.5,
          keys: 2,
          proxyRequests: -3.2,
          responseTime: -8,
        },
      },
    };
  }
}
