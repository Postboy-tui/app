export interface RequestConfig {
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
