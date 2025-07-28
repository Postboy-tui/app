import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { type RequestConfig } from '../types';

// data structure for history entries
interface HistoryEntry extends RequestConfig {
	timestamp: number;
	responseStatus?: number;
	responseTime?: number;
}

interface HistoryData {
	entries: HistoryEntry[];
	lastUpdated: number;
}

export class HistoryManager {
	private historyFile: string;

	constructor() {
		// Set up file path in user's home directory
		const homeDir = os.homedir();
		const configDir = path.join(homeDir, '.postboy');
		this.historyFile = path.join(configDir, 'history.json');
	}

	async ensureConfigDir(): Promise<void> {
		const configDir = path.dirname(this.historyFile);

		try {
			await fs.access(configDir);
			return;
		}
		catch (e: any) {
			if (e.code === 'ENOENT') {
				await fs.mkdir(configDir, { recursive: true });
			}
			else {
				throw e;
			}
		}
	}

	// load existing history from the file
	async loadHistory(): Promise<HistoryData> {
		try {
			await this.ensureConfigDir();
			
			try {
				await fs.access(this.historyFile);
			} catch (e: any) {
				if (e.code === 'ENOENT') {
					// Create empty history file if it doesn't exist
					const emptyHistory: HistoryData = {
						entries: [],
						lastUpdated: Date.now()
					};
					await this.saveHistory(emptyHistory);
					return emptyHistory;
				}
				throw e;
			}

			const data = await fs.readFile(this.historyFile, 'utf-8');
			try {
				const parsedData = JSON.parse(data);
				return {
					entries: Array.isArray(parsedData.entries) ? parsedData.entries : [],
					lastUpdated: parsedData.lastUpdated || Date.now()
				};
			} catch (e) {
				// Handle corrupted JSON file
				const emptyHistory: HistoryData = {
					entries: [],
					lastUpdated: Date.now()
				};
				await this.saveHistory(emptyHistory);
				return emptyHistory;
			}
		}
		catch (e: any) {
			console.error('Failed to load history:', e);
			return {
				entries: [],
				lastUpdated: Date.now()
			};
		}
	}

	// receive history data and save it
	async saveHistory(history: HistoryData): Promise<void> {

		await this.ensureConfigDir();
		await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));

	}

	// add a new entry to the top of history and call saveHistory to save it
	async addEntry(request: RequestConfig, responseStatus?: number, responseTime?: number): Promise<void> {
		await this.ensureConfigDir();
		const history = await this.loadHistory();

		const entry: HistoryEntry = {
			...request,
			timestamp: Date.now(),
			responseStatus,
			responseTime
		};

		// Remove the previous entry with the same URL and method
		history.entries = history.entries.filter(e => !(e.url === request.url && e.method === request.method));

		// Add the new entry at the beginning
		history.entries.unshift(entry);

		// Keep only the last 5 entries to prevent the history file from growing too large
		history.entries = history.entries.slice(0, 5);

		history.lastUpdated = Date.now();
		await this.saveHistory(history);
	}
}

export const historyManager = new HistoryManager();
