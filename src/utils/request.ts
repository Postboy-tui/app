import http from 'http';
import https from 'https';
import { URL } from 'url';
import type { PerformanceMetrics } from '../types';

export interface RequestOptions {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: string;
}

export interface RequestResult {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  metrics: PerformanceMetrics;
}

export function sendRequest({ method, url, headers = {}, body }: RequestOptions): Promise<RequestResult> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    
    const timings = {
      start: performance.now(),
      dnsLookup: 0,
      tcpConnection: 0,
      tlsHandshake: 0,
      ttfb: 0,
      end: 0,
    };

    const options: http.RequestOptions = {
      method,
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      headers,
    };

    const reqModule = isHttps ? https : http;
    
    const req = reqModule.request(options, (res) => {
      timings.ttfb = performance.now();
      let data = '';
      
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        timings.end = performance.now();
        
        const contentLength = parseInt(res.headers['content-length'] || '0', 10) || Buffer.byteLength(data, 'utf8');
        
        const metrics: PerformanceMetrics = {
          dnsLookup: timings.dnsLookup - timings.start,
          tcpConnection: timings.tcpConnection - timings.dnsLookup,
          tlsHandshake: isHttps ? timings.tlsHandshake - timings.tcpConnection : 0,
          ttfb: timings.ttfb - timings.start,
          contentDownload: timings.end - timings.ttfb,
          total: timings.end - timings.start,
          contentLength,
        };

        resolve({
          status: res.statusCode || 0,
          statusText: res.statusMessage || '',
          headers: Object.fromEntries(Object.entries(res.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(', ') : (v || '')])),
          body: data,
          metrics,
        });
      });
    });

    req.on('socket', (socket) => {
      socket.on('lookup', () => {
        timings.dnsLookup = performance.now();
      });
      socket.on('connect', () => {
        timings.tcpConnection = performance.now();
      });
      socket.on('secureConnect', () => {
        timings.tlsHandshake = performance.now();
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
