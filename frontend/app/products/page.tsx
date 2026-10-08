"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Package,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description?: string | null;
};

type Product = {
  id: number;
  name: string;
  sku: string;
  description?: string | null;
  categoryId: number;
  createdAt?: string;
  updatedAt?: string;
};

type ProductForm = {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<ProductForm>({
    name: "",
    sku: "",
    description: "",
    categoryId: "",
  });

  // =========================
  // LOAD PRODUCTS + CATEGORIES
  // =========================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [productResult, categoryResult] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      setProducts(productResult.products || []);
      setCategories(categoryResult.categories || []);
    } catch (err) {
      console.error("Failed to load products:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FILTER PRODUCTS
  // =========================

  const filteredProducts = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !searchValue ||
        product.name.toLowerCase().includes(searchValue) ||
        product.sku.toLowerCase().includes(searchValue);

      const matchesCategory =
        categoryFilter === "all" ||
        product.categoryId === Number(categoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  // =========================
  // GET CATEGORY NAME
  // =========================

  const getCategoryName = (categoryId: number) => {
    const category = categories.find(
      (item) => item.id === categoryId
    );

    return category?.name || "Unknown Category";
  };

  // =========================
  // OPEN ADD MODAL
  // =========================

  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      sku: "",
      description: "",
      categoryId: "",
    });

    setError("");
    setMessage("");
    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================

  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      description: product.description || "",
      categoryId: String(product.categoryId),
    });

    setError("");
    setMessage("");
    setShowModal(true);
  };

  // =========================
  // CLOSE PRODUCT MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingProduct(null);

    setForm({
      name: "",
      sku: "",
      description: "",
      categoryId: "",
    });

    setError("");
  };

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (
    field: keyof ProductForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================
  // SAVE PRODUCT
  // =========================

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const name = form.name.trim();
    const sku = form.sku.trim();
    const description = form.description.trim();
    const categoryId = Number(form.categoryId);

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!sku) {
      setError("Product SKU is required.");
      return;
    }

    if (!form.categoryId || Number.isNaN(categoryId)) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const productData = {
        name,
        sku,
        description,
        categoryId,
      };

      if (editingProduct) {
        const result = await updateProduct(
          editingProduct.id,
          productData
        );

        setProducts((previous) =>
          previous.map((product) =>
            product.id === editingProduct.id
              ? result.product
              : product
          )
        );

        setMessage("Product updated successfully.");
      } else {
        const result = await createProduct(productData);

        setProducts((previous) => [
          result.product,
          ...previous,
        ]);

        setMessage("Product created successfully.");
      }

      setShowModal(false);
      setEditingProduct(null);

      setForm({
        name: "",
        sku: "",
        description: "",
        categoryId: "",
      });
    } catch (err) {
      console.error("Save product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to save product."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // OPEN DELETE MODAL
  // =========================

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setError("");
    setShowDeleteModal(true);
  };

  // =========================
  // CLOSE DELETE MODAL
  // =========================

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // =========================
  // DELETE PRODUCT
  // =========================

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      setDeleting(true);
      setError("");

      await deleteProduct(productToDelete.id);

      setProducts((previous) =>
        previous.filter(
          (product) => product.id !== productToDelete.id
        )
      );

      setMessage("Product deleted successfully.");

      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Delete product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete product."
      );
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // CLEAR FILTERS
  // =========================

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("all");
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-[#F7F5F2] px-4 py-6 text-[#18181B] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#18181B] text-[#F7F5F2] shadow-sm">
                <Package size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Products
                </h1>

                <p className="text-sm text-[#66635F]">
                  Manage your clothing products and product information
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D85B70] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c94e63] active:scale-[0.98]"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>

        {/* ================= SUCCESS MESSAGE ================= */}

        {message && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#3E8065]/20 bg-[#3E8065]/10 px-4 py-3 text-sm text-[#2f684f]">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>{message}</span>
            </div>

            <button
              onClick={() => setMessage("")}
              className="rounded-lg p-1 hover:bg-[#3E8065]/10"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= ERROR MESSAGE ================= */}

        {error && !showModal && !showDeleteModal && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#D85B70]/20 bg-[#D85B70]/10 px-4 py-3 text-sm text-[#a73d51]">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>

            <button
              onClick={() => setError("")}
              className="rounded-lg p-1 hover:bg-[#D85B70]/10"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ================= SEARCH + FILTER ================= */}

        <div className="mb-5 rounded-2xl border border-[#E4DED6] bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">

            {/* Search */}

            <div className="relative flex-1">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8782]"
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search products by name or SKU..."
                className="h-11 w-full rounded-xl border border-[#DED8D0] bg-[#F7F5F2] pl-11 pr-4 text-sm outline-none transition placeholder:text-[#9A9792] focus:border-[#D85B70] focus:ring-2 focus:ring-[#D85B70]/10"
              />
            </div>

            {/* Category Filter */}

            <div className="relative lg:w-64">
              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="h-11 w-full appearance-none rounded-xl border border-[#DED8D0] bg-[#F7F5F2] px-4 pr-10 text-sm outline-none transition focus:border-[#D85B70] focus:ring-2 focus:ring-[#D85B70]/10"
              >
                <option value="all">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#77736D]"
              />
            </div>

            {/* Clear */}

            {(search || categoryFilter !== "all") && (
              <button
                onClick={clearFilters}
                className="h-11 rounded-xl border border-[#DED8D0] bg-white px-4 text-sm font-medium text-[#55514C] transition hover:bg-[#F7F5F2]"
              >
                Clear
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-[#77736D]">
            <span>
              Showing{" "}
              <strong className="text-[#18181B]">
                {filteredProducts.length}
              </strong>{" "}
              of{" "}
              <strong className="text-[#18181B]">
                {products.length}
              </strong>{" "}
              products
            </span>
          </div>
        </div>

        {/* ================= PRODUCT TABLE ================= */}

        <div className="overflow-hidden rounded-2xl border border-[#E4DED6] bg-white shadow-sm">

          {loading ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
              <Loader2
                size={30}
                className="animate-spin text-[#D85B70]"
              />

              <p className="text-sm text-[#77736D]">
                Loading products...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EDE7DE] text-[#6F6961]">
                <Package size={28} />
              </div>

              <h3 className="text-lg font-semibold">
                No products found
              </h3>

              <p className="mt-1 max-w-md text-sm text-[#77736D]">
                {products.length === 0
                  ? "Start adding products to your clothing store."
                  : "Try changing your search or category filter."}
              </p>

              {products.length === 0 ? (
                <button
                  onClick={openAddModal}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#D85B70] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c94e63]"
                >
                  <Plus size={17} />
                  Add First Product
                </button>
              ) : (
                <button
                  onClick={clearFilters}
                  className="mt-5 rounded-xl border border-[#DED8D0] px-4 py-2.5 text-sm font-medium text-[#55514C] transition hover:bg-[#F7F5F2]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[850px]">
                  <thead>
                    <tr className="border-b border-[#E8E2DB] bg-[#FAF8F5] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#77736D]">
                        Product
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#77736D]">
                        SKU
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#77736D]">
                        Category
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-[#77736D]">
                        Description
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-[#77736D]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map(
                      (product, index) => (
                        <tr
                          key={product.id}
                          className={`transition hover:bg-[#FAF8F5] ${
                            index !==
                            filteredProducts.length - 1
                              ? "border-b border-[#EEE9E3]"
                              : ""
                          }`}
                        >
                          {/* Product */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EDE7DE] text-[#6A6259]">
                                <Package size={18} />
                              </div>

                              <div>
                                <p className="font-semibold text-[#18181B]">
                                  {product.name}
                                </p>

                                <p className="text-xs text-[#8A8782]">
                                  Product #{product.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}

                          <td className="px-6 py-4">
                            <span className="rounded-lg bg-[#18181B] px-2.5 py-1 text-xs font-medium tracking-wide text-white">
                              {product.sku}
                            </span>
                          </td>

                          {/* Category */}

                          <td className="px-6 py-4">
                            <span className="inline-flex rounded-full bg-[#C6A15B]/15 px-3 py-1 text-xs font-semibold text-[#856B35]">
                              {getCategoryName(
                                product.categoryId
                              )}
                            </span>
                          </td>

                          {/* Description */}

                          <td className="max-w-xs px-6 py-4">
                            <p className="truncate text-sm text-[#66635F]">
                              {product.description ||
                                "No description"}
                            </p>
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() =>
                                  openEditModal(product)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DED8D0] text-[#55514C] transition hover:border-[#C6A15B] hover:bg-[#C6A15B]/10 hover:text-[#856B35]"
                                title="Edit product"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  openDeleteModal(product)
                                }
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#DED8D0] text-[#55514C] transition hover:border-[#D85B70] hover:bg-[#D85B70]/10 hover:text-[#b33f53]"
                                title="Delete product"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}

              <div className="divide-y divide-[#EEE9E3] md:hidden">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">

                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EDE7DE] text-[#6A6259]">
                          <Package size={19} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate font-semibold">
                            {product.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#8A8782]">
                            {product.sku}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 gap-1">
                        <button
                          onClick={() =>
                            openEditModal(product)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DED8D0] text-[#55514C]"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() =>
                            openDeleteModal(product)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DED8D0] text-[#b33f53]"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-[#18181B] px-2.5 py-1 text-xs font-medium text-white">
                        {product.sku}
                      </span>

                      <span className="rounded-full bg-[#C6A15B]/15 px-3 py-1 text-xs font-semibold text-[#856B35]">
                        {getCategoryName(
                          product.categoryId
                        )}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-[#66635F]">
                      {product.description ||
                        "No description"}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* ADD / EDIT PRODUCT MODAL */}
      {/* ===================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18181B]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="flex items-center justify-between border-b border-[#E8E2DB] px-6 py-5">
              <div>
                <h2 className="text-xl font-bold">
                  {editingProduct
                    ? "Edit Product"
                    : "Add Product"}
                </h2>

                <p className="mt-1 text-sm text-[#77736D]">
                  {editingProduct
                    ? "Update product information."
                    : "Add a new clothing product."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#77736D] transition hover:bg-[#F7F5F2] hover:text-[#18181B] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 py-6"
            >

              {/* Error */}

              {error && (
                <div className="flex items-start gap-2 rounded-xl border border-[#D85B70]/20 bg-[#D85B70]/10 px-4 py-3 text-sm text-[#a73d51]">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              {/* Product Name */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#33312E]">
                  Product Name
                  <span className="ml-1 text-[#D85B70]">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    handleChange(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="e.g. Classic Cotton Shirt"
                  className="h-11 w-full rounded-xl border border-[#DED8D0] bg-white px-4 text-sm outline-none transition placeholder:text-[#AAA6A0] focus:border-[#D85B70] focus:ring-2 focus:ring-[#D85B70]/10"
                />
              </div>

              {/* SKU */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#33312E]">
                  SKU
                  <span className="ml-1 text-[#D85B70]">
                    *
                  </span>
                </label>

                <input
                  type="text"
                  value={form.sku}
                  onChange={(event) =>
                    handleChange(
                      "sku",
                      event.target.value
                    )
                  }
                  placeholder="e.g. SHIRT-001"
                  className="h-11 w-full rounded-xl border border-[#DED8D0] bg-white px-4 text-sm uppercase outline-none transition placeholder:text-[#AAA6A0] focus:border-[#D85B70] focus:ring-2 focus:ring-[#D85B70]/10"
                />

                <p className="mt-1.5 text-xs text-[#8A8782]">
                  SKU must be unique.
                </p>
              </div>

              {/* Category */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#33312E]">
                  Category
                  <span className="ml-1 text-[#D85B70]">
                    *
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      handleChange(
                        "categoryId",
                        event.target.value
                      )
                    }
                    className="h-11 w-full appearance-none rounded-xl border border-[#DED8D0] bg-white px-4 pr-10 text-sm outline-none transition focus:border-[#D85B70] focus:ring-2 focus:ring-[#D85B70]/10"
                  >
                    <option value="">
                      Select Category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={17}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#77736D]"
                  />
                </div>

                {categories.length === 0 && (
                  <p className="mt-2 text-xs text-[#D85B70]">
                    No categories available. Create a
                    category first.
                  </p>
                )}
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#33312E]">
                  Description
                  <span className="ml-1 text-xs font-normal text-[#8A8782]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    handleChange(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Enter a short description..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-[#DED8D0] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#AAA6A0] focus:border-[#D85B70] focus:ring-2 focus:ring-[#D85B70]/10"
                />
              </div>

              {/* Buttons */}

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#DED8D0] px-5 py-2.5 text-sm font-semibold text-[#55514C] transition hover:bg-[#F7F5F2] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    saving || categories.length === 0
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D85B70] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c94e63] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingProduct
                    ? "Update Product"
                    : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ===================================================== */}

      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#18181B]/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            <div className="p-6">

              {/* Icon */}

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D85B70]/10 text-[#D85B70]">
                <Trash2 size={22} />
              </div>

              <h2 className="text-xl font-bold">
                Delete Product?
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#66635F]">
                Are you sure you want to delete{" "}
                <strong className="text-[#18181B]">
                  {productToDelete.name}
                </strong>
                ? This action cannot be undone.
              </p>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#D85B70]/20 bg-[#D85B70]/10 px-4 py-3 text-sm text-[#a73d51]">
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{error}</span>
                </div>
              )}

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="rounded-xl border border-[#DED8D0] px-5 py-2.5 text-sm font-semibold text-[#55514C] transition hover:bg-[#F7F5F2] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#D85B70] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c94e63] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting && (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  )}

                  {deleting
                    ? "Deleting..."
                    : "Delete Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}