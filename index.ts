import { Command } from 'commander';
import sendCommand from './src/commands/send';

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

const program = new Command();

program
  .name('api-tester')
  .description('A CLI alternative to Postman/Insomnia for quick API testing')
  .version('1.0.0');

program
  .command('send <method> <url>')
  .description('Send an HTTP request')
  .option('-H, --header <header...>', 'Add request headers (e.g., -H "Key: Value")')
  .option('-d, --data <data>', 'Request body data (for POST/PUT)')
  .action((method: string, url: string, options: any) => {
    const headers = options.header || [];
    const data = options.data;
    sendCommand({
      method,
      url,
      headers: parseHeaders(headers),
      data
    });
  });

program.parse(process.argv); 