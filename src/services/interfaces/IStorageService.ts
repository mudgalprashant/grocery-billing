import type { ServiceResult } from '@/types'

/**
 * IStorageService — Open/Closed Principle:
 * Swap Cloudinary for S3, Firebase Storage, or any provider
 * without touching a single component.
 */
export interface IStorageService {
  /**
   * Upload a file and return its public URL.
   * @param file - The file to upload
   * @param folder - Logical folder name (e.g. 'receipts', 'products')
   */
  uploadFile(file: File, folder: string): Promise<ServiceResult<string>>

  /**
   * Delete a file by its public URL.
   */
  deleteFile(url: string): Promise<ServiceResult<void>>
}
