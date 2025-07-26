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
