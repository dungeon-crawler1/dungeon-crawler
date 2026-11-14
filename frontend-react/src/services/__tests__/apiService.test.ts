import { describe, expect, it, vi } from 'vitest';
import request from '../apiService';

function jsonResponse(body: unknown, ok = true): Response {
  return { ok, json: async () => body } as unknown as Response;
}

describe('apiService', () => {
  it('adjunta el token JWT en la cabecera Authorization', async () => {
    localStorage.setItem('jwt_token', 'token-abc');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await request('/test');

    expect(result).toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3000/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer token-abc' }),
      }),
    );
  });

  it('no envía Authorization cuando no hay token guardado', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    await request('/public');

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.headers).not.toHaveProperty('Authorization');
  });

  it('fusiona cabeceras adicionales con las cabeceras por defecto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: 'ok' }));
    vi.stubGlobal('fetch', fetchMock);

    await request('/custom', { headers: { 'X-Trace': 'trace-1' } });

    const options = fetchMock.mock.calls[0][1] as RequestInit;
    expect(options.headers).toEqual(expect.objectContaining({ 'Content-Type': 'application/json', 'X-Trace': 'trace-1' }));
  });

  it('propaga el mensaje de error devuelto por el servidor', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ message: 'Credenciales inválidas' }, false));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/login')).rejects.toThrow('Credenciales inválidas');
  });

  it('usa un mensaje por defecto cuando el error no trae texto', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, false));
    vi.stubGlobal('fetch', fetchMock);

    await expect(request('/login')).rejects.toThrow('Error en la comunicación con el servidor');
  });
});
