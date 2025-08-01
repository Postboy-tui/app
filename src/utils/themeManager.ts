import { promises as fs } from 'fs';
import path from 'path';
import os from 'os'
import type { Theme } from '../types';
export class ThemeManager {
	private themeFile: string;

	constructor() {
		// Set up file path in user's home directory
		const homeDir = os.homedir();
		const configDir = path.join(homeDir, '.postboy');
		this.themeFile = path.join(configDir, 'theme.json');
	}

	async ensureConfigDir(): Promise<void> {
		const configDir = path.dirname(this.themeFile);

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


	async saveTheme(theme: Theme): Promise<void> {

		await this.ensureConfigDir();
		await fs.writeFile(this.themeFile, JSON.stringify(theme, null, 2));

	}

	async loadCurrTheme(): Promise<Theme> {
		try {
			await this.ensureConfigDir();

			try {
				await fs.access(this.themeFile);
			} catch (e: any) {
				if (e.code === 'ENOENT') {
					// Create empty history file if it doesn't exist
					const defaultTheme: Theme = {
						name: 'Tokyo Night',
						colors: {
							background: '#1a1b26',
							primary: '#7aa2f7',
							secondary: '#bb9af7',
							accent: '#2ac3de',
							success: '#9ece6a',
							error: '#f7768e',
							muted: '#565f89',
							white: '#a9b1d6',
							cool: '#7dcfff',
						}

					};
					await this.saveTheme(defaultTheme);
					return defaultTheme;
				}
				throw e;
			}

			const theme = await fs.readFile(this.themeFile, 'utf-8');
			try {
				const parsedTheme: Theme = JSON.parse(theme);
				return parsedTheme
			} catch (e) {
				// Handle corrupted JSON file
				const emptyTheme: Theme = {
					name: '',
					colors: {
						background: '1a1b26',
						primary: '#7aa2f7',
						secondary: '#bb9af7',
						accent: '#2ac3de',
						success: '#9ece6a',
						error: '#f7768e',
						muted: '#565f89',
						white: '#a9b1d6',
						cool: '#7dcfff',
					}
				};
				await this.saveTheme(emptyTheme);
				return emptyTheme;
			}
		}
		catch (e: any) {
			console.error('Failed to load history:', e);
			return {
				name: '',
				colors: {
					background: '1a1b26',
					primary: '#7aa2f7',
					secondary: '#bb9af7',
					accent: '#2ac3de',
					success: '#9ece6a',
					error: '#f7768e',
					muted: '#565f89',
					white: '#a9b1d6',
					cool: '#7dcfff',
				}

			};
		}
	}
	async ChangeTheme(theme: Theme): Promise<void> {
		await this.ensureConfigDir();
		await this.saveTheme(theme);
	}
}

export const themeManager = new ThemeManager();

