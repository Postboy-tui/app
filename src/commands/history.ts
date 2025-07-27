import inquirer from 'inquirer';
import chalk from 'chalk';
import { historyManager } from '../utils/history';
import { logger } from '../utils/logger';

export async function historyCommand(): Promise<void> {
    const history = await historyManager.loadHistory();
    
    if (history.entries.length === 0) {
        logger.warning('No history found. Make some API requests first!');
        return;
    }
    
    logger.title('Recent API Requests:');
    history.entries.forEach((entry, index) => {
        const date = new Date(entry.timestamp).toLocaleString();
        const url = entry.url || entry.MOCK_URL || 'N/A';
        const status = entry.responseStatus ? 
            chalk.green(entry.responseStatus.toString()) : 
            chalk.red('Failed');
        
        console.log(chalk.cyan(`${index + 1}. ${entry.method} ${url}`));
        console.log(`   📅 ${date} | Status: ${status} | Time: ${entry.responseTime}ms`);
    });
}
