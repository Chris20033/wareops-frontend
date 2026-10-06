import { apiRequest } from "@/lib/api/client";
import type { ApiPaginatedResponse, ApiSuccessResponse } from "@/lib/api/types";
import type {
  AttachSupplierDto,
  BranchDto,
  BranchQueryDto,
  CreateBranchDto,
  CreateProductDto,
  CreateSupplierDto,
  CreateWarehouseDto,
  ProductDetailDto,
  ProductDto,
  ProductQueryDto,
  ProductSupplierItemDto,
  SupplierDto,
  SupplierQueryDto,
  UpdateBranchDto,
  UpdateProductDto,
  UpdateSupplierDto,
  UpdateWarehouseDto,
  WarehouseDto,
  WarehouseQueryDto,
} from "./types";

// ==========================================
// SUCURSALES (BRANCHES)
// ==========================================

export async function fetchBranches(
  query: BranchQueryDto = {},
): Promise<ApiPaginatedResponse<BranchDto>> {
  return apiRequest<ApiPaginatedResponse<BranchDto>>("/branches", {
    method: "GET",
    tenant: true,
    query: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      search: query.search?.trim() || undefined,
      isActive: query.isActive,
      sort: query.sort ?? "name",
      order: query.order ?? "asc",
    },
  });
}

export async function fetchBranchById(branchId: string): Promise<BranchDto> {
  const response = await apiRequest<ApiSuccessResponse<BranchDto>>(
    `/branches/${branchId}`,
    {
      method: "GET",
      tenant: true,
    },
  );
  return response.data;
}

export async function createBranch(dto: CreateBranchDto): Promise<BranchDto> {
  const response = await apiRequest<ApiSuccessResponse<BranchDto>>(
    "/branches",
    {
      method: "POST",
      tenant: true,
      body: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        address: dto.address?.trim() || undefined,
      },
    },
  );
  return response.data;
}

export async function updateBranch(
  branchId: string,
  dto: UpdateBranchDto,
): Promise<BranchDto> {
  const response = await apiRequest<ApiSuccessResponse<BranchDto>>(
    `/branches/${branchId}`,
    {
      method: "PATCH",
      tenant: true,
      body: dto,
    },
  );
  return response.data;
}

// ==========================================
// ALMACENES (WAREHOUSES)
// ==========================================

export async function fetchWarehouses(
  query: WarehouseQueryDto = {},
): Promise<ApiPaginatedResponse<WarehouseDto>> {
  return apiRequest<ApiPaginatedResponse<WarehouseDto>>("/warehouses", {
    method: "GET",
    tenant: true,
    query: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      branchId: query.branchId || undefined,
      search: query.search?.trim() || undefined,
      isActive: query.isActive,
      sort: query.sort ?? "name",
      order: query.order ?? "asc",
    },
  });
}

export async function fetchWarehouseById(
  warehouseId: string,
): Promise<WarehouseDto> {
  const response = await apiRequest<ApiSuccessResponse<WarehouseDto>>(
    `/warehouses/${warehouseId}`,
    {
      method: "GET",
      tenant: true,
    },
  );
  return response.data;
}

export async function createWarehouse(
  dto: CreateWarehouseDto,
): Promise<WarehouseDto> {
  const response = await apiRequest<ApiSuccessResponse<WarehouseDto>>(
    "/warehouses",
    {
      method: "POST",
      tenant: true,
      body: {
        branchId: dto.branchId,
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        description: dto.description?.trim() || undefined,
      },
    },
  );
  return response.data;
}

export async function updateWarehouse(
  warehouseId: string,
  dto: UpdateWarehouseDto,
): Promise<WarehouseDto> {
  const response = await apiRequest<ApiSuccessResponse<WarehouseDto>>(
    `/warehouses/${warehouseId}`,
    {
      method: "PATCH",
      tenant: true,
      body: dto,
    },
  );
  return response.data;
}

// ==========================================
// PRODUCTOS (PRODUCTS)
// ==========================================

export async function fetchProducts(
  query: ProductQueryDto = {},
): Promise<ApiPaginatedResponse<ProductDto>> {
  return apiRequest<ApiPaginatedResponse<ProductDto>>("/products", {
    method: "GET",
    tenant: true,
    query: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      search: query.search?.trim() || undefined,
      isActive: query.isActive,
      sort: query.sort ?? "name",
      order: query.order ?? "asc",
    },
  });
}

export async function fetchProductById(
  productId: string,
): Promise<ProductDetailDto> {
  const response = await apiRequest<ApiSuccessResponse<ProductDetailDto>>(
    `/products/${productId}`,
    {
      method: "GET",
      tenant: true,
    },
  );
  return response.data;
}

export async function createProduct(
  dto: CreateProductDto,
): Promise<ProductDto> {
  const response = await apiRequest<ApiSuccessResponse<ProductDto>>(
    "/products",
    {
      method: "POST",
      tenant: true,
      body: {
        sku: dto.sku.trim().toUpperCase(),
        name: dto.name.trim(),
        description: dto.description?.trim() || undefined,
      },
    },
  );
  return response.data;
}

export async function updateProduct(
  productId: string,
  dto: UpdateProductDto,
): Promise<ProductDetailDto> {
  const response = await apiRequest<ApiSuccessResponse<ProductDetailDto>>(
    `/products/${productId}`,
    {
      method: "PATCH",
      tenant: true,
      body: dto,
    },
  );
  return response.data;
}

// ==========================================
// PROVEEDORES (SUPPLIERS)
// ==========================================

export async function fetchSuppliers(
  query: SupplierQueryDto = {},
): Promise<ApiPaginatedResponse<SupplierDto>> {
  return apiRequest<ApiPaginatedResponse<SupplierDto>>("/suppliers", {
    method: "GET",
    tenant: true,
    query: {
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
      search: query.search?.trim() || undefined,
      isActive: query.isActive,
      sort: query.sort ?? "name",
      order: query.order ?? "asc",
    },
  });
}

export async function fetchSupplierById(
  supplierId: string,
): Promise<SupplierDto> {
  const response = await apiRequest<ApiSuccessResponse<SupplierDto>>(
    `/suppliers/${supplierId}`,
    {
      method: "GET",
      tenant: true,
    },
  );
  return response.data;
}

export async function createSupplier(
  dto: CreateSupplierDto,
): Promise<SupplierDto> {
  const response = await apiRequest<ApiSuccessResponse<SupplierDto>>(
    "/suppliers",
    {
      method: "POST",
      tenant: true,
      body: {
        code: dto.code.trim().toUpperCase(),
        name: dto.name.trim(),
        contactName: dto.contactName?.trim() || undefined,
        email: dto.email?.trim().toLowerCase() || undefined,
        phone: dto.phone?.trim() || undefined,
      },
    },
  );
  return response.data;
}

export async function updateSupplier(
  supplierId: string,
  dto: UpdateSupplierDto,
): Promise<SupplierDto> {
  const response = await apiRequest<ApiSuccessResponse<SupplierDto>>(
    `/suppliers/${supplierId}`,
    {
      method: "PATCH",
      tenant: true,
      body: dto,
    },
  );
  return response.data;
}

// ==========================================
// ASOCIACIÓN PRODUCTO-PROVEEDOR
// ==========================================

export async function fetchProductSuppliers(
  productId: string,
): Promise<ProductSupplierItemDto[]> {
  const response = await apiRequest<
    ApiSuccessResponse<ProductSupplierItemDto[]>
  >(`/products/${productId}/suppliers`, {
    method: "GET",
    tenant: true,
  });
  return response.data;
}

export async function attachProductSupplier(
  productId: string,
  dto: AttachSupplierDto,
): Promise<ProductSupplierItemDto> {
  const response = await apiRequest<ApiSuccessResponse<ProductSupplierItemDto>>(
    `/products/${productId}/suppliers`,
    {
      method: "POST",
      tenant: true,
      body: dto,
    },
  );
  return response.data;
}

export async function detachProductSupplier(
  productId: string,
  supplierId: string,
): Promise<void> {
  await apiRequest<void>(`/products/${productId}/suppliers/${supplierId}`, {
    method: "DELETE",
    tenant: true,
  });
}
