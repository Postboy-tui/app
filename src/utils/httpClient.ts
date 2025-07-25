import fetch from 'node-fetch';

interface HttpClientArgs {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: any;
}

interface HttpClientResponse {
  status: number;
  headers: Record<string, string>;
  data: any;
}

async function httpClient({ method, url, headers, data }: HttpClientArgs): Promise<HttpClientResponse> {
  const options: any = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  };
  const response = await fetch(url, options);
  const status = response.status;
  const plainHeaders = Object.fromEntries(response.headers.entries());
  const contentType = response.headers.get('content-type');
  let parsedData: any;
  if (contentType && contentType.includes('application/json')) {
    parsedData = await response.json();
  } else {
    parsedData = await response.text();
  }
  return {
    status,
    headers: plainHeaders,
    data: parsedData
  };
}

export default httpClient; 