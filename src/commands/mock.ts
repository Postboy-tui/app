import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger, SUBTITLE, WELCOME_MESSAGE } from '../utils/logger';
import type { MockApi } from '../types';

export async function mockApis(): Promise<void> {

	logger.title(WELCOME_MESSAGE);
	logger.info(SUBTITLE);
	const post: { url: string, method: string }[] = [{ url: 'https://jsonplaceholder.typicode.com/posts', method: 'GET' }]

	const store: { url: string, method: string }[] = [{ url: 'https://fakestoreapi.com/products', method: 'GET' }]


// Mock API endpoints for various categories
// (use let to avoid redeclaration on hot reloads)
// Use globalThis to avoid redeclaration errors in hot reload/dev
if (!(globalThis as any)._postboyMocks) {
	(globalThis as any)._postboyMocks = {};
}
const _mocks = (globalThis as any)._postboyMocks;

_mocks.users = [
	{ url: 'https://jsonplaceholder.typicode.com/users', method: 'GET' },
	{ url: 'https://reqres.in/api/users', method: 'GET' },
	{ url: 'https://randomuser.me/api/', method: 'GET' },
];

_mocks.comments = [
	{ url: 'https://jsonplaceholder.typicode.com/comments', method: 'GET' },
	{ url: 'https://jsonplaceholder.typicode.com/comments/1', method: 'GET' },
];

_mocks.todos = [
	{ url: 'https://jsonplaceholder.typicode.com/todos', method: 'GET' },
	{ url: 'https://jsonplaceholder.typicode.com/todos/1', method: 'GET' },
];

_mocks.weather = [
	{ url: 'https://api.open-meteo.com/v1/forecast?latitude=35&longitude=139&hourly=temperature_2m', method: 'GET' },
	{ url: 'https://api.weatherapi.com/v1/current.json?key=demo&q=London', method: 'GET' },
];

_mocks.books = [
	{ url: 'https://openlibrary.org/works/OL45883W.json', method: 'GET' },
	{ url: 'https://gutendex.com/books', method: 'GET' },
];

_mocks.animals = [
	{ url: 'https://dog.ceo/api/breeds/image/random', method: 'GET' },
	{ url: 'https://catfact.ninja/fact', method: 'GET' },
];

	const answers = await inquirer.prompt([
		{
			type: 'list',
			name: 'category',
			message: chalk.green('Select categories :'),
			choices: [
				'posts',
				'ecommerce/store',
				'users',
				'comments',
				'todos',
				'weather',
				'books',
				'animals',
			],
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
			case 'posts': _mocks.post.map((p: any) => logger.info(p.url) + '\n'); break;
			case 'ecommerce/store': _mocks.store.map((s: any) => logger.info(s.url) + '\n'); break;
			case 'users': _mocks.users.map((u: any) => logger.info(u.url) + '\n'); break;
			case 'comments': _mocks.comments.map((c: any) => logger.info(c.url) + '\n'); break;
			case 'todos': _mocks.todos.map((t: any) => logger.info(t.url) + '\n'); break;
			default:
				if (answers.category === 'weather') _mocks.weather.map((w: any) => logger.info(w.url) + '\n');
				else if (answers.category === 'books') _mocks.books.map((b: any) => logger.info(b.url) + '\n');
				else if (answers.category === 'animals') _mocks.animals.map((a: any) => logger.info(a.url) + '\n');
				break;
		}
		logger.warning('adjust id numbers in request url to avoid getting bulk responses')
	} catch (err) {
	}
}
