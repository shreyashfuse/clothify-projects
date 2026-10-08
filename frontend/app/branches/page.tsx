"use client";

import { useEffect, useState } from "react";
import {
  Store,
  MapPin,
  Phone,
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Power,
} from "lucide-react";

import {
  getBranches,
  createBranch,
  updateBranch,
  updateBranchStatus,
  deleteBranch,
} from "@/lib/api";

type Branch = {
  id: number;
  name: string;
  city: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type BranchFormData = {
  name: string;
  city: string;
  address: string;
  phone: string;
};

const emptyForm: BranchFormData = {
  name: "",
  city: "",
  address: "",
  phone: "",
};

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  // Add branch
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] =
    useState<BranchFormData>(emptyForm);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // Edit branch
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBranchId, setEditingBranchId] =
    useState<number | null>(null);
  const [editFormData, setEditFormData] =
    useState<BranchFormData>(emptyForm);
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete branch
  const [showDeleteModal, setShowDeleteModal] =
    useState(false);
  const [deletingBranch, setDeletingBranch] =
    useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Status
  const [changingStatusId, setChangingStatusId] =
    useState<number | null>(null);

  // --------------------------------------------------
  // Load branches
  // --------------------------------------------------

  const loadBranches = async () => {
    try {
      setLoading(true);

      const result = await getBranches();

      setBranches(result.data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  // --------------------------------------------------
  // Search
  // --------------------------------------------------

  const filteredBranches = branches.filter((branch) => {
    const search = searchTerm.toLowerCase();

    return (
      branch.name.toLowerCase().includes(search) ||
      branch.city.toLowerCase().includes(search) ||
      (branch.address || "")
        .toLowerCase()
        .includes(search) ||
      (branch.phone || "").includes(search)
    );
  });

  // --------------------------------------------------
  // Add Branch
  // --------------------------------------------------

  const handleAddBranch = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setAddError("");

    if (!formData.name.trim()) {
      setAddError("Branch name is required.");
      return;
    }

    if (!formData.city.trim()) {
      setAddError("City is required.");
      return;
    }

    if (
      formData.phone &&
      !/^[0-9]{10}$/.test(formData.phone)
    ) {
      setAddError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    try {
      setAdding(true);

      await createBranch({
        name: formData.name.trim(),
        city: formData.city.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
      });

      setFormData(emptyForm);
      setShowAddModal(false);

      await loadBranches();
    } catch (error) {
      console.error("Error creating branch:", error);

      setAddError(
        error instanceof Error
          ? error.message
          : "Failed to create branch."
      );
    } finally {
      setAdding(false);
    }
  };

  const closeAddModal = () => {
    if (adding) return;

    setShowAddModal(false);
    setFormData(emptyForm);
    setAddError("");
  };

  // --------------------------------------------------
  // Edit Branch
  // --------------------------------------------------

  const openEditModal = (branch: Branch) => {
    setEditingBranchId(branch.id);

    setEditFormData({
      name: branch.name || "",
      city: branch.city || "",
      address: branch.address || "",
      phone: branch.phone || "",
    });

    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (updating) return;

    setShowEditModal(false);
    setEditingBranchId(null);
    setEditFormData(emptyForm);
    setEditError("");
  };

  const handleUpdateBranch = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setEditError("");

    if (editingBranchId === null) {
      setEditError("Invalid branch.");
      return;
    }

    if (!editFormData.name.trim()) {
      setEditError("Branch name is required.");
      return;
    }

    if (!editFormData.city.trim()) {
      setEditError("City is required.");
      return;
    }

    if (
      editFormData.phone &&
      !/^[0-9]{10}$/.test(editFormData.phone)
    ) {
      setEditError(
        "Phone number must contain exactly 10 digits."
      );
      return;
    }

    try {
      setUpdating(true);

      await updateBranch(editingBranchId, {
        name: editFormData.name.trim(),
        city: editFormData.city.trim(),
        address: editFormData.address.trim(),
        phone: editFormData.phone.trim(),
      });

      setShowEditModal(false);
      setEditingBranchId(null);
      setEditFormData(emptyForm);

      await loadBranches();
    } catch (error) {
      console.error("Error updating branch:", error);

      setEditError(
        error instanceof Error
          ? error.message
          : "Failed to update branch."
      );
    } finally {
      setUpdating(false);
    }
  };

  // --------------------------------------------------
  // Change Branch Status
  // --------------------------------------------------

  const handleStatusChange = async (
    branch: Branch
  ) => {
    try {
      setChangingStatusId(branch.id);

      await updateBranchStatus(
        branch.id,
        !branch.isActive
      );

      await loadBranches();
    } catch (error) {
      console.error(
        "Error updating branch status:",
        error
      );

      alert("Failed to update branch status.");
    } finally {
      setChangingStatusId(null);
    }
  };

  // --------------------------------------------------
  // Delete Branch
  // --------------------------------------------------

  const openDeleteModal = (branch: Branch) => {
    setDeletingBranch(branch);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletingBranch(null);
    setDeleteError("");
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranch) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await deleteBranch(deletingBranch.id);

      setShowDeleteModal(false);
      setDeletingBranch(null);

      await loadBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);

      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete branch."
      );
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#F7F5F2",
          padding: "40px",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              height: "38px",
              width: "220px",
              backgroundColor: "#EDE7DE",
              borderRadius: "10px",
              marginBottom: "12px",
            }}
          />

          <div
            style={{
              height: "20px",
              width: "360px",
              backgroundColor: "#EDE7DE",
              borderRadius: "8px",
              marginBottom: "35px",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "22px",
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                style={{
                  height: "220px",
                  backgroundColor: "#EDE7DE",
                  borderRadius: "18px",
                }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F5F2",
        color: "#18181B",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "46px",
                  height: "46px",
                  borderRadius: "13px",
                  backgroundColor: "#18181B",
                  color: "#F7F5F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Store size={23} />
              </div>

              <h1
                style={{
                  fontSize: "32px",
                  fontWeight: 800,
                  margin: 0,
                  letterSpacing: "-0.8px",
                }}
              >
                Branch Management
              </h1>
            </div>

            <p
              style={{
                margin: 0,
                color: "#666666",
                fontSize: "15px",
              }}
            >
              Manage all your clothing store branches
              from one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setFormData(emptyForm);
              setAddError("");
              setShowAddModal(true);
            }}
            style={{
              border: "none",
              backgroundColor: "#D85B70",
              color: "#FFFFFF",
              padding: "13px 20px",
              borderRadius: "11px",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow:
                "0 8px 18px rgba(216, 91, 112, 0.20)",
            }}
          >
            <Plus size={18} />
            Add Branch
          </button>
        </div>

        {/* ================================================= */}
        {/* SEARCH + SUMMARY */}
        {/* ================================================= */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "18px",
            marginBottom: "25px",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: "1 1 320px",
              maxWidth: "520px",
            }}
          >
            <Search
              size={19}
              style={{
                position: "absolute",
                left: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#888888",
              }}
            />

            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "13px 15px 13px 45px",
                borderRadius: "12px",
                border: "1px solid #DDD7CE",
                backgroundColor: "#FFFFFF",
                outline: "none",
                fontSize: "14px",
                color: "#18181B",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2DDD5",
                padding: "10px 15px",
                borderRadius: "11px",
                fontSize: "13px",
                color: "#666666",
              }}
            >
              Total:{" "}
              <strong style={{ color: "#18181B" }}>
                {branches.length}
              </strong>
            </div>

            <div
              style={{
                backgroundColor: "#EEF5F0",
                border: "1px solid #D5E6D9",
                padding: "10px 15px",
                borderRadius: "11px",
                fontSize: "13px",
                color: "#3E8065",
              }}
            >
              Active:{" "}
              <strong>
                {
                  branches.filter(
                    (branch) => branch.isActive
                  ).length
                }
              </strong>
            </div>

            <div
              style={{
                backgroundColor: "#F8F0E4",
                border: "1px solid #EADBC0",
                padding: "10px 15px",
                borderRadius: "11px",
                fontSize: "13px",
                color: "#9A7941",
              }}
            >
              Inactive:{" "}
              <strong>
                {
                  branches.filter(
                    (branch) => !branch.isActive
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* EMPTY SEARCH RESULT */}
        {/* ================================================= */}

        {filteredBranches.length === 0 && (
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5DED4",
              borderRadius: "18px",
              padding: "70px 30px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "62px",
                height: "62px",
                borderRadius: "50%",
                backgroundColor: "#EDE7DE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <Store size={28} color="#777777" />
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "20px",
                fontWeight: 750,
              }}
            >
              No branches found
            </h2>

            <p
              style={{
                margin: 0,
                color: "#777777",
                fontSize: "14px",
              }}
            >
              {searchTerm
                ? "Try searching with a different branch name or city."
                : "Start by adding your first store branch."}
            </p>
          </div>
        )}

        {/* ================================================= */}
        {/* BRANCH CARDS */}
        {/* ================================================= */}

        {filteredBranches.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "22px",
            }}
          >
            {filteredBranches.map((branch) => (
              <div
                key={branch.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5DED4",
                  borderRadius: "18px",
                  padding: "22px",
                  boxShadow:
                    "0 8px 25px rgba(24, 24, 27, 0.05)",
                  transition:
                    "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Card header */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "13px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        backgroundColor: "#EDE7DE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Store
                        size={21}
                        color="#18181B"
                      />
                    </div>

                    <div>
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "17px",
                          fontWeight: 750,
                          color: "#18181B",
                        }}
                      >
                        {branch.name}
                      </h2>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          marginTop: "4px",
                          color: "#777777",
                          fontSize: "13px",
                        }}
                      >
                        <MapPin size={14} />
                        {branch.city}
                      </div>
                    </div>
                  </div>

                  {/* Status */}

                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "6px 9px",
                      borderRadius: "999px",
                      fontSize: "11px",
                      fontWeight: 700,
                      backgroundColor: branch.isActive
                        ? "#EAF4ED"
                        : "#F3F0EC",
                      color: branch.isActive
                        ? "#3E8065"
                        : "#777777",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor:
                          branch.isActive
                            ? "#3E8065"
                            : "#999999",
                      }}
                    />

                    {branch.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                {/* Branch details */}

                <div
                  style={{
                    borderTop:
                      "1px solid #EEE9E2",
                    paddingTop: "16px",
                    minHeight: "78px",
                  }}
                >
                  {branch.address && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "9px",
                        color: "#666666",
                        fontSize: "13px",
                        marginBottom: "10px",
                      }}
                    >
                      <MapPin
                        size={16}
                        style={{
                          flexShrink: 0,
                          marginTop: "1px",
                        }}
                      />

                      <span>{branch.address}</span>
                    </div>
                  )}

                  {branch.phone && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "9px",
                        color: "#666666",
                        fontSize: "13px",
                      }}
                    >
                      <Phone size={16} />
                      <span>{branch.phone}</span>
                    </div>
                  )}

                  {!branch.address &&
                    !branch.phone && (
                      <span
                        style={{
                          color: "#999999",
                          fontSize: "13px",
                        }}
                      >
                        No additional details
                      </span>
                    )}
                </div>

                {/* Actions */}

                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "20px",
                    paddingTop: "16px",
                    borderTop:
                      "1px solid #EEE9E2",
                  }}
                >
                  {/* Edit */}

                  <button
                    type="button"
                    onClick={() =>
                      openEditModal(branch)
                    }
                    style={{
                      flex: 1,
                      border: "1px solid #DDD7CE",
                      backgroundColor: "#F7F5F2",
                      color: "#18181B",
                      padding: "10px 10px",
                      borderRadius: "9px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Pencil size={14} />
                    Edit
                  </button>

                  {/* Status */}

                  <button
                    type="button"
                    onClick={() =>
                      handleStatusChange(branch)
                    }
                    disabled={
                      changingStatusId === branch.id
                    }
                    style={{
                      flex: 1,
                      border: "1px solid #D5E6D9",
                      backgroundColor: "#EEF5F0",
                      color: "#3E8065",
                      padding: "10px 10px",
                      borderRadius: "9px",
                      cursor:
                        changingStatusId === branch.id
                          ? "not-allowed"
                          : "pointer",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      opacity:
                        changingStatusId === branch.id
                          ? 0.6
                          : 1,
                    }}
                  >
                    <Power size={14} />

                    {changingStatusId === branch.id
                      ? "Updating..."
                      : branch.isActive
                      ? "Deactivate"
                      : "Activate"}
                  </button>

                  {/* Delete */}

                  <button
                    type="button"
                    onClick={() =>
                      openDeleteModal(branch)
                    }
                    style={{
                      width: "42px",
                      border:
                        "1px solid #E8C9CF",
                      backgroundColor: "#FFF5F6",
                      color: "#D85B70",
                      padding: "10px",
                      borderRadius: "9px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    title="Delete branch"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =================================================== */}
      {/* ADD BRANCH MODAL */}
      {/* =================================================== */}

      {showAddModal && (
        <div
          onMouseDown={closeAddModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(24, 24, 27, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.20)",
            }}
          >
            {/* Modal header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  Add New Branch
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#777777",
                    fontSize: "13px",
                  }}
                >
                  Add a new clothing store branch.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={adding}
                style={{
                  border: "none",
                  backgroundColor: "#F7F5F2",
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBranch}>
              {/* Name */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                Branch Name *
              </label>

              <input
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    name: event.target.value,
                  })
                }
                placeholder="e.g. Pune Central Store"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "16px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {/* City */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                City *
              </label>

              <input
                type="text"
                value={formData.city}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    city: event.target.value,
                  })
                }
                placeholder="e.g. Pune"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "16px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {/* Address */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                Address
              </label>

              <textarea
                value={formData.address}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    address: event.target.value,
                  })
                }
                placeholder="Enter branch address"
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "16px",
                  outline: "none",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

              {/* Phone */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                Phone
              </label>

              <input
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    phone: event.target.value.replace(
                      /\D/g,
                      ""
                    ),
                  })
                }
                placeholder="10-digit phone number"
                maxLength={10}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "18px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {addError && (
                <div
                  style={{
                    backgroundColor: "#FFF5F6",
                    color: "#B83E55",
                    border:
                      "1px solid #EBC8CF",
                    padding: "10px 12px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  {addError}
                </div>
              )}

              {/* Buttons */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={adding}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border:
                      "1px solid #DDD7CE",
                    backgroundColor: "#F7F5F2",
                    color: "#18181B",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={adding}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor: "#D85B70",
                    color: "#FFFFFF",
                    borderRadius: "9px",
                    cursor: adding
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 700,
                    opacity: adding ? 0.7 : 1,
                  }}
                >
                  {adding
                    ? "Creating..."
                    : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* EDIT BRANCH MODAL */}
      {/* =================================================== */}

      {showEditModal && (
        <div
          onMouseDown={closeEditModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(24, 24, 27, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "520px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "28px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.20)",
            }}
          >
            {/* Header */}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    fontWeight: 800,
                  }}
                >
                  Edit Branch
                </h2>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    color: "#777777",
                    fontSize: "13px",
                  }}
                >
                  Update your branch information.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={updating}
                style={{
                  border: "none",
                  backgroundColor: "#F7F5F2",
                  width: "36px",
                  height: "36px",
                  borderRadius: "9px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateBranch}>
              {/* Name */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                Branch Name *
              </label>

              <input
                type="text"
                value={editFormData.name}
                onChange={(event) =>
                  setEditFormData({
                    ...editFormData,
                    name: event.target.value,
                  })
                }
                placeholder="Branch name"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "16px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {/* City */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                City *
              </label>

              <input
                type="text"
                value={editFormData.city}
                onChange={(event) =>
                  setEditFormData({
                    ...editFormData,
                    city: event.target.value,
                  })
                }
                placeholder="City"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "16px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {/* Address */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                Address
              </label>

              <textarea
                value={editFormData.address}
                onChange={(event) =>
                  setEditFormData({
                    ...editFormData,
                    address: event.target.value,
                  })
                }
                placeholder="Branch address"
                rows={3}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "16px",
                  outline: "none",
                  fontSize: "14px",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />

              {/* Phone */}

              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 700,
                  marginBottom: "7px",
                }}
              >
                Phone
              </label>

              <input
                type="tel"
                value={editFormData.phone}
                onChange={(event) =>
                  setEditFormData({
                    ...editFormData,
                    phone: event.target.value.replace(
                      /\D/g,
                      ""
                    ),
                  })
                }
                placeholder="10-digit phone number"
                maxLength={10}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 13px",
                  border:
                    "1px solid #DDD7CE",
                  borderRadius: "9px",
                  marginBottom: "18px",
                  outline: "none",
                  fontSize: "14px",
                }}
              />

              {editError && (
                <div
                  style={{
                    backgroundColor: "#FFF5F6",
                    color: "#B83E55",
                    border:
                      "1px solid #EBC8CF",
                    padding: "10px 12px",
                    borderRadius: "9px",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  {editError}
                </div>
              )}

              {/* Buttons */}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border:
                      "1px solid #DDD7CE",
                    backgroundColor: "#F7F5F2",
                    color: "#18181B",
                    borderRadius: "9px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "none",
                    backgroundColor: "#18181B",
                    color: "#FFFFFF",
                    borderRadius: "9px",
                    cursor: updating
                      ? "not-allowed"
                      : "pointer",
                    fontWeight: 700,
                    opacity: updating ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "7px",
                  }}
                >
                  <Check size={16} />

                  {updating
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* =================================================== */}

      {showDeleteModal && deletingBranch && (
        <div
          onMouseDown={closeDeleteModal}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor:
              "rgba(24, 24, 27, 0.60)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1100,
          }}
        >
          <div
            onMouseDown={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth: "430px",
              backgroundColor: "#FFFFFF",
              borderRadius: "20px",
              padding: "30px",
              boxShadow:
                "0 25px 70px rgba(0,0,0,0.25)",
              textAlign: "center",
            }}
          >
            {/* Delete icon */}

            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "50%",
                backgroundColor: "#FFF0F2",
                color: "#D85B70",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 18px",
              }}
            >
              <Trash2 size={25} />
            </div>

            <h2
              style={{
                margin: "0 0 8px",
                fontSize: "21px",
                fontWeight: 800,
              }}
            >
              Delete Branch?
            </h2>

            <p
              style={{
                margin: "0 auto 8px",
                color: "#555555",
                fontSize: "14px",
                lineHeight: 1.6,
                maxWidth: "350px",
              }}
            >
              Are you sure you want to delete
              this branch?
            </p>

            <p
              style={{
                margin: "0 0 20px",
                fontWeight: 800,
                fontSize: "15px",
                color: "#18181B",
              }}
            >
              "{deletingBranch.name}"
            </p>

            <div
              style={{
                backgroundColor: "#FFF8F8",
                border:
                  "1px solid #F0D5D9",
                borderRadius: "9px",
                padding: "10px 12px",
                marginBottom: "20px",
                color: "#9D5965",
                fontSize: "12px",
                lineHeight: 1.5,
              }}
            >
              This action cannot be undone.
            </div>

            {deleteError && (
              <div
                style={{
                  backgroundColor: "#FFF5F6",
                  color: "#B83E55",
                  border:
                    "1px solid #EBC8CF",
                  padding: "10px 12px",
                  borderRadius: "9px",
                  fontSize: "13px",
                  marginBottom: "16px",
                  textAlign: "left",
                }}
              >
                {deleteError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "12px",
                  border:
                    "1px solid #DDD7CE",
                  backgroundColor: "#F7F5F2",
                  color: "#18181B",
                  borderRadius: "9px",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteBranch}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: "none",
                  backgroundColor: "#D85B70",
                  color: "#FFFFFF",
                  borderRadius: "9px",
                  cursor: deleting
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: 700,
                  opacity: deleting ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                }}
              >
                <Trash2 size={15} />

                {deleting
                  ? "Deleting..."
                  : "Delete Branch"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}