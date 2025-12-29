import http from 'http';
import https from 'https';
import { URL } from 'url';

export interface RequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export function sendRequest({ method, url, headers = {}, body }: RequestOptions): Promise<{
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const options: http.RequestOptions = {
      method,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers,
    };
    const reqModule = isHttps ? https : http;
    const req = reqModule.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode || 0,
            statusText: res.statusMessage || '',
            headers: Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : (v || '')])),
            body: data,
          });
        } catch (err) {
          reject(err);
        }
      });
    });
    req.on('error', reject);
    if (body) {
      try {
        req.write(body);
      } catch (err) {
        reject(err);
      }
    }
    req.end();
  });
}
