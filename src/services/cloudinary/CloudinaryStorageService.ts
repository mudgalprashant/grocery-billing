import type { IStorageService } from '../interfaces/IStorageService'
import type { ServiceResult } from '@/types'

/**
 * CloudinaryStorageService — implements IStorageService using Cloudinary's
 * unsigned upload API (no backend required).
 *
 * Setup:
 * 1. Go to Cloudinary Console → Settings → Upload
 * 2. Create an "Unsigned" upload preset
 * 3. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env
 */
export class CloudinaryStorageService implements IStorageService {
  private cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string
  private uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string

  async uploadFile(file: File, folder: string): Promise<ServiceResult<string>> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', this.uploadPreset)
      formData.append('folder', `grocery-billing/${folder}`)

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/upload`,
        { method: 'POST', body: formData }
      )

      if (!res.ok) {
        const err = await res.json()
        return { success: false, error: err.error?.message ?? 'Upload failed' }
      }

      const data = await res.json()
      return { success: true, data: data.secure_url as string }
    } catch (err) {
      return { success: false, error: (err as Error).message }
    }
  }

  async deleteFile(_url: string): Promise<ServiceResult<void>> {
    // Cloudinary deletion requires a backend signature for security.
    // For v1: images are retained (storage is cheap at 25GB free).
    // Future: add a Cloud Function to handle signed deletions.
    return { success: true, data: undefined }
  }
}
