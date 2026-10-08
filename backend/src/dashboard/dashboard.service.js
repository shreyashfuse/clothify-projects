const db = require("../config/database");

async function getDashboardStats() {
  const customers = await db.orm.public.Customer.all();
const totalCustomers = customers.length;

  const products = await db.orm.public.Product.all();
const totalProducts = products.length;

const branches = await db.orm.public.Branch.all();
const totalBranches = branches.length;

const orders = await db.orm.public.Sale.all();
const totalOrders = orders.length;

  const sales = await db.orm.public.Sale
    .where({ status: "COMPLETED" })
    .all();

  const totalSales = sales.reduce((sum, sale) => {
    return sum + sale.total;
  }, 0);

  const inventory = await db.orm.public.Inventory.all();

  const lowStockProducts = inventory.filter((item) => {
    return item.quantity <= item.reorderLevel;
  }).length;

  return {
    totalSales,
    totalOrders,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    totalBranches,
  };
}

module.exports = {
  getDashboardStats,
};