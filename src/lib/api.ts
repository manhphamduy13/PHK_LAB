class ApiClient {
  private get headers() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async get(url: string) {
    const res = await fetch(`/api${url}`, { headers: this.headers });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  }

  async post(url: string, data?: any) {
    const res = await fetch(`/api${url}`, {
      method: 'POST',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  }

  async put(url: string, data?: any) {
    const res = await fetch(`/api${url}`, {
      method: 'PUT',
      headers: this.headers,
      body: data ? JSON.stringify(data) : undefined
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  }

  async delete(url: string) {
    const res = await fetch(`/api${url}`, {
      method: 'DELETE',
      headers: this.headers
    });
    if (!res.ok) throw new Error(await res.text());
    return { data: await res.json() };
  }
}

const api = new ApiClient();
export default api;
