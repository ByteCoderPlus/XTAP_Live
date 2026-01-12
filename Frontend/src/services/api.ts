// Use relative URL in development (via Vite proxy) or absolute URL in production
const BASE_URL = import.meta.env.DEV ? '' : 'https://dbskdw9c-8080.inc1.devtunnels.ms';

export interface ApiResource {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  designation: string;
  location: string;
  status: string;
  availabilityDate?: string;
  releaseDate?: string;
  skills: Array<{
    name: string;
    level: string;
    type: 'primary' | 'secondary';
    yearsOfExperience?: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  projectExperience: Array<{
    projectName: string;
    domain: string;
    role: string;
    startDate: string;
    endDate?: string;
    technologies: string[];
  }>;
  billingHistory: {
    billable: boolean;
    rate?: number;
    currency?: string;
    lastBilledDate?: string;
    totalBilledHours?: number;
  };
  ctc?: number;
  ctcCurrency?: string;
  softBlocks: Array<{
    id: string;
    resourceId: string;
    reason: string;
    startDate: string;
    endDate: string;
    createdBy: string;
    createdAt: string;
  }>;
  considerations: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ResourceStatistics {
  total: number;
  atp: number;
  deployed: number;
  softBlocked: number;
  [key: string]: number;
}

export interface Account {
  id: string;
  name: string;
  [key: string]: any;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    // Only set Content-Type for requests with body (POST, PUT, PATCH)
    const hasBody = options?.method && ['POST', 'PUT', 'PATCH'].includes(options.method);
    const headers: HeadersInit = {
      ...(hasBody && { 'Content-Type': 'application/json' }),
      // Accept header for JSON responses
      'Accept': 'application/json',
      ...options?.headers,
    };

    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: options?.method || 'GET',
        url: url,
        headers: headers,
      });
    }

    const response = await fetch(url, {
      ...options,
      headers,
      // Don't send credentials unless explicitly needed
      credentials: 'omit',
    });

    if (!response.ok) {
      let errorText = '';
      try {
        errorText = await response.text();
      } catch {
        errorText = 'Unable to read error response';
      }
      
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (errorText) {
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorJson.detail || errorMessage;
          // Include full error details in console for debugging
          console.error('API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            url: url,
            error: errorJson,
            rawResponse: errorText,
          });
        } catch {
          errorMessage += ` - ${errorText.substring(0, 200)}`;
          console.error('API Error (non-JSON):', {
            status: response.status,
            statusText: response.statusText,
            url: url,
            rawResponse: errorText,
          });
        }
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Handle network errors (CORS, connection refused, etc.)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        throw new Error(
          'Network error: Unable to connect to the API server. This may be due to CORS issues or the server being unavailable. ' +
          'Please ensure the backend server is running and configured to allow requests from this origin.'
        );
      }
    }
    throw error;
  }
}

// Helper function to extract array from API response
export function extractArray<T>(response: T | { data: T } | { content: T } | any): T {
  if (import.meta.env.DEV) {
    console.log('Extracting array from response. Type:', typeof response, 'Is Array:', Array.isArray(response), 'Response:', response);
  }
  
  if (Array.isArray(response)) {
    return response as T;
  }
  
  if (response && typeof response === 'object') {
    if (Array.isArray(response.data)) {
      if (import.meta.env.DEV) console.log('Found array in response.data');
      return response.data as T;
    }
    if (Array.isArray(response.content)) {
      if (import.meta.env.DEV) console.log('Found array in response.content');
      return response.content as T;
    }
    if (Array.isArray(response.results)) {
      if (import.meta.env.DEV) console.log('Found array in response.results');
      return response.results as T;
    }
    if (Array.isArray(response.items)) {
      if (import.meta.env.DEV) console.log('Found array in response.items');
      return response.items as T;
    }
  }
  
  console.warn('Unexpected API response format. Response type:', typeof response, 'Response keys:', response && typeof response === 'object' ? Object.keys(response) : 'N/A');
  // If it's not an array, try to return it as-is (might be a single object or different structure)
  return response as T;
}

// Resource APIs
export const resourceAPI = {
  getAllResources: async (): Promise<ApiResource[] | { data: ApiResource[]; pagination?: any }> => {
    const response = await fetchAPI<any>('/api/v1/resources');
    // Handle paginated response: { data: [...], pagination: {...} }
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      if (Array.isArray(response.data)) {
        return response; // Return full response with pagination
      }
    }
    const array = extractArray<ApiResource[]>(response);
    return Array.isArray(array) ? array : [];
  },

  getResourceById: async (id: string): Promise<ApiResource> => {
    return fetchAPI<ApiResource>(`/api/v1/resources/${id}`);
  },

  getResourceStatistics: async (): Promise<ResourceStatistics> => {
    return fetchAPI<ResourceStatistics>('/api/v1/resources/stats');
  },

  getAvailableLocations: async (): Promise<string[]> => {
    const response = await fetchAPI<any>('/api/v1/resources/locations');
    const array = extractArray<string[]>(response);
    return Array.isArray(array) ? array : [];
  },

  getAvailableSkills: async (): Promise<string[]> => {
    const response = await fetchAPI<any>('/api/v1/resources/skills');
    const array = extractArray<string[]>(response);
    return Array.isArray(array) ? array : [];
  },

  exportResources: async (): Promise<Blob> => {
    const url = `${BASE_URL}/api/v1/resources/export`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream, */*',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          errorMessage += ` - ${errorText.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }
      
      // Check content type
      const contentType = response.headers.get('content-type') || '';
      console.log('Export response content-type:', contentType);
      
      // Get the blob
      const blob = await response.blob();
      
      // Verify it's actually a blob and not JSON
      if (blob.type === 'application/json' || contentType.includes('application/json')) {
        // If API returned JSON, try to parse it to see the error
        const text = await blob.text();
        try {
          const json = JSON.parse(text);
          throw new Error(json.message || json.error || 'API returned JSON instead of Excel file');
        } catch {
          throw new Error('API returned invalid response format. Expected Excel file.');
        }
      }
      
      // If blob type is empty or generic, but we expect Excel, ensure proper type
      if (!blob.type || blob.type === 'application/octet-stream') {
        // Create a new blob with the correct Excel MIME type
        return new Blob([blob], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
        });
      }
      
      return blob;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Network error: Unable to connect to the API server. Please check your connection and CORS settings.'
        );
      }
      throw error;
    }
  },

  softBlockResource: async (
    resourceId: string,
    accountId: string,
    blockedUntil: string
  ): Promise<any> => {
    return fetchAPI<any>(
      `/api/v1/resources/${resourceId}/soft-block?accountId=${accountId}&blockedUntil=${blockedUntil}`,
      {
        method: 'POST',
      }
    );
  },

  searchBySkills: async (params: {
    skills: string[];
    location?: string;
    experience?: number;
    page?: number;
    limit?: number | string;
  }): Promise<ApiResource[] | { data: ApiResource[]; pagination?: any }> => {
    const response = await fetchAPI<any>('/api/v1/resources/search-by-skills', {
      method: 'POST',
      body: JSON.stringify({
        skills: params.skills || [],
        location: params.location || '',
        experience: params.experience || 0,
        page: params.page || 0,
        limit: params.limit || 10,
      }),
    });
    // Handle paginated response: { data: [...], pagination: {...} }
    if (response && typeof response === 'object' && !Array.isArray(response)) {
      if (Array.isArray(response.data)) {
        return response; // Return full response with pagination
      }
    }
    const array = extractArray<ApiResource[]>(response);
    return Array.isArray(array) ? array : [];
  },
};

// Account APIs
export const accountAPI = {
  getAllAccounts: async (): Promise<Account[]> => {
    const response = await fetchAPI<any>('/api/v1/accounts');
    const array = extractArray<Account[]>(response);
    return Array.isArray(array) ? array : [];
  },
};
