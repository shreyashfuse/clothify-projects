const API_URL = "http://localhost:5000/api";

// ==========================================
// BRANCH API
// ==========================================

export async function getBranches() {
  const response = await fetch(`${API_URL}/branches`);

  if (!response.ok) {
    throw new Error("Failed to fetch branches");
  }

  return response.json();
}

export async function createBranch(data: {
  name: string;
  city: string;
  address?: string;
  phone?: string;
}) {
  const response = await fetch(`${API_URL}/branches`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create branch");
  }

  return response.json();
}

export async function updateBranch(
  id: number,
  data: {
    name: string;
    city: string;
    address?: string;
    phone?: string;
  }
) {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update branch");
  }

  return response.json();
}

export async function updateBranchStatus(
  id: number,
  isActive: boolean
) {
  const response = await fetch(`${API_URL}/branches/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });

  if (!response.ok) {
    throw new Error("Failed to update branch status");
  }

  return response.json();
}

export async function deleteBranch(id: number) {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete branch");
  }

  return response.json();
}

// ==========================================
// CATEGORY API
// ==========================================

export async function getCategories() {
  const response = await fetch(`${API_URL}/categories`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch categories"
    );
  }

  return result;
}

export async function getCategoryById(id: number) {
  const response = await fetch(`${API_URL}/categories/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch category"
    );
  }

  return result;
}

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  const response = await fetch(`${API_URL}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create category"
    );
  }

  return result;
}

export async function updateCategory(
  id: number,
  data: {
    name: string;
    description?: string;
  }
) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update category"
    );
  }

  return result;
}

export async function deleteCategory(id: number) {
  const response = await fetch(`${API_URL}/categories/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete category"
    );
  }

  return result;
}

// ==========================================
// PRODUCT API
// ==========================================

export async function getProducts() {
  const response = await fetch(`${API_URL}/products`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch products"
    );
  }

  return result;
}

export async function getProductById(id: number) {
  const response = await fetch(`${API_URL}/products/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch product"
    );
  }

  return result;
}

export async function createProduct(data: {
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
}) {
  const response = await fetch(`${API_URL}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create product"
    );
  }

  return result;
}

export async function updateProduct(
  id: number,
  data: {
    name: string;
    sku: string;
    description?: string;
    categoryId: number;
  }
) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update product"
    );
  }

  return result;
}

export async function deleteProduct(id: number) {
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete product"
    );
  }

  return result;
}

// ==========================================
// VARIANT API
// ==========================================

export async function getVariants() {
  const response = await fetch(`${API_URL}/variants`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch variants"
    );
  }

  return result;
}

export async function getVariantById(id: number) {
  const response = await fetch(`${API_URL}/variants/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch variant"
    );
  }

  return result;
}

export async function getVariantsByProduct(productId: number) {
  const response = await fetch(
    `${API_URL}/variants/product/${productId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch product variants"
    );
  }

  return result;
}

export async function createVariant(data: {
  productId: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  costPrice?: number;
}) {
  const response = await fetch(`${API_URL}/variants`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create variant"
    );
  }

  return result;
}

export async function updateVariant(
  id: number,
  data: {
    productId: number;
    size: string;
    color: string;
    sku: string;
    price: number;
    costPrice?: number;
  }
) {
  const response = await fetch(`${API_URL}/variants/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update variant"
    );
  }

  return result;
}

export async function updateVariantStatus(
  id: number,
  isActive: boolean
) {
  const response = await fetch(
    `${API_URL}/variants/${id}/status`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        isActive,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update variant status"
    );
  }

  return result;
}

export async function deleteVariant(id: number) {
  const response = await fetch(`${API_URL}/variants/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete variant"
    );
  }

  return result;
}

// ==========================================
// INVENTORY API
// ==========================================

export interface Inventory {
  id: number;
  branchId: number;
  variantId: number;
  quantity: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryData {
  branchId: number;
  variantId: number;
  quantity: number;
  reorderLevel: number;
}

export interface UpdateInventoryData {
  branchId?: number;
  variantId?: number;
  quantity?: number;
  reorderLevel?: number;
}

// Get all inventory
export async function getInventory() {
  const response = await fetch(`${API_URL}/inventory`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch inventory"
    );
  }

  return result;
}

// Get inventory by ID
export async function getInventoryById(id: number) {
  const response = await fetch(`${API_URL}/inventory/${id}`);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch inventory"
    );
  }

  return result;
}

// Get inventory by branch
export async function getInventoryByBranch(branchId: number) {
  const response = await fetch(
    `${API_URL}/inventory/branch/${branchId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch branch inventory"
    );
  }

  return result;
}

// Get inventory by variant
export async function getInventoryByVariant(variantId: number) {
  const response = await fetch(
    `${API_URL}/inventory/variant/${variantId}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to fetch variant inventory"
    );
  }

  return result;
}

// Create inventory
export async function createInventory(
  data: CreateInventoryData
) {
  const response = await fetch(`${API_URL}/inventory`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to create inventory"
    );
  }

  return result;
}

// Update inventory
export async function updateInventory(
  id: number,
  data: UpdateInventoryData
) {
  const response = await fetch(`${API_URL}/inventory/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update inventory"
    );
  }

  return result;
}

// Update only inventory quantity
export async function updateInventoryQuantity(
  id: number,
  quantity: number
) {
  const response = await fetch(
    `${API_URL}/inventory/${id}/quantity`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to update inventory quantity"
    );
  }

  return result;
}

// Delete inventory
export async function deleteInventory(id: number) {
  const response = await fetch(`${API_URL}/inventory/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        result.error ||
        "Failed to delete inventory"
    );
  }

  return result;
}