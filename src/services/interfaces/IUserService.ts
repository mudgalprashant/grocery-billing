import type { AppUser, UserRole, ServiceResult } from '@/types';

export interface IUserService {
  upsertUser(
    user: Omit<AppUser, 'role' | 'isActive'> & { role?: UserRole },
  ): Promise<ServiceResult<AppUser>>;
  getUser(uid: string): Promise<ServiceResult<AppUser | null>>;
  listUsers(): Promise<ServiceResult<AppUser[]>>;
  updateUserRole(uid: string, role: UserRole): Promise<ServiceResult<void>>;
  updateUserStore(
    uid: string,
    storeId: string | null,
  ): Promise<ServiceResult<void>>;
  setUserActive(uid: string, isActive: boolean): Promise<ServiceResult<void>>;
}
