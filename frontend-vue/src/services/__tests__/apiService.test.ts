import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from '../apiService';

const fetchMock = vi.fn();
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

describe('apiService.request', () => {
  beforeEach(() => {
    storage.clear();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('localStorage', localStorageMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('realiza la petición con la URL base y sin cabecera de autorización', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ status: 'ok' }) });

    const result = await request('/users/profile', { method: 'GET' });

    expect(result).toEqual({ status: 'ok' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:3000/api/users/profile');
    expect(init.method).toBe('GET');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
  });

  it('inyecta el token JWT almacenado en localStorage', async () => {
    localStorage.setItem('jwt_token', 'jwt-abc');
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ status: 'ok' }) });

    await request('/auth/login', { method: 'POST', body: '{"email":"a@b.c"}' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer jwt-abc');
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('conserva las cabeceras personalizadas y el cuerpo de la petición', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: () => Promise.resolve({ ok: true }) });

    await request('/custom', { method: 'POST', headers: { 'X-Trace': 'abc' }, body: '{a:1}' });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.headers).toEqual({ 'Content-Type': 'application/json', 'X-Trace': 'abc' });
    expect(init.body).toBe('{a:1}');
  });

  it('lanza el mensaje del servidor cuando la respuesta no es exitosa', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: 'Credenciales inválidas' }),
    });

    await expect(request('/auth/login')).rejects.toThrow('Credenciales inválidas');
  });

  it('usa el mensaje por defecto cuando la respuesta falla sin message', async () => {
    fetchMock.mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    await expect(request('/auth/login')).rejects.toThrow(
      'Error en la comunicación con el servidor',
    );
  });
});
