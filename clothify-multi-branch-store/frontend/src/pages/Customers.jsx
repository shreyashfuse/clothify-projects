import { useEffect, useState } from "react";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [editingCustomer, setEditingCustomer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  // =========================
  // LOAD CUSTOMERS
  // =========================
  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/customers",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load customers"
        );
      }

      setCustomers(data);
    } catch (error) {
      console.error("Load customers error:", error);
      setError(error.message || "Unable to load customers");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FORM INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =========================
  // ADD / UPDATE CUSTOMER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const token = localStorage.getItem("token");

      const url = editingCustomer
        ? `http://localhost:5000/api/customers/${editingCustomer.id}`
        : "http://localhost:5000/api/customers";

      const method = editingCustomer ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            (editingCustomer
              ? "Failed to update customer"
              : "Failed to create customer")
        );
      }

      if (editingCustomer) {
        // Update customer in table
        setCustomers((previousCustomers) =>
          previousCustomers.map((customer) =>
            customer.id === editingCustomer.id
              ? data
              : customer
          )
        );
      } else {
        // Add new customer
        setCustomers((previousCustomers) => [
          ...previousCustomers,
          data,
        ]);
      }

      // Reset
      setFormData({
        name: "",
        phone: "",
        email: "",
        address: "",
      });

      setEditingCustomer(null);
      setShowForm(false);
    } catch (error) {
      console.error("Customer save error:", error);

      setError(
        error.message || "Unable to save customer"
      );
    }
  };

  // =========================
  // EDIT CUSTOMER
  // =========================
  const handleEdit = (customer) => {
    setEditingCustomer(customer);

    setFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.address || "",
    });

    setShowForm(true);
    setError("");
  };

  // =========================
  // DELETE CUSTOMER
  // =========================
  const handleDelete = async (customerId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/customers/${customerId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete customer"
        );
      }

      // Remove customer from table
      setCustomers((previousCustomers) =>
        previousCustomers.filter(
          (customer) => customer.id !== customerId
        )
      );
    } catch (error) {
      console.error("Delete customer error:", error);

      setError(
        error.message || "Unable to delete customer"
      );
    }
  };

  // =========================
  // CANCEL FORM
  // =========================
  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);

    setFormData({
      name: "",
      phone: "",
      email: "",
      address: "",
    });

    setError("");
  };

  // =========================
  // SEARCH
  // =========================
  const filteredCustomers = customers.filter(
    (customer) => {
      const search = searchTerm.toLowerCase();

      return (
        customer.name
          ?.toLowerCase()
          .includes(search) ||
        customer.phone
          ?.toLowerCase()
          .includes(search) ||
        customer.email
          ?.toLowerCase()
          .includes(search) ||
        customer.address
          ?.toLowerCase()
          .includes(search)
      );
    }
  );

  return (
    <div
      style={{
        padding: "30px",
        backgroundColor: "#f7f8fa",
        minHeight: "100vh",
      }}
    >
      {/* ================= HEADER ================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 6px 0",
              fontSize: "28px",
            }}
          >
            Customers
          </h1>

          <p
            style={{
              margin: 0,
              color: "#666",
            }}
          >
            Manage your store customers.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
              setError("");
            }
          }}
          style={{
            backgroundColor: "#111827",
            color: "white",
            border: "none",
            padding: "11px 18px",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            padding: "12px 15px",
            borderRadius: "7px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* ================= FORM ================= */}

      {showForm && (
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "10px",
            padding: "25px",
            marginBottom: "25px",
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
              fontSize: "20px",
            }}
          >
            {editingCustomer
              ? "Edit Customer"
              : "Add Customer"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              {/* NAME */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Customer Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                  style={{
                    width: "100%",
                    padding: "11px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* PHONE */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* EMAIL */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* ADDRESS */}

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontWeight: "600",
                    fontSize: "14px",
                  }}
                >
                  Address
                </label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  style={{
                    width: "100%",
                    padding: "11px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius: "6px",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* FORM BUTTONS */}

            <div
              style={{
                marginTop: "22px",
                display: "flex",
                gap: "10px",
              }}
            >
              <button
                type="submit"
                style={{
                  backgroundColor: "#111827",
                  color: "white",
                  border: "none",
                  padding: "11px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {editingCustomer
                  ? "Update Customer"
                  : "Save Customer"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  backgroundColor: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  padding: "11px 20px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= CUSTOMER TABLE ================= */}

      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}
      >
        {/* TABLE HEADER */}

        <div
          style={{
            padding: "18px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
              }}
            >
              Customer List
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#6b7280",
                fontSize: "13px",
              }}
            >
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
            style={{
              width: "280px",
              maxWidth: "100%",
              padding: "10px 12px",
              border:
                "1px solid #d1d5db",
              borderRadius: "6px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* TABLE CONTENT */}

        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <h3
              style={{
                marginBottom: "8px",
                color: "#374151",
              }}
            >
              No customers found
            </h3>

            <p style={{ margin: 0 }}>
              {searchTerm
                ? "Try a different search term."
                : "Add your first customer to get started."}
            </p>
          </div>
        ) : (
          <div
            style={{
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: "850px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor:
                      "#f9fafb",
                  }}
                >
                  <th style={headerStyle}>
                    ID
                  </th>

                  <th style={headerStyle}>
                    CUSTOMER NAME
                  </th>

                  <th style={headerStyle}>
                    PHONE
                  </th>

                  <th style={headerStyle}>
                    EMAIL
                  </th>

                  <th style={headerStyle}>
                    ADDRESS
                  </th>

                  <th
                    style={{
                      ...headerStyle,
                      textAlign: "center",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer) => (
                    <tr
                      key={customer.id}
                      style={{
                        borderBottom:
                          "1px solid #f0f0f0",
                      }}
                    >
                      <td style={cellStyle}>
                        {customer.id}
                      </td>

                      <td
                        style={{
                          ...cellStyle,
                          fontWeight: "600",
                          color: "#111827",
                        }}
                      >
                        {customer.name}
                      </td>

                      <td style={cellStyle}>
                        {customer.phone || "-"}
                      </td>

                      <td style={cellStyle}>
                        {customer.email || "-"}
                      </td>

                      <td style={cellStyle}>
                        {customer.address || "-"}
                      </td>

                      {/* ACTIONS */}

                      <td
                        style={{
                          ...cellStyle,
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "center",
                            gap: "8px",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleEdit(
                                customer
                              )
                            }
                            style={{
                              padding:
                                "6px 12px",
                              border:
                                "1px solid #d1d5db",
                              backgroundColor:
                                "white",
                              borderRadius:
                                "5px",
                              cursor:
                                "pointer",
                              fontSize:
                                "13px",
                            }}
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(
                                customer.id
                              )
                            }
                            style={{
                              padding:
                                "6px 12px",
                              border: "none",
                              backgroundColor:
                                "#fee2e2",
                              color: "#b91c1c",
                              borderRadius:
                                "5px",
                              cursor:
                                "pointer",
                              fontSize:
                                "13px",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// =========================
// TABLE STYLES
// =========================

const headerStyle = {
  textAlign: "left",
  padding: "14px 20px",
  fontSize: "13px",
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
};

const cellStyle = {
  padding: "15px 20px",
  color: "#374151",
};

export default Customers;