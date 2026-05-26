import type { Store, CreateStoreInput, ServiceResult } from '@/types';

export interface IStoreService {
  createStore(input: CreateStoreInput): Promise<ServiceResult<Store>>;
  getStore(id: string): Promise<ServiceResult<Store | null>>;
  listStores(): Promise<ServiceResult<Store[]>>;
  updateStore(
    id: string,
    input: Partial<CreateStoreInput>,
  ): Promise<ServiceResult<Store>>;
  deleteStore(id: string): Promise<ServiceResult<void>>;
}
