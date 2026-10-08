"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Ban,
  Package,
  ChevronDown,
} from "lucide-react";

import {
  getVariants,
  createVariant,
  updateVariant,
  updateVariantStatus,
  deleteVariant,
  getProducts,
} from "../../lib/api";

type Product = {
  id: number;
  name: string;
  sku: string;
};

type Variant = {
  id: number;
  productId: number;
  size: string;
  color: string;
  sku: string;
  price: number;
  costPrice?: number | null;
  isActive: boolean;
};

export default function VariantsPage() {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [productFilter, setProductFilter] = useState("all");
  const [sizeFilter, setSizeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingVariant, setEditingVariant] =
    useState<Variant | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [variantToDelete, setVariantToDelete] =
    useState<Variant | null>(null);

  const [form, setForm] = useState({
    productId: "",
    size: "",
    color: "",
    sku: "",
    price: "",
    costPrice: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------
  // Load variants and products
  // ---------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [variantResult, productResult] = await Promise.all([
        getVariants(),
        getProducts(),
      ]);

      setVariants(variantResult.data || variantResult.variants || []);
      setProducts(productResult.data || productResult.products || []);
    } catch (err: any) {
      setError(err.message || "Failed to load variant data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------------------------
  // Helper
  // ---------------------------------

  const getProductName = (productId: number) => {
    const product = products.find((item) => item.id === productId);

    return product ? product.name : "Unknown Product";
  };

  // ---------------------------------
  // Filter values
  // ---------------------------------

  const sizes = useMemo(() => {
    return Array.from(
      new Set(variants.map((variant) => variant.size))
    ).sort();
  }, [variants]);

  const colors = useMemo(() => {
    return Array.from(
      new Set(variants.map((variant) => variant.color))
    ).sort();
  }, [variants]);

  // ---------------------------------
  // Filter variants
  // ---------------------------------

  const filteredVariants = useMemo(() => {
    return variants.filter((variant) => {
      const productName = getProductName(variant.productId);

      const searchMatch =
        search.trim() === "" ||
        productName.toLowerCase().includes(search.toLowerCase()) ||
        variant.sku.toLowerCase().includes(search.toLowerCase()) ||
        variant.size.toLowerCase().includes(search.toLowerCase()) ||
        variant.color.toLowerCase().includes(search.toLowerCase());

      const productMatch =
        productFilter === "all" ||
        variant.productId.toString() === productFilter;

      const sizeMatch =
        sizeFilter === "all" || variant.size === sizeFilter;

      const colorMatch =
        colorFilter === "all" || variant.color === colorFilter;

      return (
        searchMatch &&
        productMatch &&
        sizeMatch &&
        colorMatch
      );
    });
  }, [
    variants,
    products,
    search,
    productFilter,
    sizeFilter,
    colorFilter,
  ]);

  // ---------------------------------
  // Open Add Modal
  // ---------------------------------

  const openAddModal = () => {
    setEditingVariant(null);

    setForm({
      productId: "",
      size: "",
      color: "",
      sku: "",
      price: "",
      costPrice: "",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  // ---------------------------------
  // Open Edit Modal
  // ---------------------------------

  const openEditModal = (variant: Variant) => {
    setEditingVariant(variant);

    setForm({
      productId: variant.productId.toString(),
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: variant.price.toString(),
      costPrice:
        variant.costPrice !== null &&
        variant.costPrice !== undefined
          ? variant.costPrice.toString()
          : "",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  // ---------------------------------
  // Form submit
  // ---------------------------------

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.productId ||
      !form.size.trim() ||
      !form.color.trim() ||
      !form.sku.trim() ||
      !form.price
    ) {
      setError(
        "Product, size, color, SKU and selling price are required."
      );
      return;
    }

    const price = Number(form.price);
    const costPrice =
      form.costPrice.trim() === ""
        ? undefined
        : Number(form.costPrice);

    if (Number.isNaN(price) || price < 0) {
      setError("Please enter a valid selling price.");
      return;
    }

    if (
      costPrice !== undefined &&
      (Number.isNaN(costPrice) || costPrice < 0)
    ) {
      setError("Please enter a valid cost price.");
      return;
    }

    try {
      const data = {
        productId: Number(form.productId),
        size: form.size.trim(),
        color: form.color.trim(),
        sku: form.sku.trim(),
        price,
        costPrice,
      };

      if (editingVariant) {
        await updateVariant(editingVariant.id, data);

        setMessage("Variant updated successfully.");
      } else {
        await createVariant(data);

        setMessage("Variant created successfully.");
      }

      setShowModal(false);

      await loadData();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    }
  };

  // ---------------------------------
  // Toggle status
  // ---------------------------------

  const handleStatusChange = async (variant: Variant) => {
    try {
      setError("");
      setMessage("");

      await updateVariantStatus(
        variant.id,
        !variant.isActive
      );

      setMessage(
        variant.isActive
          ? "Variant deactivated successfully."
          : "Variant activated successfully."
      );

      await loadData();
    } catch (err: any) {
      setError(
        err.message || "Failed to update variant status."
      );
    }
  };

  // ---------------------------------
  // Delete
  // ---------------------------------

  const openDeleteModal = (variant: Variant) => {
    setVariantToDelete(variant);
    setShowDeleteModal(true);
    setError("");
    setMessage("");
  };

  const handleDelete = async () => {
    if (!variantToDelete) return;

    try {
      await deleteVariant(variantToDelete.id);

      setMessage("Variant deleted successfully.");

      setShowDeleteModal(false);
      setVariantToDelete(null);

      await loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete variant.");
    }
  };

  // ---------------------------------
  // Render
  // ---------------------------------

  return (
    <main className="min-h-screen bg-[#F7F5F2] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#18181B] text-white">
                <Package size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#18181B]">
                  Variant Management
                </h1>

                <p className="text-sm text-[#666]">
                  Manage clothing sizes, colors and variant pricing.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#D85B70] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#c94d63]"
          >
            <Plus size={18} />
            Add Variant
          </button>
        </div>

        {/* Messages */}

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#3E8065]/20 bg-[#3E8065]/10 px-4 py-3 text-sm font-medium text-[#3E8065]">
            <Check size={18} />
            {message}
          </div>
        )}

        {error && !showModal && !showDeleteModal && (
          <div className="mb-5 rounded-xl border border-[#D85B70]/20 bg-[#D85B70]/10 px-4 py-3 text-sm font-medium text-[#D85B70]">
            {error}
          </div>
        )}

        {/* Filters */}

        <div className="mb-6 rounded-2xl border border-[#E4DED5] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">

            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]"
              />

              <input
                type="text"
                placeholder="Search variants..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-[#DED8CF] bg-[#FDFCFB] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#D85B70]"
              />
            </div>

            {/* Product */}

            <div className="relative">
              <select
                value={productFilter}
                onChange={(event) =>
                  setProductFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#DED8CF] bg-[#FDFCFB] px-3 py-3 pr-10 text-sm outline-none focus:border-[#D85B70]"
              >
                <option value="all">All Products</option>

                {products.map((product) => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]"
              />
            </div>

            {/* Size */}

            <div className="relative">
              <select
                value={sizeFilter}
                onChange={(event) =>
                  setSizeFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#DED8CF] bg-[#FDFCFB] px-3 py-3 pr-10 text-sm outline-none focus:border-[#D85B70]"
              >
                <option value="all">All Sizes</option>

                {sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]"
              />
            </div>

            {/* Color */}

            <div className="relative">
              <select
                value={colorFilter}
                onChange={(event) =>
                  setColorFilter(event.target.value)
                }
                className="w-full appearance-none rounded-xl border border-[#DED8CF] bg-[#FDFCFB] px-3 py-3 pr-10 text-sm outline-none focus:border-[#D85B70]"
              >
                <option value="all">All Colors</option>

                {colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]"
              />
            </div>
          </div>
        </div>

        {/* Variant Table */}

        <div className="overflow-hidden rounded-2xl border border-[#E4DED5] bg-white shadow-sm">

          {loading ? (
            <div className="p-12 text-center text-sm text-[#777]">
              Loading variants...
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="p-12 text-center">
              <Package
                size={38}
                className="mx-auto mb-3 text-[#C6A15B]"
              />

              <h3 className="mb-1 text-lg font-semibold text-[#18181B]">
                No variants found
              </h3>

              <p className="text-sm text-[#777]">
                Add your first size and color variant.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">

                  <thead className="border-b border-[#E8E2DA] bg-[#FAF8F5]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Product
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Size
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Color
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        SKU
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Price
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Status
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-[#777]">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-[#EEE8E0]">
                    {filteredVariants.map((variant) => (
                      <tr
                        key={variant.id}
                        className="transition hover:bg-[#FDFBF8]"
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#18181B]">
                            {getProductName(
                              variant.productId
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="inline-flex min-w-9 items-center justify-center rounded-lg bg-[#EDE7DE] px-3 py-1.5 text-sm font-semibold text-[#18181B]">
                            {variant.size}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-[#555]">
                          {variant.color}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-[#666]">
                          {variant.sku}
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#18181B]">
                          ₹{variant.price.toLocaleString("en-IN")}
                        </td>

                        <td className="px-5 py-4">
                          {variant.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3E8065]/10 px-3 py-1.5 text-xs font-semibold text-[#3E8065]">
                              <Check size={13} />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18181B]/10 px-3 py-1.5 text-xs font-semibold text-[#555]">
                              <Ban size={13} />
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">

                            <button
                              onClick={() =>
                                openEditModal(variant)
                              }
                              title="Edit"
                              className="rounded-lg border border-[#DED8CF] p-2 text-[#555] transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
                            >
                              <Pencil size={16} />
                            </button>

                            <button
                              onClick={() =>
                                handleStatusChange(variant)
                              }
                              title={
                                variant.isActive
                                  ? "Deactivate"
                                  : "Activate"
                              }
                              className="rounded-lg border border-[#DED8CF] p-2 text-[#555] transition hover:border-[#3E8065] hover:text-[#3E8065]"
                            >
                              {variant.isActive ? (
                                <Ban size={16} />
                              ) : (
                                <Check size={16} />
                              )}
                            </button>

                            <button
                              onClick={() =>
                                openDeleteModal(variant)
                              }
                              title="Delete"
                              className="rounded-lg border border-[#DED8CF] p-2 text-[#555] transition hover:border-[#D85B70] hover:text-[#D85B70]"
                            >
                              <Trash2 size={16} />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="rounded-xl border border-[#E5DED5] bg-[#FDFBF8] p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-[#18181B]">
                          {getProductName(
                            variant.productId
                          )}
                        </h3>

                        <p className="mt-1 font-mono text-xs text-[#777]">
                          {variant.sku}
                        </p>
                      </div>

                      {variant.isActive ? (
                        <span className="rounded-full bg-[#3E8065]/10 px-2.5 py-1 text-xs font-semibold text-[#3E8065]">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#18181B]/10 px-2.5 py-1 text-xs font-semibold text-[#555]">
                          Inactive
                        </span>
                      )}
                    </div>

                    <div className="mb-4 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-[#EDE7DE] p-2">
                        <p className="text-[10px] uppercase text-[#888]">
                          Size
                        </p>

                        <p className="font-semibold text-[#18181B]">
                          {variant.size}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[#EDE7DE] p-2">
                        <p className="text-[10px] uppercase text-[#888]">
                          Color
                        </p>

                        <p className="font-semibold text-[#18181B]">
                          {variant.color}
                        </p>
                      </div>

                      <div className="rounded-lg bg-[#EDE7DE] p-2">
                        <p className="text-[10px] uppercase text-[#888]">
                          Price
                        </p>

                        <p className="font-semibold text-[#18181B]">
                          ₹{variant.price.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          openEditModal(variant)
                        }
                        className="rounded-lg border border-[#DED8CF] p-2 text-[#555]"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() =>
                          handleStatusChange(variant)
                        }
                        className="rounded-lg border border-[#DED8CF] p-2 text-[#555]"
                      >
                        {variant.isActive ? (
                          <Ban size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          openDeleteModal(variant)
                        }
                        className="rounded-lg border border-[#DED8CF] p-2 text-[#555]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Results count */}

        {!loading && (
          <p className="mt-4 text-sm text-[#777]">
            Showing {filteredVariants.length} of{" "}
            {variants.length} variants
          </p>
        )}
      </div>

      {/* ============================= */}
      {/* Add/Edit Modal */}
      {/* ============================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-[#E8E2DA] px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#18181B]">
                  {editingVariant
                    ? "Edit Variant"
                    : "Add Variant"}
                </h2>

                <p className="mt-1 text-sm text-[#777]">
                  Add size, color and pricing information.
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-[#777] hover:bg-[#F5F1EB]"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-6"
            >
              {/* Error */}

              {error && (
                <div className="rounded-xl bg-[#D85B70]/10 px-4 py-3 text-sm font-medium text-[#D85B70]">
                  {error}
                </div>
              )}

              {/* Product */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#333]">
                  Product
                </label>

                <select
                  value={form.productId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      productId: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                >
                  <option value="">
                    Select Product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size + Color */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    Size
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. M, L, XL"
                    value={form.size}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        size: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    Color
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Black"
                    value={form.color}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        color: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />
                </div>

              </div>

              {/* SKU */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#333]">
                  Variant SKU
                </label>

                <input
                  type="text"
                  placeholder="e.g. SHIRT-001-M-BLK"
                  value={form.sku}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      sku: event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 font-mono text-sm outline-none focus:border-[#D85B70]"
                />
              </div>

              {/* Price */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    Selling Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1299"
                    value={form.price}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        price: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    Cost Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="700"
                    value={form.costPrice}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        costPrice: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />
                </div>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-[#DED8CF] px-5 py-3 text-sm font-semibold text-[#555] transition hover:bg-[#F7F3EE]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#D85B70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c94d63]"
                >
                  {editingVariant
                    ? "Save Changes"
                    : "Add Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================= */}
      {/* Delete Confirmation */}
      {/* ============================= */}

      {showDeleteModal && variantToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D85B70]/10 text-[#D85B70]">
              <Trash2 size={22} />
            </div>

            <h2 className="mb-2 text-xl font-bold text-[#18181B]">
              Delete Variant?
            </h2>

            <p className="mb-6 text-sm leading-6 text-[#666]">
              Are you sure you want to delete the{" "}
              <strong>
                {variantToDelete.size} /{" "}
                {variantToDelete.color}
              </strong>{" "}
              variant of{" "}
              <strong>
                {getProductName(
                  variantToDelete.productId
                )}
              </strong>
              ? This action cannot be undone.
            </p>

            {error && (
              <div className="mb-4 rounded-xl bg-[#D85B70]/10 px-4 py-3 text-sm text-[#D85B70]">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setVariantToDelete(null);
                }}
                className="rounded-xl border border-[#DED8CF] px-5 py-3 text-sm font-semibold text-[#555]"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-xl bg-[#D85B70] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c94d63]"
              >
                Delete Variant
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}