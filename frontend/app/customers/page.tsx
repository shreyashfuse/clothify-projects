"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Customer = {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

type CustomerForm = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

const emptyForm: CustomerForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    null
  );
  const [formData, setFormData] = useState<CustomerForm>(emptyForm);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/customers", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load customers");
      }

      setCustomers(data);
    } catch (error) {
      console.error("Load customers error:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        setCustomers((previousCustomers) =>
          previousCustomers.map((customer) =>
            customer.id === editingCustomer.id ? data : customer
          )
        );
      } else {
        setCustomers((previousCustomers) => [
          ...previousCustomers,
          data,
        ]);
      }

      handleCancel();
    } catch (error) {
      console.error("Customer save error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to save customer"
      );
    }
  };

  const handleEdit = (customer: Customer) => {
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

  const handleDelete = async (customerId: number) => {
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
        throw new Error(data.message || "Failed to delete customer");
      }

      setCustomers((previousCustomers) =>
        previousCustomers.filter((customer) => customer.id !== customerId)
      );
    } catch (error) {
      console.error("Delete customer error:", error);

      setError(
        error instanceof Error ? error.message : "Unable to delete customer"
      );
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData(emptyForm);
  };

  const filteredCustomers = useMemo(() => {
    const search = searchTerm.toLowerCase();

    return customers.filter(
      (customer) =>
        customer.name?.toLowerCase().includes(search) ||
        customer.phone?.toLowerCase().includes(search) ||
        customer.email?.toLowerCase().includes(search) ||
        customer.address?.toLowerCase().includes(search)
    );
  }, [customers, searchTerm]);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
          <p className="mt-1 text-gray-600">
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
          className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {showForm ? "Cancel" : "+ Add Customer"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mb-5 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* FORM */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            {editingCustomer ? "Edit Customer" : "Add Customer"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <Input
                label="Customer Name *"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter customer name"
                required
              />

              <Input
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter address"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800"
              >
                {editingCustomer ? "Update Customer" : "Save Customer"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg bg-gray-200 px-5 py-3 text-gray-700 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOMER TABLE */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <h2 className="text-lg font-semibold">Customer List</h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""}
            </p>
          </div>

          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-72 max-w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-black"
          />
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <h3 className="mb-2 font-semibold text-gray-700">
              No customers found
            </h3>

            <p>
              {searchTerm
                ? "Try a different search term."
                : "Add your first customer to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="table-header">ID</th>
                  <th className="table-header">CUSTOMER NAME</th>
                  <th className="table-header">PHONE</th>
                  <th className="table-header">EMAIL</th>
                  <th className="table-header">ADDRESS</th>
                  <th className="table-header text-center">ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-gray-100"
                  >
                    <td className="table-cell">{customer.id}</td>

                    <td className="table-cell font-semibold text-gray-900">
                      {customer.name}
                    </td>

                    <td className="table-cell">
                      {customer.phone || "-"}
                    </td>

                    <td className="table-cell">
                      {customer.email || "-"}
                    </td>

                    <td className="table-cell">
                      {customer.address || "-"}
                    </td>

                    <td className="table-cell">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(customer)}
                          className="rounded border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(customer.id)}
                          className="rounded bg-red-100 px-3 py-1.5 text-sm text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-gray-300 px-3 py-3 outline-none focus:border-black"
      />
    </div>
  );
}