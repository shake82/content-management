export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ApiState<T> {
  status: ApiStatus;
  data?: T;
  error?: Error;
  refetch: () => void;
}
