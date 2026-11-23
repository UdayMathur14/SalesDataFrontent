import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '../environments/environment';

type RawAuthProfile = Record<string, unknown>;

export interface AuthProfile extends RawAuthProfile {
  accessToken: string;
  refreshToken: string;
  permissions: unknown[];
  userId: string;
  userName: string;
  userEmailId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly http = inject(HttpClient);
  private readonly profileState = signal<AuthProfile | null>(this.readStoredProfile());

  readonly profile = this.profileState.asReadonly();
  readonly permissions = computed(() => this.permissionNames(this.profileState()?.permissions ?? []));
  readonly userName = computed(() => this.currentUserName());

  /**
   * UMS opens this application with `data` (Bearer token) and `appId`.
   * Resolve the application-specific profile before Angular renders a route.
   */
  async initialize(): Promise<void> {
    const url = new URL(window.location.href);
    const incomingToken = url.searchParams.get('data')?.trim() ?? '';
    const incomingAppId = url.searchParams.get('appId')?.trim() ?? '';

    if (incomingToken) this.setStorage('umsToken', incomingToken);
    if (incomingAppId) this.setStorage('umsAppId', incomingAppId);
    if (incomingToken || incomingAppId) this.removeHandoffFromAddressBar(url);

    const umsToken = incomingToken || this.getStorage('umsToken');
    const appId = incomingAppId || this.getStorage('umsAppId');

    if (!umsToken || !appId) {
      this.profileState.set(this.readStoredProfile());
      this.ensureUserNameOrLogout();
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http
          .post<RawAuthProfile>(
            environment.umsPermissionUrl,
            { appId },
            { headers: new HttpHeaders({ Authorization: `Bearer ${umsToken}` }) },
          )
          .pipe(timeout(10000)),
      );

      const profile = this.normaliseProfile(response);
      if (!profile.userName) {
        this.logoutForMissingUser();
        return;
      }
      this.profileState.set(profile);
      this.setStorage('profile', JSON.stringify(profile));
      this.setStorage('permissions', JSON.stringify(profile.permissions));
      this.setStorage('accessToken', profile.accessToken);
      this.setStorage('refreshToken', profile.refreshToken);
      this.setStorage('userName', profile.userName);
    } catch (error) {
      // Preserve the last valid session during a temporary UMS/API outage.
      this.profileState.set(this.readStoredProfile());
      this.ensureUserNameOrLogout();
      console.error('Unable to fetch UMS permissions.', error);
    }
  }

  currentUserName(): string {
    const profileName = this.profileState()?.userName?.trim();
    if (profileName) return profileName;

    const storedName = this.getStorage('userName');
    if (storedName) return storedName;

    const storedProfile = this.readStoredProfile();
    return storedProfile?.userName?.trim() ?? '';
  }

  requireUserName(): string {
    const userName = this.currentUserName();
    if (userName) return userName;

    this.logoutForMissingUser();
    throw new Error('Authenticated user name is missing. Redirecting to login.');
  }

  hasPermission(permission: string): boolean {
    const expected = this.normalisePermission(permission);
    return this.permissions().some(value => {
      const actual = this.normalisePermission(value);
      return actual === expected || actual.endsWith(expected);
    });
  }

  hasAnyPermission(permissions: readonly string[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  clear(): void {
    for (const key of [
      'umsToken',
      'umsAppId',
      'profile',
      'permissions',
      'accessToken',
      'refreshToken',
      'userName',
    ]) {
      try {
        localStorage.removeItem(key);
      } catch {}
    }
    this.profileState.set(null);
  }

  private normaliseProfile(response: RawAuthProfile): AuthProfile {
    const permissions = response['permissions'] ?? response['Permissions'];
    const responseUserName = this.stringValue(response['userName'] ?? response['UserName']);
    return {
      ...response,
      accessToken: this.stringValue(response['accessToken'] ?? response['AccessToken']),
      refreshToken: this.stringValue(response['refreshToken'] ?? response['RefreshToken']),
      permissions: Array.isArray(permissions) ? permissions : permissions ? [permissions] : [],
      userId: this.stringValue(response['userId'] ?? response['UserId']),
      userName: responseUserName.trim() || this.getStorage('userName'),
      userEmailId: this.stringValue(response['userEmailId'] ?? response['UserEmailId']),
    };
  }

  private permissionNames(permissions: unknown[]): string[] {
    return permissions.flatMap(permission => {
      if (typeof permission === 'string') return [permission];
      if (!permission || typeof permission !== 'object') return [];
      const entry = permission as Record<string, unknown>;
      const name = entry['permissionName'] ?? entry['PermissionName'] ?? entry['name'] ?? entry['Name'];
      return typeof name === 'string' ? [name] : [];
    });
  }

  private readStoredProfile(): AuthProfile | null {
    const value = this.getStorage('profile');
    if (!value) return null;
    try {
      const parsed = JSON.parse(value) as RawAuthProfile;
      return this.normaliseProfile(parsed);
    } catch {
      return null;
    }
  }

  private removeHandoffFromAddressBar(url: URL): void {
    url.searchParams.delete('data');
    url.searchParams.delete('appId');
    window.history.replaceState(
      window.history.state,
      document.title,
      `${url.pathname}${url.search}${url.hash}`,
    );
  }

  private getStorage(key: string): string {
    try {
      return localStorage.getItem(key)?.trim() ?? '';
    } catch {
      return '';
    }
  }

  private setStorage(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }

  private ensureUserNameOrLogout(): void {
    if (!this.currentUserName()) this.logoutForMissingUser();
  }

  private logoutForMissingUser(): void {
    this.clear();
    window.location.replace('http://192.168.29.101:90');
  }

  private stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }

  private normalisePermission(permission: string): string {
    return permission.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
}
