/**
 * ServiceContainer — Dependency Inversion Principle
 *
 * All concrete implementations are wired here.
 * To swap Firebase for Supabase: only change this file.
 * Every hook and component imports from here, never from concrete classes.
 */

import { FirebaseAuthService } from './firebase/FirebaseAuthService'
import { FirebaseUserService } from './firebase/FirebaseUserService'
import { FirebaseProductService } from './firebase/FirebaseProductService'
import { FirebaseBillService } from './firebase/FirebaseBillService'
import { FirebasePaymentService } from './firebase/FirebasePaymentService'
import { CloudinaryStorageService } from './cloudinary/CloudinaryStorageService'

import type { IAuthService } from './interfaces/IAuthService'
import type { IUserService } from './interfaces/IUserService'
import type { IProductService } from './interfaces/IProductService'
import type { IBillService } from './interfaces/IBillService'
import type { IPaymentService } from './interfaces/IPaymentService'
import type { IStorageService } from './interfaces/IStorageService'

// Singletons — one instance per service
export const authService: IAuthService = new FirebaseAuthService()
export const userService: IUserService = new FirebaseUserService()
export const productService: IProductService = new FirebaseProductService()
export const billService: IBillService = new FirebaseBillService()
export const paymentService: IPaymentService = new FirebasePaymentService()
export const storageService: IStorageService = new CloudinaryStorageService()
