/**
 * ServiceContainer — single wiring point (Dependency Inversion Principle).
 * Swap any provider by changing only this file.
 */
import { FirebaseAuthService } from './firebase/FirebaseAuthService';
import { FirebaseUserService } from './firebase/FirebaseUserService';
import { FirebaseProductService } from './firebase/FirebaseProductService';
import { FirebaseBillService } from './firebase/FirebaseBillService';
import { FirebasePaymentService } from './firebase/FirebasePaymentService';
import { FirebaseStoreService } from './firebase/FirebaseStoreService';
import { CloudinaryStorageService } from './cloudinary/CloudinaryStorageService';

import type { IAuthService } from './interfaces/IAuthService';
import type { IUserService } from './interfaces/IUserService';
import type { IProductService } from './interfaces/IProductService';
import type { IBillService } from './interfaces/IBillService';
import type { IPaymentService } from './interfaces/IPaymentService';
import type { IStoreService } from './interfaces/IStoreService';
import type { IStorageService } from './interfaces/IStorageService';

export const authService: IAuthService = new FirebaseAuthService();
export const userService: IUserService = new FirebaseUserService();
export const productService: IProductService = new FirebaseProductService();
export const billService: IBillService = new FirebaseBillService();
export const paymentService: IPaymentService = new FirebasePaymentService();
export const storeService: IStoreService = new FirebaseStoreService();
export const storageService: IStorageService = new CloudinaryStorageService();
