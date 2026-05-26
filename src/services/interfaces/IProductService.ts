import type { Product, CreateProductInput, UpdateProductInput, ServiceResult } from '@/types'

export interface IProductService {
  listProducts(storeId: string, includeInactive?: boolean): Promise<ServiceResult<Product[]>>
  getProduct(storeId: string, id: string): Promise<ServiceResult<Product | null>>
  createProduct(input: CreateProductInput): Promise<ServiceResult<Product>>
  updateProduct(storeId: string, id: string, input: UpdateProductInput): Promise<ServiceResult<Product>>
  deleteProduct(storeId: string, id: string): Promise<ServiceResult<void>>
  searchProducts(storeId: string, query: string): Promise<ServiceResult<Product[]>>
}
