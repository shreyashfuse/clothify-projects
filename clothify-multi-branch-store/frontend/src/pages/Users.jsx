import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CASHIER");

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to fetch users"
        );
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ADD USER
  const handleAddUser = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            password,
            role,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create user"
        );
      }

      setName("");
      setEmail("");
      setPassword("");
      setRole("CASHIER");
      setShowForm(false);

      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  // EDIT USER
  const handleEditUser = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/users/${editingUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name,
            email,
            role,
            ...(password ? { password } : {}),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update user"
        );
      }

      setEditingUser(null);
      setName("");
      setEmail("");
      setPassword("");
      setRole("CASHIER");

      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };
  // DELETE USER
  const handleDeleteUser = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/users/${id}`,
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
          data.message || "Failed to delete user"
        );
      }

      await fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };
  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1>Users & Roles</h1>
          <p>Manage Clothify users and their roles.</p>
        </div>

        <button
          onClick={() => {
            setEditingUser(null);
            setName("");
            setEmail("");
            setPassword("");
            setRole("CASHIER");
            setShowForm(!showForm);
          }}
          style={{
            padding: "10px 16px",
            cursor: "pointer",
          }}
        >
          {showForm ? "Cancel" : "+ Add User"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {/* FORM */}
      {(showForm || editingUser) && (
        <form
          onSubmit={
            editingUser
              ? handleEditUser
              : handleAddUser
          }
          style={{
            marginBottom: "25px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <h2>
            {editingUser
              ? "Edit User"
              : "Add New User"}
          </h2>

          {/* NAME */}
          <div style={{ marginBottom: "12px" }}>
            <label>Name</label>
            <br />

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
            />
          </div>

          {/* EMAIL */}
          <div style={{ marginBottom: "12px" }}>
            <label>Email</label>
            <br />

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          {/* PASSWORD */}
          <div style={{ marginBottom: "12px" }}>
            <label>
              Password{" "}
              {editingUser &&
                "(leave blank to keep current password)"}
            </label>

            <br />

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required={!editingUser}
            />
          </div>

          {/* ROLE */}
          <div style={{ marginBottom: "15px" }}>
            <label>Role</label>
            <br />

            <select
              value={role}
              onChange={(e) =>
                setRole(e.target.value)
              }
            >
              <option value="CASHIER">
                CASHIER
              </option>

              <option value="MANAGER">
                MANAGER
              </option>

              <option value="OWNER">
                OWNER
              </option>
            </select>
          </div>

          <button type="submit">
            {editingUser
              ? "Update User"
              : "Create User"}
          </button>
        </form>
      )}

      {/* USERS TABLE */}
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr>
              <th style={tableHeader}>ID</th>
              <th style={tableHeader}>Name</th>
              <th style={tableHeader}>Email</th>
              <th style={tableHeader}>Role</th>
              <th style={tableHeader}>Branch</th>
              <th style={tableHeader}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={tableCell}>
                  {user.id}
                </td>

                <td style={tableCell}>
                  {user.name}
                </td>

                <td style={tableCell}>
                  {user.email}
                </td>

                <td style={tableCell}>
                  {user.role}
                </td>

                <td style={tableCell}>
                  {user.branchId ||
                    "Not assigned"}
                </td>

                <td style={tableCell}>
  <button
    onClick={() => {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPassword("");
      setShowForm(false);
    }}
  >
    Edit
  </button>

  {" "}

  <button
    onClick={() => handleDeleteUser(user.id)}
  >
    Delete
  </button>
</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableHeader = {
  border: "1px solid #ddd",
  padding: "12px",
  textAlign: "left",
  backgroundColor: "#f5f5f5",
};

const tableCell = {
  border: "1px solid #ddd",
  padding: "12px",
};

export default Users;