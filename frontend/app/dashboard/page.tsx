"use client";

import { useState } from "react";

export default function DashboardPage() {
  const [showUsers, setShowUsers] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 p-6 text-white">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Clothify</h2>
          <p className="text-sm text-gray-400">Store Management</p>
        </div>

        <nav className="space-y-2">
          <a
            href="/dashboard"
            className="block rounded bg-gray-800 px-3 py-2"
          >
            Dashboard
          </a>

          <a
            href="/products"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Products
          </a>

          <a
            href="/categories"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Categories
          </a>

          <a
            href="/inventory"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Inventory
          </a>

          <button className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800">
            Stock Transfer
          </button>

          <a
            href="/customers"
            className="block rounded px-3 py-2 hover:bg-gray-800"
          >
            Customers
          </a>

          <button className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800">
            POS / Billing
          </button>

          <button className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800">
            Sales
          </button>

          <button className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800">
            Invoices
          </button>

          <button className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800">
            Returns / Exchange
          </button>

          <button className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800">
            Reports
          </button>

          <button
            onClick={() => setShowUsers(true)}
            className="block w-full rounded px-3 py-2 text-left hover:bg-gray-800"
          >
            Users & Roles
          </button>
        </nav>

        <button
          onClick={handleLogout}
          className="absolute bottom-6 left-6 right-6 rounded bg-red-600 px-4 py-2 font-medium hover:bg-red-700"
        >
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="ml-64 p-8">
        {showUsers ? (
          <div>
            <button
              onClick={() => setShowUsers(false)}
              className="mb-5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-100"
            >
              ← Back to Dashboard
            </button>

            <h1 className="mb-4 text-3xl font-bold">Users & Roles</h1>

            <p className="text-gray-600">
              User and role management will be connected here next.
            </p>
          </div>
        ) : (
          <>
            {/* HEADER */}
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard
              </h1>

              <p className="mt-1 text-gray-600">
                Manage your clothing store from one place.
              </p>
            </header>

            {/* SEARCH + SUMMARY */}
            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-xl bg-white p-5 shadow">
                <input
                  type="text"
                  placeholder="Search dashboard..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl bg-white p-4 shadow">
                  <span className="text-sm text-gray-500">
                    Total Sales
                  </span>

                  <strong className="mt-2 block text-xl">₹0</strong>
                </div>

                <div className="rounded-xl bg-white p-4 shadow">
                  <span className="text-sm text-gray-500">
                    Orders
                  </span>

                  <strong className="mt-2 block text-xl">0</strong>
                </div>

                <div className="rounded-xl bg-white p-4 shadow">
                  <span className="text-sm text-gray-500">
                    Low Stock
                  </span>

                  <strong className="mt-2 block text-xl">0</strong>
                </div>
              </div>
            </section>

            {/* STATISTICS */}
            <section className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard
                title="Total Sales"
                value="₹0"
                label="Today"
              />

              <StatCard
                title="Total Orders"
                value="0"
                label="Today"
              />

              <StatCard
                title="Total Customers"
                value="0"
                label="Customers"
              />

              <StatCard
                title="Total Products"
                value="0"
                label="Products"
              />

              <StatCard
                title="Low Stock Products"
                value="0"
                label="Attention"
              />

              <StatCard
                title="Total Branches"
                value="0"
                label="Branches"
              />
            </section>

            {/* BOTTOM PANELS */}
            <section className="grid gap-6 lg:grid-cols-2">
              <DashboardPanel
                title="Recent Sales"
                description="Latest transactions from your stores."
                emptyMessage="No recent sales available."
                button="View All"
              />

              <DashboardPanel
                title="Low Stock Products"
                description="Products that need attention."
                emptyMessage="No low-stock products available."
                button="View Inventory"
              />
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  label,
}: {
  title: string;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <span className="text-sm text-gray-500">{label}</span>

      <h2 className="mt-3 text-3xl font-bold text-gray-900">
        {value}
      </h2>

      <p className="mt-2 text-gray-600">{title}</p>
    </div>
  );
}

function DashboardPanel({
  title,
  description,
  emptyMessage,
  button,
}: {
  title: string;
  description: string;
  emptyMessage: string;
  button: string;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {description}
          </p>
        </div>

        <button className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100">
          {button}
        </button>
      </div>

      <div className="mt-6 rounded-lg bg-gray-50 p-8 text-center text-gray-500">
        {emptyMessage}
      </div>
    </div>
  );
}