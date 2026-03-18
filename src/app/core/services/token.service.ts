import { Injectable } from '@angular/core';

const TOKEN_KEY = 'authToken';

@Injectable({ providedIn: 'root' })
export class TokenService {
  getToken(): string {
    return (localStorage.getItem(TOKEN_KEY) ?? '').trim();
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken().length > 0;
  }
}
