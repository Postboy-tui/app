export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export interface ApiResponse {
  status: number;
  data?: any;
  error?: string;
}