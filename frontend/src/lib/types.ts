export interface APIError {
  response?: {
    data?: {
      detail?: string;
      [key: string]: string | undefined;
    };
    status?: number;
  };
  message?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  call_sign: string;
  default_grid_square?: string;
}
