export interface CurrentUser {
  name: string;
  email: string;
  permissions: Record<string, boolean>;
}
