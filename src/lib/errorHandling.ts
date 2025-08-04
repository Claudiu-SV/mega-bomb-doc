import axios from 'axios';
import toast from 'react-hot-toast';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export const getErrorMessage = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    switch (status) {
      case 400:
        return {
          message: message || 'Invalid request. Please check your input.',
          status,
          code: 'BAD_REQUEST'
        };
      case 401:
        return {
          message: 'Authentication failed. Please contact support.',
          status,
          code: 'UNAUTHORIZED'
        };
      case 413:
        return {
          message: 'File is too large. Please upload a smaller file.',
          status,
          code: 'FILE_TOO_LARGE'
        };
      case 429:
        return {
          message: 'Too many requests. Please wait a moment and try again.',
          status,
          code: 'RATE_LIMITED'
        };
      case 500:
        return {
          message: 'Server error. Please try again in a few minutes.',
          status,
          code: 'SERVER_ERROR'
        };
      case 503:
        return {
          message: 'Service temporarily unavailable. Please try again later.',
          status,
          code: 'SERVICE_UNAVAILABLE'
        };
      default:
        if (error.code === 'NETWORK_ERROR') {
          return {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR'
          };
        }
        if (error.code === 'ECONNABORTED') {
          return {
            message: 'Request timed out. Please try again.',
            code: 'TIMEOUT'
          };
        }
        return {
          message: message || 'An unexpected error occurred.',
          status,
          code: 'UNKNOWN'
        };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'GENERIC_ERROR'
    };
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN'
  };
};

export const handleError = (error: unknown, customMessage?: string) => {
  const apiError = getErrorMessage(error);
  const message = customMessage || apiError.message;
  
  console.error('API Error:', apiError);
  toast.error(message);
  
  return apiError;
};

export const handleSuccess = (message: string) => {
  toast.success(message);
};
