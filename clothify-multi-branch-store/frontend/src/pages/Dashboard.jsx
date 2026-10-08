import { useState } from "react";
import "../App.css";
import Customers from "./Customers";
import Users from "./Users";

function Dashboard() {
  
  const [showCustomers, setShowCustomers] = useState(false);
const [showUsers, setShowUsers] = useState(false);
  return (
    <div className="dashboard">

      {/* LEFT SIDEBAR */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <h2>Clothify</h2>
          <p>Store Management</p>
        </div>
        

        <nav className="sidebar-menu">
          <a href="#" className="active">Dashboard</a>
          <a href="#">Products</a>
          <a href="#">Categories</a>
          <a href="#">Inventory</a>
          <a href="#">Stock Transfer</a>
          <a
  href="#"
  onClick={(e) => {
  e.preventDefault();
  setShowCustomers(true);
  setShowUsers(false);
}}
>
  Customers
</a>
          <a href="#">POS / Billing</a>
          <a href="#">Sales</a>
          <a href="#">Invoices</a>
          <a href="#">Returns / Exchange</a>
          <a href="#">Reports</a>
          <a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    setShowUsers(true);
    setShowCustomers(false);
  }}
>
  Users & Roles
</a>
        </nav>
        <button
  className="logout-button"
  onClick={() => {
    localStorage.removeItem("token");
    window.location.reload();
  }}
>
  Logout
</button>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

  {showCustomers ? (
    <Customers />
  ) : showUsers ? (
    <Users />
  ) : (
    <>
      {/* HEADER */}
        <header className="dashboard-header">

          <div>
            <h1>Dashboard</h1>
            <p>Manage your clothing store from one place.</p>
          </div>


        </header>

        {/* CONTENT */}
        <section className="dashboard-content">

          {/* SEARCH */}
          <div className="dashboard-top">

            <div className="dashboard-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search dashboard..."
              />
            </div>

            <div className="dashboard-summary">

              <div className="summary-item">
                <span>Total Sales</span>
                <strong>₹0</strong>
              </div>

              <div className="summary-item summary-active">
                <span>Orders</span>
                <strong>0</strong>
              </div>

              <div className="summary-item summary-warning">
                <span>Low Stock</span>
                <strong>0</strong>
              </div>

            </div>

          </div>

          {/* STATISTICS */}
          <div className="stats-grid">

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">₹</div>
                <span>Today</span>
              </div>

              <h2>₹0</h2>
              <p>Total Sales</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">#</div>
                <span>Today</span>
              </div>

              <h2>0</h2>
              <p>Total Orders</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">C</div>
                <span>Customers</span>
              </div>

              <h2>0</h2>
              <p>Total Customers</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">P</div>
                <span>Products</span>
              </div>

              <h2>0</h2>
              <p>Total Products</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">!</div>
                <span className="warning-text">Attention</span>
              </div>

              <h2>0</h2>
              <p>Low Stock Products</p>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <div className="stat-icon">B</div>
                <span>Branches</span>
              </div>

              <h2>0</h2>
              <p>Total Branches</p>
            </div>

          </div>

          {/* BOTTOM SECTION */}
          <div className="dashboard-panels">

            <div className="dashboard-panel">

              <div className="panel-heading">
                <div>
                  <h2>Recent Sales</h2>
                  <p>Latest transactions from your stores.</p>
                </div>

                <button>View All</button>
              </div>

              <div className="empty-panel">
                No recent sales available.
              </div>

            </div>

            <div className="dashboard-panel">

              <div className="panel-heading">
                <div>
                  <h2>Low Stock Products</h2>
                  <p>Products that need attention.</p>
                </div>

                <button>View Inventory</button>
              </div>

              <div className="empty-panel">
                No low-stock products available.
              </div>

            </div>

          </div>

        </section>

            </>
  )}

      </main>

    </div>
  );
}

export default Dashboard;
