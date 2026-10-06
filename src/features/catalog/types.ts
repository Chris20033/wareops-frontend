// ==========================================
// SUCURSALES (BRANCHES)
// ==========================================

export interface BranchDto {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  address: string | null;
  isActive: boolean;
  warehousesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBranchDto {
  code: string;
  name: string;
  address?: string;
}

export interface UpdateBranchDto {
  name?: string;
  address?: string;
  isActive?: boolean;
}

export interface BranchQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sort?: "name" | "code" | "createdAt";
  order?: "asc" | "desc";
}

// ==========================================
// ALMACENES (WAREHOUSES)
// ==========================================

export interface WarehouseBranchSummaryDto {
  id: string;
  code: string;
  name: string;
}

export interface WarehouseDto {
  id: string;
  branchId: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  branch: WarehouseBranchSummaryDto;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWarehouseDto {
  branchId: string;
  code: string;
  name: string;
  description?: string;
}

export interface UpdateWarehouseDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface WarehouseQueryDto {
  page?: number;
  pageSize?: number;
  branchId?: string;
  search?: string;
  isActive?: boolean;
  sort?: "name" | "code" | "createdAt";
  order?: "asc" | "desc";
}

// ==========================================
// PRODUCTOS (PRODUCTS)
// ==========================================

export interface ProductSupplierSummaryDto {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  linkedAt: string;
}

export interface ProductDto {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  description: string | null;
  isActive: boolean;
  suppliersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailDto extends ProductDto {
  suppliers: ProductSupplierSummaryDto[];
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description?: string;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface ProductQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sort?: "name" | "sku" | "createdAt";
  order?: "asc" | "desc";
}

// ==========================================
// PROVEEDORES (SUPPLIERS)
// ==========================================

export interface SupplierDto {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  productsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  code: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

export interface SupplierQueryDto {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sort?: "name" | "code" | "createdAt";
  order?: "asc" | "desc";
}

// ==========================================
// PRODUCTO-PROVEEDOR (PRODUCT-SUPPLIERS)
// ==========================================

export interface ProductSupplierItemDto {
  supplierId: string;
  code: string;
  name: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  linkedAt: string;
}

export interface AttachSupplierDto {
  supplierId: string;
}
