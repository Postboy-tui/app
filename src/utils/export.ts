import { writeFile, mkdir } from 'fs';
import { spawn } from 'child_process';
import { promisify } from 'util';
import { dirname } from 'path';

const writeFileAsync = promisify(writeFile);
const mkdirAsync = promisify(mkdir);

interface RequestData {
	method: string;
	url: string;
	headers: string;
	body: string;
}

export const toCurl = (request: RequestData): string => {
	const parts: string[] = ['curl'];
	parts.push(`-X ${request.method}`);
	parts.push(`'${request.url}'`);

	try {
		const headers = JSON.parse(request.headers || '{}');
		Object.entries(headers).forEach(([key, value]) => {
			parts.push(`-H '${key}: ${value}'`);
		});
	} catch {}

	if (request.body && request.method !== 'GET') {
		parts.push(`-d '${request.body}'`);
	}

	return parts.join(' \\\n  ');
};

export const toFetch = (request: RequestData): string => {
	const options: Record<string, any> = {
		method: request.method,
	};

	try {
		const headers = JSON.parse(request.headers || '{}');
		if (Object.keys(headers).length > 0) {
			options.headers = headers;
		}
	} catch {}

	if (request.body && request.method !== 'GET') {
		options.body = request.body;
	}

	const optionsStr = JSON.stringify(options, null, 2);
	return `fetch('${request.url}', ${optionsStr})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
	return new Promise((resolve) => {
		const platform = process.platform;
		const clipboardCmds = platform === 'darwin' 
			? [{ cmd: 'pbcopy', args: [] as string[] }]
			: platform === 'win32'
				? [{ cmd: 'clip', args: [] as string[] }]
				: [
					{ cmd: 'wl-copy', args: [] as string[] },
					{ cmd: 'xclip', args: ['-selection', 'clipboard'] },
					{ cmd: 'xsel', args: ['--clipboard', '--input'] }
				];

		const tryClipboard = (index: number) => {
			if (index >= clipboardCmds.length) {
				resolve(false);
				return;
			}

			const item = clipboardCmds[index]!;
			try {
				const proc = spawn(item.cmd, item.args, { stdio: ['pipe', 'ignore', 'ignore'] });
				proc.stdin.write(text);
				proc.stdin.end();
				proc.on('close', (code) => {
					if (code === 0) {
						resolve(true);
					} else {
						tryClipboard(index + 1);
					}
				});
				proc.on('error', () => tryClipboard(index + 1));
			} catch {
				tryClipboard(index + 1);
			}
		};

		tryClipboard(0);
	});
};

export const saveToFile = async (content: string, filePath: string): Promise<boolean> => {
	try {
		const dir = dirname(filePath);
		await mkdirAsync(dir, { recursive: true });
		await writeFileAsync(filePath, content, 'utf-8');
		return true;
	} catch {
		return false;
	}
};
