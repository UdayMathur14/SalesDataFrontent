import { Injectable, signal } from '@angular/core';

export type SessionUser = {
  displayName: string;
  username: string;
  role?: string;
};

@Injectable({ providedIn: 'root' })
export class SessionUserService {
  private readonly userState = signal<SessionUser | null>(null);
  readonly user = this.userState.asReadonly();

  setUser(user: SessionUser) {
    this.userState.set(user);
  }

  clear() {
    this.userState.set(null);
  }

  initials(user: SessionUser) {
    return user.displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');
  }
}
