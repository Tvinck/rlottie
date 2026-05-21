/**
 * @file src/client/auth/auth.ts
 * Простая клиентская авторизация через localStorage.
 *
 * Для prod-готовности: заменить на JWT с refresh-токенами и /api/auth/* endpoints
 * на бэкенде. Сейчас — demo-режим: любой email + пароль ≥ 4 символов работает.
 */

const STORAGE_KEY = 'bazzar_auth';

export interface AuthUser {
  email: string;
  name:  string;
  loggedAt: string;
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function login(email: string, password: string): AuthUser {
  if (!email || password.length < 4) {
    throw new Error('Введите email и пароль (мин. 4 символа)');
  }
  // Demo-логика: имя берём из email (до @)
  const name = email.split('@')[0] ?? 'User';
  const user: AuthUser = {
    email,
    name: name.charAt(0).toUpperCase() + name.slice(1),
    loggedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY);
}
