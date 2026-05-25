import type { Product, CreateProductInput, UpdateProductInput, ServiceResult } from '@/types'

/**
 * IProductService — Single Responsibility: product catalog CRUD only.
 */
export interface IProductService {
  listProducts(includeInactive?: boolean): Promise<ServiceResult<Product[]>>
  getProduct(id: string): Promise<ServiceResult<Product | null>>
  createProduct(input: CreateProductInput): Promise<ServiceResult<Product>>
  updateProduct(id: string, input: UpdateProductInput): Promise<ServiceResult<Product>>
  deleteProduct(id: string): Promise<ServiceResult<void>>
  searchProducts(query: string): Promise<ServiceResult<Product[]>>
}
