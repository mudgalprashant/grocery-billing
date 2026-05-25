import type { AppUser, UserRole, ServiceResult } from '@/types'

/**
 * IUserService — manages user profiles and roles stored in the DB.
 * Separate from IAuthService (Interface Segregation Principle).
 */
export interface IUserService {
  /** Create or update a user profile after OAuth sign-in */
  upsertUser(user: Omit<AppUser, 'role' | 'isActive'> & { role?: UserRole }): Promise<ServiceResult<AppUser>>

  /** Get a single user by UID */
  getUser(uid: string): Promise<ServiceResult<AppUser | null>>

  /** List all users — admin only */
  listUsers(): Promise<ServiceResult<AppUser[]>>

  /** Update a user's role — admin only */
  updateUserRole(uid: string, role: UserRole): Promise<ServiceResult<void>>

  /** Activate or deactivate a user — admin only */
  setUserActive(uid: string, isActive: boolean): Promise<ServiceResult<void>>
}
