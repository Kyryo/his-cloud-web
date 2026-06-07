export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface TokenPayload {
  exp: number;
  user_id: number;
}

export interface User {
  id: number;
  name: string;
  url: string;
  email: string;
  permissions: Record<string, boolean>;
  permission_codes?: string[];
  is_admin: boolean;
  is_active?: boolean;
  location: number | null;
  groups: string[];
  tenant: {
    id: number;
    uuid: string;
    name: string;
    code: string;
    country?: string;
    is_active: boolean;
  } | null;
  clinics: Array<{
    id: number;
    clinic: number;
    clinic_name: string;
    clinic_code: string;
    tenant_name: string;
    role: string;
    is_primary: boolean;
    is_active: boolean;
  }> | null;
  locations: Array<{
    id: number;
    location: number;
    location_name: string;
    location_code: string;
    clinic_name: string;
    clinic_code: string;
    tenant_name: string;
    role: string;
    is_primary: boolean;
    is_active: boolean;
  }> | null;
  primary_clinic: {
    id: number;
    name: string;
    code: string;
    tenant: number;
    tenant_name: string;
    is_active: boolean;
  } | null;
  primary_location: {
    id: number;
    name: string;
    code: string;
    clinic: number;
    clinic_name: string;
    tenant_name: string;
    is_active: boolean;
    status: string;
    can_receive_inventory: boolean;
    can_issue_inventory: boolean;
    can_transfer_inventory: boolean;
    can_return_inventory: boolean;
  } | null;
}

export interface AuthSession {
  user: User;
  tokens: AuthTokens;
}

/** Returned to the browser after OTP verify — tokens stay in httpOnly cookies. */
export interface AuthVerifyResponse {
  user: User;
}

export interface SessionResponse {
  authenticated: boolean;
  user?: User;
}

export interface OtpRequestResponse {
  detail: string;
}

export interface SigninOtpRequest {
  email: string;
  password: string;
}

export interface SigninVerifyRequest {
  email: string;
  code: string;
}

export interface SignupOtpRequest {
  email: string;
  password: string;
}

export interface SignupVerifyRequest {
  email: string;
  password: string;
  name: string;
  clinic_name: string;
  country?: string;
  code: string;
}
