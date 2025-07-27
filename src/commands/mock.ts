import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger';
import type { MockApi } from '../types';

export async function mockApis(): Promise<void> {


	const post: { url: string, method: string }[] = [{ url: 'https://jsonplaceholder.typicode.com/posts', method: 'GET' }]

	const store: { url: string, method: string }[] = [{ url: 'https://fakestoreapi.com/products', method: 'GET' }]


	const users: { url: string, method: string }[] = [{ url: 'https://jsonplaceholder.typicode.com/users', method: 'GET' }]

	const comments: { url: string, method: string }[] = [{ url: 'https://jsonplaceholder.typicode.com/comments', method: 'GET' }]


	const todos: { url: string, method: string }[] = [{ url: 'https://jsonplaceholder.typicode.com/todos', method: 'GET' }]


	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'category',
			message: chalk.green('Select categories :'),
			choices: ['posts', 'ecommerce/store', 'users', 'comments', 'todos']
		},

		{
			type: 'list',
			name: 'method',
			message: chalk.green('Select HTTP method:'),
			choices: ['GET', 'POST', 'PUT', 'DELETE']
		},
	]) as MockApi;

	logger.title(`here is the list of mock urls for ${answers.method} method: \n`);

	try {
		switch (answers.category) {
			case 'posts': post.map(p => logger.info
				(p.url) + '\n')
				break
			case 'ecommerce/store': store.map(s => logger.info
				(s.url) + '\n')
				break
			case 'users': users.map(u => logger.info
				(u.url) + '\n')
				break
			case 'comments': comments.map(c => logger.info
				(c.url) + '\n')
				break
			case 'todos': todos.map(t => logger.info
				(t.url) + '\n')
				break
		}
		logger.warning('adjust id numbers in request payload to avoid getting bulk responses')
	} catch (err) {
	}
}
