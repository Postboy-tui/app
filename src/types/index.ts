export interface RequestConfig {
	headers?: Record<string, string> | string;
	body?: string | Record<string, any>;
	error?: string;
	url: string;
	method: 'GET' | 'POST' | 'PUT' | 'DELETE';
	MOCK_URL?: string;
}

export interface ApiResponse {
	status: number;
	data?: any;
	error?: string;
}

export interface MockApi {
	category: 'posts' | 'ecommerce/store' | 'users' | 'comments' | 'todos'
	method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
}

export interface Theme {
	name: string;
	colors: {
		background: string;
		primary: string;
		secondary: string;
		accent: string;
		success: string;
		error: string;
		muted: string;
		white: string;
		cool: string;
	}
}