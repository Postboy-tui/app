import type { themes } from "../ui/app/themes";

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


export interface FormFieldProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	theme: ThemeColors;
	suggestions?: string[];
}


interface Tab { name: string; label: string; }

export interface TabsProps {
	tabs: Tab[];
	activeTab: string;
	onChange: (name: string) => void;
	theme: Theme;
}



export type HistoryEntry = RequestConfig & {
	timestamp?: number;
	responseStatus?: number;
	responseTime?: number;
};



export type ThemeColors = typeof themes[keyof typeof themes]['colors'];
