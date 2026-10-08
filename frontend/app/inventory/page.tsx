"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Package,
  ChevronDown,
  AlertTriangle,
  Building2,
  Minus,
  Plus as PlusIcon,
  RefreshCw,
} from "lucide-react";

import {
  getInventory,
  createInventory,
  updateInventory,
  updateInventoryQuantity,
  deleteInventory,
  getBranches,
  getProducts,
  getVariants,
} from "../../lib/api";

type Branch = {
  id: number;
  name: string;
  city: string;
  isActive: boolean;
};

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

type InventoryItem = {
  id: number;
  branchId: number;
  variantId: number;
  quantity: number;
  reorderLevel: number;
  createdAt?: string;
  updatedAt?: string;
};

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingInventory, setEditingInventory] =
    useState<InventoryItem | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [inventoryToDelete, setInventoryToDelete] =
    useState<InventoryItem | null>(null);

  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [quantityItem, setQuantityItem] =
    useState<InventoryItem | null>(null);

  const [quantityValue, setQuantityValue] = useState("");

  const [form, setForm] = useState({
    branchId: "",
    variantId: "",
    quantity: "",
    reorderLevel: "5",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ---------------------------------
  // Load Inventory Data
  // ---------------------------------

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        inventoryResult,
        branchResult,
        productResult,
        variantResult,
      ] = await Promise.all([
        getInventory(),
        getBranches(),
        getProducts(),
        getVariants(),
      ]);

      setInventory(
        inventoryResult.data ||
          inventoryResult.inventory ||
          []
      );

      setBranches(
        branchResult.data ||
          branchResult.branches ||
          []
      );

      setProducts(
        productResult.data ||
          productResult.products ||
          []
      );

      setVariants(
        variantResult.data ||
          variantResult.variants ||
          []
      );
    } catch (err: any) {
      setError(
        err.message || "Failed to load inventory data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------------------------
  // Helper Functions
  // ---------------------------------

  const getBranch = (branchId: number) => {
    return branches.find(
      (branch) => branch.id === branchId
    );
  };

  const getBranchName = (branchId: number) => {
    const branch = getBranch(branchId);

    return branch
      ? branch.name
      : "Unknown Branch";
  };

  const getVariant = (variantId: number) => {
    return variants.find(
      (variant) => variant.id === variantId
    );
  };

  const getProduct = (productId: number) => {
    return products.find(
      (product) => product.id === productId
    );
  };

  const getProductName = (variantId: number) => {
    const variant = getVariant(variantId);

    if (!variant) {
      return "Unknown Product";
    }

    const product = getProduct(variant.productId);

    return product
      ? product.name
      : "Unknown Product";
  };

  const getVariantDetails = (variantId: number) => {
    const variant = getVariant(variantId);

    if (!variant) {
      return {
        size: "-",
        color: "-",
        sku: "-",
      };
    }

    return {
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
    };
  };

  // ---------------------------------
  // Stock Status
  // ---------------------------------

  const getStockStatus = (
    item: InventoryItem
  ) => {
    if (item.quantity === 0) {
      return "out";
    }

    if (item.quantity <= item.reorderLevel) {
      return "low";
    }

    return "healthy";
  };

  const getStockStatusLabel = (
    item: InventoryItem
  ) => {
    const status = getStockStatus(item);

    if (status === "out") {
      return "Out of Stock";
    }

    if (status === "low") {
      return "Low Stock";
    }

    return "Healthy";
  };

  // ---------------------------------
  // Summary
  // ---------------------------------

  const totalStock = useMemo(() => {
    return inventory.reduce(
      (total, item) => total + item.quantity,
      0
    );
  }, [inventory]);

  const lowStockCount = useMemo(() => {
    return inventory.filter(
      (item) =>
        item.quantity > 0 &&
        item.quantity <= item.reorderLevel
    ).length;
  }, [inventory]);

  const outOfStockCount = useMemo(() => {
    return inventory.filter(
      (item) => item.quantity === 0
    ).length;
  }, [inventory]);

  const activeBranchCount = useMemo(() => {
    return branches.filter(
      (branch) => branch.isActive
    ).length;
  }, [branches]);

  // ---------------------------------
  // Filter Inventory
  // ---------------------------------

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const variant = getVariant(item.variantId);

      const productName = variant
        ? getProductName(item.variantId)
        : "";

      const variantDetails = getVariantDetails(
        item.variantId
      );

      const branchName = getBranchName(
        item.branchId
      );

      const searchText =
        `${productName} ${branchName} ${variantDetails.size} ${variantDetails.color} ${variantDetails.sku}`
          .toLowerCase();

      const searchMatch =
        search.trim() === "" ||
        searchText.includes(search.toLowerCase());

      const branchMatch =
        branchFilter === "all" ||
        item.branchId.toString() === branchFilter;

      const status = getStockStatus(item);

      const statusMatch =
        statusFilter === "all" ||
        status === statusFilter;

      return (
        searchMatch &&
        branchMatch &&
        statusMatch
      );
    });
  }, [
    inventory,
    branches,
    products,
    variants,
    search,
    branchFilter,
    statusFilter,
  ]);

  // ---------------------------------
  // Open Add Modal
  // ---------------------------------

  const openAddModal = () => {
    setEditingInventory(null);

    setForm({
      branchId: "",
      variantId: "",
      quantity: "",
      reorderLevel: "5",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  // ---------------------------------
  // Open Edit Modal
  // ---------------------------------

  const openEditModal = (
    item: InventoryItem
  ) => {
    setEditingInventory(item);

    setForm({
      branchId: item.branchId.toString(),
      variantId: item.variantId.toString(),
      quantity: item.quantity.toString(),
      reorderLevel:
        item.reorderLevel.toString(),
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  // ---------------------------------
  // Submit Add/Edit
  // ---------------------------------

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (
      !form.branchId ||
      !form.variantId ||
      form.quantity.trim() === "" ||
      form.reorderLevel.trim() === ""
    ) {
      setError(
        "Branch, variant, quantity and reorder level are required."
      );
      return;
    }

    const quantity = Number(form.quantity);
    const reorderLevel = Number(
      form.reorderLevel
    );

    if (
      Number.isNaN(quantity) ||
      quantity < 0 ||
      !Number.isInteger(quantity)
    ) {
      setError(
        "Quantity must be a valid whole number greater than or equal to 0."
      );
      return;
    }

    if (
      Number.isNaN(reorderLevel) ||
      reorderLevel < 0 ||
      !Number.isInteger(reorderLevel)
    ) {
      setError(
        "Reorder level must be a valid whole number greater than or equal to 0."
      );
      return;
    }

    try {
      const data = {
        branchId: Number(form.branchId),
        variantId: Number(form.variantId),
        quantity,
        reorderLevel,
      };

      if (editingInventory) {
        await updateInventory(
          editingInventory.id,
          data
        );

        setMessage(
          "Inventory updated successfully."
        );
      } else {
        await createInventory(data);

        setMessage(
          "Inventory created successfully."
        );
      }

      setShowModal(false);

      await loadData();
    } catch (err: any) {
      setError(
        err.message ||
          "Something went wrong while saving inventory."
      );
    }
  };

  // ---------------------------------
  // Quick Quantity Modal
  // ---------------------------------

  const openQuantityModal = (
    item: InventoryItem
  ) => {
    setQuantityItem(item);
    setQuantityValue(item.quantity.toString());
    setMessage("");
    setError("");
    setShowQuantityModal(true);
  };

  // ---------------------------------
  // Quick Quantity Update
  // ---------------------------------

  const handleQuantityUpdate = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!quantityItem) return;

    setMessage("");
    setError("");

    const quantity = Number(quantityValue);

    if (
      Number.isNaN(quantity) ||
      quantity < 0 ||
      !Number.isInteger(quantity)
    ) {
      setError(
        "Quantity must be a valid whole number greater than or equal to 0."
      );
      return;
    }

    try {
      await updateInventoryQuantity(
        quantityItem.id,
        quantity
      );

      setMessage(
        "Stock quantity updated successfully."
      );

      setShowQuantityModal(false);
      setQuantityItem(null);

      await loadData();
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to update stock quantity."
      );
    }
  };

  // ---------------------------------
  // Quick Increase / Decrease
  // ---------------------------------

  const changeQuantity = async (
    item: InventoryItem,
    amount: number
  ) => {
    const newQuantity =
      item.quantity + amount;

    if (newQuantity < 0) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await updateInventoryQuantity(
        item.id,
        newQuantity
      );

      setMessage(
        amount > 0
          ? "Stock increased successfully."
          : "Stock decreased successfully."
      );

      await loadData();
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to update stock quantity."
      );
    }
  };

  // ---------------------------------
  // Delete
  // ---------------------------------

  const openDeleteModal = (
    item: InventoryItem
  ) => {
    setInventoryToDelete(item);
    setShowDeleteModal(true);
    setMessage("");
    setError("");
  };

  const handleDelete = async () => {
    if (!inventoryToDelete) return;

    try {
      await deleteInventory(
        inventoryToDelete.id
      );

      setMessage(
        "Inventory record deleted successfully."
      );

      setShowDeleteModal(false);
      setInventoryToDelete(null);

      await loadData();
    } catch (err: any) {
      setError(
        err.message ||
          "Failed to delete inventory."
      );
    }
  };

  // ---------------------------------
  // Stock Status UI
  // ---------------------------------

  const renderStatus = (
    item: InventoryItem
  ) => {
    const status = getStockStatus(item);

    if (status === "out") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D85B70]/10 px-3 py-1.5 text-xs font-semibold text-[#D85B70]">
          <AlertTriangle size={13} />
          Out of Stock
        </span>
      );
    }

    if (status === "low") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C6A15B]/15 px-3 py-1.5 text-xs font-semibold text-[#9A762E]">
          <AlertTriangle size={13} />
          Low Stock
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#3E8065]/10 px-3 py-1.5 text-xs font-semibold text-[#3E8065]">
        <Check size={13} />
        Healthy
      </span>
    );
  };

  // ---------------------------------
  // Render
  // ---------------------------------

  return (
    <main className="min-h-screen bg-[#F7F5F2] p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ========================= */}
        {/* Header */}
        {/* ========================= */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#18181B] text-white">
                <Package size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-[#18181B]">
                  Inventory Management
                </h1>

                <p className="text-sm text-[#666]">
                  Track branch-wise clothing stock and reorder levels.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#D85B70] px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-[#c94d63]"
          >
            <Plus size={18} />
            Add Inventory
          </button>
        </div>

        {/* ========================= */}
        {/* Messages */}
        {/* ========================= */}

        {message && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#3E8065]/20 bg-[#3E8065]/10 px-4 py-3 text-sm font-medium text-[#3E8065]">
            <Check size={18} />
            {message}
          </div>
        )}

        {error &&
          !showModal &&
          !showDeleteModal &&
          !showQuantityModal && (
            <div className="mb-5 rounded-xl border border-[#D85B70]/20 bg-[#D85B70]/10 px-4 py-3 text-sm font-medium text-[#D85B70]">
              {error}
            </div>
          )}

        {/* ========================= */}
        {/* Summary Cards */}
        {/* ========================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Total Stock */}

          <div className="rounded-2xl border border-[#E4DED5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#18181B] text-white">
                <Package size={19} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                Total Stock
              </span>
            </div>

            <p className="text-2xl font-bold text-[#18181B]">
              {totalStock.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-[#777]">
              Units across all branches
            </p>
          </div>

          {/* Low Stock */}

          <div className="rounded-2xl border border-[#E4DED5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C6A15B]/15 text-[#9A762E]">
                <AlertTriangle size={19} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                Low Stock
              </span>
            </div>

            <p className="text-2xl font-bold text-[#18181B]">
              {lowStockCount}
            </p>

            <p className="mt-1 text-xs text-[#777]">
              Items below reorder level
            </p>
          </div>

          {/* Out of Stock */}

          <div className="rounded-2xl border border-[#E4DED5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D85B70]/10 text-[#D85B70]">
                <AlertTriangle size={19} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                Out of Stock
              </span>
            </div>

            <p className="text-2xl font-bold text-[#18181B]">
              {outOfStockCount}
            </p>

            <p className="mt-1 text-xs text-[#777]">
              Items with zero stock
            </p>
          </div>

          {/* Branches */}

          <div className="rounded-2xl border border-[#E4DED5] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE7DE] text-[#18181B]">
                <Building2 size={19} />
              </div>

              <span className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                Branches
              </span>
            </div>

            <p className="text-2xl font-bold text-[#18181B]">
              {activeBranchCount}
            </p>

            <p className="mt-1 text-xs text-[#777]">
              Active store branches
            </p>
          </div>
        </div>

        {/* ========================= */}
        {/* Filters */}
        {/* ========================= */}

        <div className="mb-6 rounded-2xl border border-[#E4DED5] bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">

            {/* Search */}

            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]"
              />

              <input
                type="text"
                placeholder="Search inventory..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-[#DED8CF] bg-[#FDFCFB] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#D85B70]"
              />
            </div>

            {/* Branch */}

            <div className="relative">
              <select
                value={branchFilter}
                onChange={(event) =>
                  setBranchFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-[#DED8CF] bg-[#FDFCFB] px-3 py-3 pr-10 text-sm outline-none focus:border-[#D85B70]"
              >
                <option value="all">
                  All Branches
                </option>

                {branches.map((branch) => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name} - {branch.city}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]"
              />
            </div>

            {/* Status */}

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value
                  )
                }
                className="w-full appearance-none rounded-xl border border-[#DED8CF] bg-[#FDFCFB] px-3 py-3 pr-10 text-sm outline-none focus:border-[#D85B70]"
              >
                <option value="all">
                  All Stock Status
                </option>

                <option value="healthy">
                  Healthy
                </option>

                <option value="low">
                  Low Stock
                </option>

                <option value="out">
                  Out of Stock
                </option>
              </select>

              <ChevronDown
                size={17}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#777]"
              />
            </div>
          </div>
        </div>

        {/* ========================= */}
        {/* Inventory Table */}
        {/* ========================= */}

        <div className="overflow-hidden rounded-2xl border border-[#E4DED5] bg-white shadow-sm">

          {loading ? (
            <div className="p-12 text-center text-sm text-[#777]">
              Loading inventory...
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="p-12 text-center">
              <Package
                size={38}
                className="mx-auto mb-3 text-[#C6A15B]"
              />

              <h3 className="mb-1 text-lg font-semibold text-[#18181B]">
                No inventory found
              </h3>

              <p className="text-sm text-[#777]">
                Add your first inventory record.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left">

                  <thead className="border-b border-[#E8E2DA] bg-[#FAF8F5]">
                    <tr>
                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Product
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Branch
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Variant
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Stock
                      </th>

                      <th className="px-5 py-4 text-xs font-bold uppercase tracking-wide text-[#777]">
                        Reorder
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
                    {filteredInventory.map(
                      (item) => {
                        const details =
                          getVariantDetails(
                            item.variantId
                          );

                        return (
                          <tr
                            key={item.id}
                            className="transition hover:bg-[#FDFBF8]"
                          >
                            {/* Product */}

                            <td className="px-5 py-4">
                              <div className="font-semibold text-[#18181B]">
                                {getProductName(
                                  item.variantId
                                )}
                              </div>

                              <div className="mt-1 font-mono text-xs text-[#888]">
                                {details.sku}
                              </div>
                            </td>

                            {/* Branch */}

                            <td className="px-5 py-4">
                              <div className="font-semibold text-[#18181B]">
                                {getBranchName(
                                  item.branchId
                                )}
                              </div>

                              <div className="mt-1 text-xs text-[#777]">
                                {getBranch(
                                  item.branchId
                                )?.city || "-"}
                              </div>
                            </td>

                            {/* Variant */}

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center rounded-lg bg-[#EDE7DE] px-3 py-1.5 text-xs font-semibold text-[#18181B]">
                                  {details.size}
                                </span>

                                <span className="inline-flex items-center rounded-lg bg-[#F5F1EB] px-3 py-1.5 text-xs font-medium text-[#555]">
                                  {details.color}
                                </span>
                              </div>
                            </td>

                            {/* Stock */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    changeQuantity(
                                      item,
                                      -1
                                    )
                                  }
                                  disabled={
                                    item.quantity === 0
                                  }
                                  className="rounded-lg border border-[#DED8CF] p-1.5 text-[#555] transition hover:border-[#D85B70] hover:text-[#D85B70] disabled:cursor-not-allowed disabled:opacity-40"
                                  title="Decrease stock"
                                >
                                  <Minus size={14} />
                                </button>

                                <button
                                  onClick={() =>
                                    openQuantityModal(
                                      item
                                    )
                                  }
                                  className="min-w-12 rounded-lg bg-[#18181B] px-3 py-1.5 text-sm font-bold text-white transition hover:bg-[#303035]"
                                  title="Edit quantity"
                                >
                                  {item.quantity}
                                </button>

                                <button
                                  onClick={() =>
                                    changeQuantity(
                                      item,
                                      1
                                    )
                                  }
                                  className="rounded-lg border border-[#DED8CF] p-1.5 text-[#555] transition hover:border-[#3E8065] hover:text-[#3E8065]"
                                  title="Increase stock"
                                >
                                  <PlusIcon
                                    size={14}
                                  />
                                </button>
                              </div>
                            </td>

                            {/* Reorder */}

                            <td className="px-5 py-4">
                              <span className="font-semibold text-[#18181B]">
                                {item.reorderLevel}
                              </span>
                            </td>

                            {/* Status */}

                            <td className="px-5 py-4">
                              {renderStatus(item)}
                            </td>

                            {/* Actions */}

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">

                                <button
                                  onClick={() =>
                                    openEditModal(
                                      item
                                    )
                                  }
                                  title="Edit"
                                  className="rounded-lg border border-[#DED8CF] p-2 text-[#555] transition hover:border-[#C6A15B] hover:text-[#C6A15B]"
                                >
                                  <Pencil
                                    size={16}
                                  />
                                </button>

                                <button
                                  onClick={() =>
                                    openQuantityModal(
                                      item
                                    )
                                  }
                                  title="Update quantity"
                                  className="rounded-lg border border-[#DED8CF] p-2 text-[#555] transition hover:border-[#3E8065] hover:text-[#3E8065]"
                                >
                                  <RefreshCw
                                    size={16}
                                  />
                                </button>

                                <button
                                  onClick={() =>
                                    openDeleteModal(
                                      item
                                    )
                                  }
                                  title="Delete"
                                  className="rounded-lg border border-[#DED8CF] p-2 text-[#555] transition hover:border-[#D85B70] hover:text-[#D85B70]"
                                >
                                  <Trash2
                                    size={16}
                                  />
                                </button>

                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* ========================= */}
              {/* Mobile Cards */}
              {/* ========================= */}

              <div className="space-y-3 p-4 md:hidden">
                {filteredInventory.map(
                  (item) => {
                    const details =
                      getVariantDetails(
                        item.variantId
                      );

                    return (
                      <div
                        key={item.id}
                        className="rounded-xl border border-[#E5DED5] bg-[#FDFBF8] p-4"
                      >

                        {/* Top */}

                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-[#18181B]">
                              {getProductName(
                                item.variantId
                              )}
                            </h3>

                            <p className="mt-1 font-mono text-xs text-[#777]">
                              {details.sku}
                            </p>
                          </div>

                          {renderStatus(item)}
                        </div>

                        {/* Branch */}

                        <div className="mb-3 flex items-center gap-2 text-sm text-[#555]">
                          <Building2
                            size={15}
                            className="text-[#C6A15B]"
                          />

                          <span className="font-medium">
                            {getBranchName(
                              item.branchId
                            )}
                          </span>

                          <span className="text-[#999]">
                            •
                          </span>

                          <span>
                            {getBranch(
                              item.branchId
                            )?.city || "-"}
                          </span>
                        </div>

                        {/* Variant Details */}

                        <div className="mb-4 grid grid-cols-3 gap-2">

                          <div className="rounded-lg bg-[#EDE7DE] p-2">
                            <p className="text-[10px] uppercase text-[#888]">
                              Size
                            </p>

                            <p className="font-semibold text-[#18181B]">
                              {details.size}
                            </p>
                          </div>

                          <div className="rounded-lg bg-[#EDE7DE] p-2">
                            <p className="text-[10px] uppercase text-[#888]">
                              Color
                            </p>

                            <p className="font-semibold text-[#18181B]">
                              {details.color}
                            </p>
                          </div>

                          <div className="rounded-lg bg-[#EDE7DE] p-2">
                            <p className="text-[10px] uppercase text-[#888]">
                              Reorder
                            </p>

                            <p className="font-semibold text-[#18181B]">
                              {item.reorderLevel}
                            </p>
                          </div>

                        </div>

                        {/* Quantity */}

                        <div className="mb-4 rounded-xl border border-[#E5DED5] bg-white p-3">

                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-[#888]">
                              Current Stock
                            </span>

                            <span className="text-lg font-bold text-[#18181B]">
                              {item.quantity}
                            </span>
                          </div>

                          <div className="flex items-center justify-end gap-2">

                            <button
                              onClick={() =>
                                changeQuantity(
                                  item,
                                  -1
                                )
                              }
                              disabled={
                                item.quantity === 0
                              }
                              className="rounded-lg border border-[#DED8CF] p-2 text-[#555] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <Minus size={15} />
                            </button>

                            <button
                              onClick={() =>
                                openQuantityModal(
                                  item
                                )
                              }
                              className="rounded-lg bg-[#18181B] px-4 py-2 text-xs font-semibold text-white"
                            >
                              Set Quantity
                            </button>

                            <button
                              onClick={() =>
                                changeQuantity(
                                  item,
                                  1
                                )
                              }
                              className="rounded-lg border border-[#DED8CF] p-2 text-[#555]"
                            >
                              <PlusIcon size={15} />
                            </button>

                          </div>
                        </div>

                        {/* Actions */}

                        <div className="flex justify-end gap-2">

                          <button
                            onClick={() =>
                              openEditModal(item)
                            }
                            className="rounded-lg border border-[#DED8CF] p-2 text-[#555]"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() =>
                              openDeleteModal(item)
                            }
                            className="rounded-lg border border-[#DED8CF] p-2 text-[#555]"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>

                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}
        </div>

        {/* Results */}

        {!loading && (
          <p className="mt-4 text-sm text-[#777]">
            Showing{" "}
            {filteredInventory.length} of{" "}
            {inventory.length} inventory records
          </p>
        )}
      </div>

      {/* ================================================= */}
      {/* Add / Edit Inventory Modal */}
      {/* ================================================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#E8E2DA] px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-[#18181B]">
                  {editingInventory
                    ? "Edit Inventory"
                    : "Add Inventory"}
                </h2>

                <p className="mt-1 text-sm text-[#777]">
                  Manage branch stock and reorder levels.
                </p>
              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="rounded-lg p-2 text-[#777] hover:bg-[#F5F1EB]"
              >
                <X size={20} />
              </button>

            </div>

            {/* Form */}

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

              {/* Branch */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#333]">
                  Branch
                </label>

                <select
                  value={form.branchId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      branchId:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                >
                  <option value="">
                    Select Branch
                  </option>

                  {branches
                    .filter(
                      (branch) =>
                        branch.isActive
                    )
                    .map((branch) => (
                      <option
                        key={branch.id}
                        value={branch.id}
                      >
                        {branch.name} -{" "}
                        {branch.city}
                      </option>
                    ))}
                </select>
              </div>

              {/* Variant */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#333]">
                  Product Variant
                </label>

                <select
                  value={form.variantId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      variantId:
                        event.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                >
                  <option value="">
                    Select Product Variant
                  </option>

                  {variants
                    .filter(
                      (variant) =>
                        variant.isActive
                    )
                    .map((variant) => (
                      <option
                        key={variant.id}
                        value={variant.id}
                      >
                        {getProductName(
                          variant.id
                        )}{" "}
                        • {variant.size} •{" "}
                        {variant.color} •{" "}
                        {variant.sku}
                      </option>
                    ))}
                </select>
              </div>

              {/* Quantity + Reorder */}

              <div className="grid gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="50"
                    value={form.quantity}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        quantity:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    Reorder Level
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    placeholder="5"
                    value={
                      form.reorderLevel
                    }
                    onChange={(event) =>
                      setForm({
                        ...form,
                        reorderLevel:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />

                  <p className="mt-1 text-xs text-[#888]">
                    Low-stock warning starts at this level.
                  </p>
                </div>

              </div>

              {/* Buttons */}

              <div className="flex justify-end gap-3 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setShowModal(false)
                  }
                  className="rounded-xl border border-[#DED8CF] px-5 py-3 text-sm font-semibold text-[#555] transition hover:bg-[#F7F3EE]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#D85B70] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#c94d63]"
                >
                  {editingInventory
                    ? "Save Changes"
                    : "Add Inventory"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================= */}
      {/* Quick Quantity Modal */}
      {/* ================================================= */}

      {showQuantityModal &&
        quantityItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-[#E8E2DA] px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-[#18181B]">
                    Update Stock
                  </h2>

                  <p className="mt-1 text-sm text-[#777]">
                    {getProductName(
                      quantityItem.variantId
                    )}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowQuantityModal(
                      false
                    );
                    setQuantityItem(null);
                  }}
                  className="rounded-lg p-2 text-[#777] hover:bg-[#F5F1EB]"
                >
                  <X size={20} />
                </button>

              </div>

              <form
                onSubmit={
                  handleQuantityUpdate
                }
                className="space-y-5 p-6"
              >

                {error && (
                  <div className="rounded-xl bg-[#D85B70]/10 px-4 py-3 text-sm font-medium text-[#D85B70]">
                    {error}
                  </div>
                )}

                <div className="rounded-xl bg-[#F7F3EE] p-4">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#888]">
                        Current Stock
                      </p>

                      <p className="mt-1 text-2xl font-bold text-[#18181B]">
                        {
                          quantityItem.quantity
                        }
                      </p>
                    </div>

                    <Package
                      size={28}
                      className="text-[#C6A15B]"
                    />
                  </div>

                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#333]">
                    New Quantity
                  </label>

                  <input
                    autoFocus
                    type="number"
                    min="0"
                    step="1"
                    value={quantityValue}
                    onChange={(event) =>
                      setQuantityValue(
                        event.target.value
                      )
                    }
                    className="w-full rounded-xl border border-[#DED8CF] bg-white px-4 py-3 text-sm outline-none focus:border-[#D85B70]"
                  />
                </div>

                <div className="flex justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setShowQuantityModal(
                        false
                      );
                      setQuantityItem(null);
                    }}
                    className="rounded-xl border border-[#DED8CF] px-5 py-3 text-sm font-semibold text-[#555]"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-[#D85B70] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c94d63]"
                  >
                    Update Stock
                  </button>

                </div>
              </form>
            </div>
          </div>
        )}

      {/* ================================================= */}
      {/* Delete Confirmation */}
      {/* ================================================= */}

      {showDeleteModal &&
        inventoryToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D85B70]/10 text-[#D85B70]">
                <Trash2 size={22} />
              </div>

              <h2 className="mb-2 text-xl font-bold text-[#18181B]">
                Delete Inventory?
              </h2>

              <p className="mb-6 text-sm leading-6 text-[#666]">
                Are you sure you want to delete the inventory record for{" "}
                <strong>
                  {getProductName(
                    inventoryToDelete.variantId
                  )}
                </strong>{" "}
                at{" "}
                <strong>
                  {getBranchName(
                    inventoryToDelete.branchId
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
                    setShowDeleteModal(
                      false
                    );
                    setInventoryToDelete(
                      null
                    );
                  }}
                  className="rounded-xl border border-[#DED8CF] px-5 py-3 text-sm font-semibold text-[#555]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  className="rounded-xl bg-[#D85B70] px-5 py-3 text-sm font-semibold text-white hover:bg-[#c94d63]"
                >
                  Delete Inventory
                </button>

              </div>
            </div>
          </div>
        )}
    </main>
  );
}