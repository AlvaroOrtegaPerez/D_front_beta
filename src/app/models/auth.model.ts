export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  authToken: string;
  user?: { correo_validado?: boolean };
  correo_validado?: boolean;
}

export interface SignupPayload {
  nombre: string;
  email: string;
  password: string;
  newsletter?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export interface VerifyEmailPayload {
  verify_token: string;
}

export interface RequestEmailVerificationPayload {
  email: string;
  nombre?: string;
}
