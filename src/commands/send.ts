import httpClient from '../utils/httpClient';


function parseHeaders(headerArgs: string[]): Record<string, string> {
  const headers: Record<string, string> = {};
  if (!headerArgs) return headers;
  headerArgs.forEach(h => {
    const [key, ...rest] = h.split(':');
    if (key && rest.length) {
      headers[key.trim()] = rest.join(':').trim();
    }
  });
  return headers;
}

interface SendCommandArgs {
  method: string;
  url: string;
  headers: Record<string, string>;
  data?: any;
}

async function sendCommand({ method, url, headers, data }: SendCommandArgs): Promise<void> {
  try {
    const response = await httpClient({ method, url, headers, data });
    console.log(`Status: ${response.status}`);
    console.log('Headers:', response.headers);
    console.log('Body:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.error(`Error: ${error.response.status}`);
      console.error('Headers:', error.response.headers);
      console.error('Body:', error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error:', error.message);
    }
  }
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const [method, url, ...rest] = argv;
  let headers: string[] = [];
  let data: any = undefined;
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '-H' || rest[i] === '--header') {
      headers.push(rest[++i]);
    } else if (rest[i] === '-d' || rest[i] === '--data') {
      data = rest[++i];
    }
  }
  sendCommand({
    method,
    url,
    headers: parseHeaders(headers),
    data
  });
}

export default sendCommand; 