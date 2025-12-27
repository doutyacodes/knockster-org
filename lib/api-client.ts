export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('knockster_token');

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Request failed');
  }

  return data.data;
}

export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint),

  post: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, {
      method: 'DELETE',
    }),
};
