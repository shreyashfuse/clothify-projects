"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Tag,
} from "lucide-react";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/lib/api";

type Category = {
  id: number;
  name: string;
  description: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryFormData = {
  name: string;
  description: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const [addForm, setAddForm] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [editForm, setEditForm] = useState<CategoryFormData>({
    name: "",
    description: "",
  });

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deletingCategory, setDeletingCategory] =
    useState<Category | null>(null);

  // ==========================================
  // LOAD CATEGORIES
  // ==========================================

  const loadCategories = async () => {
    try {
      setLoading(true);

      const result = await getCategories();

      setCategories(result.categories || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredCategories = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    if (!searchValue) {
      return categories;
    }

    return categories.filter((category) => {
      const name = category.name?.toLowerCase() || "";
      const description =
        category.description?.toLowerCase() || "";

      return (
        name.includes(searchValue) ||
        description.includes(searchValue)
      );
    });
  }, [categories, search]);

  // ==========================================
  // ADD CATEGORY
  // ==========================================

  const openAddModal = () => {
    setAddForm({
      name: "",
      description: "",
    });

    setAddError("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    if (adding) return;

    setShowAddModal(false);
    setAddError("");
  };

  const handleAddCategory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!addForm.name.trim()) {
      setAddError("Category name is required.");
      return;
    }

    try {
      setAdding(true);
      setAddError("");

      await createCategory({
        name: addForm.name.trim(),
        description: addForm.description.trim(),
      });

      setShowAddModal(false);

      setAddForm({
        name: "",
        description: "",
      });

      await loadCategories();
    } catch (error) {
      console.error("Error creating category:", error);

      setAddError(
        error instanceof Error
          ? error.message
          : "Failed to create category."
      );
    } finally {
      setAdding(false);
    }
  };

  // ==========================================
  // EDIT CATEGORY
  // ==========================================

  const openEditModal = (category: Category) => {
    setEditingCategory(category);

    setEditForm({
      name: category.name,
      description: category.description || "",
    });

    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (editing) return;

    setShowEditModal(false);
    setEditingCategory(null);
    setEditError("");
  };

  const handleEditCategory = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!editingCategory) return;

    if (!editForm.name.trim()) {
      setEditError("Category name is required.");
      return;
    }

    try {
      setEditing(true);
      setEditError("");

      await updateCategory(editingCategory.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
      });

      setShowEditModal(false);
      setEditingCategory(null);

      await loadCategories();
    } catch (error) {
      console.error("Error updating category:", error);

      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update category."
      );
    } finally {
      setEditing(false);
    }
  };

  // ==========================================
  // DELETE CATEGORY
  // ==========================================

  const openDeleteModal = (category: Category) => {
    setDeletingCategory(category);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletingCategory(null);
    setDeleteError("");
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      setDeleting(true);
      setDeleteError("");

      await deleteCategory(deletingCategory.id);

      setShowDeleteModal(false);
      setDeletingCategory(null);

      await loadCategories();
    } catch (error) {
      console.error("Error deleting category:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete category."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F7F5F2",
        color: "#18181B",
        padding: "32px",
      }}
    >
      {/* ==========================================
          HEADER
      ========================================== */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          marginBottom: "28px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "12px",
                background: "#18181B",
                color: "#F7F5F2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FolderOpen size={21} />
            </div>

            <h1
              style={{
                fontSize: "28px",
                fontWeight: 700,
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Category Management
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: "#6B6864",
              fontSize: "14px",
            }}
          >
            Organize your clothing products into easy-to-manage
            categories.
          </p>
        </div>

        <button
          onClick={openAddModal}
          style={{
            border: "none",
            background: "#D85B70",
            color: "white",
            padding: "12px 18px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 20px rgba(216, 91, 112, 0.20)",
          }}
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      {/* ==========================================
          SEARCH + SUMMARY
      ========================================== */}

      <div
        style={{
          background: "white",
          border: "1px solid #E6E0D8",
          borderRadius: "16px",
          padding: "18px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            position: "relative",
            flex: 1,
            minWidth: "260px",
            maxWidth: "500px",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8A8580",
            }}
          />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{
              width: "100%",
              height: "44px",
              border: "1px solid #DED8D0",
              borderRadius: "10px",
              padding: "0 14px 0 42px",
              outline: "none",
              fontSize: "14px",
              background: "#FBFAF8",
              color: "#18181B",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            color: "#6B6864",
          }}
        >
          <Tag size={17} />

          <span>
            <strong style={{ color: "#18181B" }}>
              {categories.length}
            </strong>{" "}
            {categories.length === 1
              ? "category"
              : "categories"}
          </span>
        </div>
      </div>

      {/* ==========================================
          CONTENT
      ========================================== */}

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              style={{
                height: "170px",
                background: "white",
                borderRadius: "16px",
                border: "1px solid #E6E0D8",
              }}
            />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <div
          style={{
            background: "white",
            border: "1px solid #E6E0D8",
            borderRadius: "18px",
            padding: "70px 30px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 16px",
              borderRadius: "18px",
              background: "#EDE7DE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C6A15B",
            }}
          >
            <FolderOpen size={27} />
          </div>

          <h2
            style={{
              margin: "0 0 8px",
              fontSize: "19px",
            }}
          >
            {search
              ? "No categories found"
              : "No categories yet"}
          </h2>

          <p
            style={{
              margin: 0,
              color: "#77716B",
              fontSize: "14px",
            }}
          >
            {search
              ? "Try a different search term."
              : "Create your first category to get started."}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "18px",
          }}
        >
          {filteredCategories.map((category, index) => (
            <div
              key={category.id}
              style={{
                background: "white",
                border: "1px solid #E6E0D8",
                borderRadius: "18px",
                padding: "22px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Accent */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "4px",
                  background:
                    index % 3 === 0
                      ? "#D85B70"
                      : index % 3 === 1
                      ? "#C6A15B"
                      : "#3E8065",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: "#EDE7DE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#18181B",
                    flexShrink: 0,
                  }}
                >
                  <Tag size={22} />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "7px",
                  }}
                >
                  <button
                    onClick={() => openEditModal(category)}
                    title="Edit category"
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid #DED8D0",
                      background: "#FBFAF8",
                      borderRadius: "9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#4E4A46",
                    }}
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => openDeleteModal(category)}
                    title="Delete category"
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "1px solid #E8CDD2",
                      background: "#FFF7F8",
                      borderRadius: "9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#C34E63",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h2
                style={{
                  margin: "0 0 8px",
                  fontSize: "19px",
                  fontWeight: 700,
                }}
              >
                {category.name}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#77716B",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  minHeight: "45px",
                }}
              >
                {category.description ||
                  "No description added for this category."}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ==========================================
          ADD CATEGORY MODAL
      ========================================== */}

      {showAddModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={modalTitleStyle}>Add Category</h2>
                <p style={modalSubtitleStyle}>
                  Create a new product category.
                </p>
              </div>

              <button
                onClick={closeAddModal}
                disabled={adding}
                style={closeButtonStyle}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleAddCategory}>
              <label style={labelStyle}>
                Category Name
              </label>

              <input
                type="text"
                value={addForm.name}
                onChange={(event) =>
                  setAddForm({
                    ...addForm,
                    name: event.target.value,
                  })
                }
                placeholder="e.g. Men's Wear"
                style={inputStyle}
                autoFocus
              />

              <label style={labelStyle}>
                Description
              </label>

              <textarea
                value={addForm.description}
                onChange={(event) =>
                  setAddForm({
                    ...addForm,
                    description: event.target.value,
                  })
                }
                placeholder="Enter category description..."
                rows={4}
                style={{
                  ...inputStyle,
                  height: "auto",
                  paddingTop: "12px",
                  resize: "vertical",
                }}
              />

              {addError && (
                <div style={errorStyle}>{addError}</div>
              )}

              <div style={modalActionsStyle}>
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={adding}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  style={primaryButtonStyle}
                >
                  {adding ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          EDIT CATEGORY MODAL
      ========================================== */}

      {showEditModal && editingCategory && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={modalHeaderStyle}>
              <div>
                <h2 style={modalTitleStyle}>Edit Category</h2>
                <p style={modalSubtitleStyle}>
                  Update category information.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                disabled={editing}
                style={closeButtonStyle}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleEditCategory}>
              <label style={labelStyle}>
                Category Name
              </label>

              <input
                type="text"
                value={editForm.name}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    name: event.target.value,
                  })
                }
                style={inputStyle}
                autoFocus
              />

              <label style={labelStyle}>
                Description
              </label>

              <textarea
                value={editForm.description}
                onChange={(event) =>
                  setEditForm({
                    ...editForm,
                    description: event.target.value,
                  })
                }
                rows={4}
                style={{
                  ...inputStyle,
                  height: "auto",
                  paddingTop: "12px",
                  resize: "vertical",
                }}
              />

              {editError && (
                <div style={errorStyle}>{editError}</div>
              )}

              <div style={modalActionsStyle}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={editing}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={editing}
                  style={primaryButtonStyle}
                >
                  {editing ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION MODAL
      ========================================== */}

      {showDeleteModal && deletingCategory && (
        <div style={overlayStyle}>
          <div
            style={{
              ...modalStyle,
              maxWidth: "430px",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "15px",
                background: "#FFF0F2",
                color: "#C34E63",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "18px",
              }}
            >
              <Trash2 size={23} />
            </div>

            <h2 style={modalTitleStyle}>
              Delete Category?
            </h2>

            <p
              style={{
                color: "#6B6864",
                fontSize: "14px",
                lineHeight: 1.6,
                margin: "8px 0 0",
              }}
            >
              Are you sure you want to delete{" "}
              <strong style={{ color: "#18181B" }}>
                {deletingCategory.name}
              </strong>
              ? This action cannot be undone.
            </p>

            {deleteError && (
              <div style={errorStyle}>{deleteError}</div>
            )}

            <div style={modalActionsStyle}>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteCategory}
                disabled={deleting}
                style={{
                  ...primaryButtonStyle,
                  background: "#C34E63",
                }}
              >
                {deleting ? "Deleting..." : "Delete Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SHARED STYLES
// ==========================================

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(24, 24, 27, 0.52)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: "500px",
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "26px",
  boxShadow: "0 25px 70px rgba(0, 0, 0, 0.20)",
};

const modalHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  marginBottom: "24px",
};

const modalTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "21px",
  fontWeight: 700,
  color: "#18181B",
};

const modalSubtitleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: "13px",
  color: "#77716B",
};

const closeButtonStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  border: "1px solid #DED8D0",
  background: "#FBFAF8",
  borderRadius: "9px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#55504B",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  marginBottom: "7px",
  color: "#3D3935",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "44px",
  border: "1px solid #DED8D0",
  borderRadius: "10px",
  padding: "0 13px",
  outline: "none",
  fontSize: "14px",
  background: "#FBFAF8",
  color: "#18181B",
  boxSizing: "border-box",
  marginBottom: "18px",
};

const errorStyle: React.CSSProperties = {
  background: "#FFF1F3",
  border: "1px solid #F0CDD3",
  color: "#B43F55",
  padding: "11px 13px",
  borderRadius: "9px",
  fontSize: "13px",
  marginBottom: "16px",
};

const modalActionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "6px",
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #DED8D0",
  background: "#FFFFFF",
  color: "#3D3935",
  padding: "11px 17px",
  borderRadius: "9px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "none",
  background: "#D85B70",
  color: "#FFFFFF",
  padding: "11px 18px",
  borderRadius: "9px",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};