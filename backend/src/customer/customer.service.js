const db = require("../config/database");

async function getAllCustomers() {
  return await db.orm.public.Customer.all();
}

async function createCustomer(data) {
  return await db.orm.public.Customer.create(data);
}

// Update customer
async function updateCustomer(id, data) {
  return await db.orm.public.Customer.update(
    {
      id: Number(id),
    },
    data
  );
}

// Delete customer
async function deleteCustomer(id) {
  return await db.orm.public.Customer.delete({
    id: Number(id),
  });
}

module.exports = {
  getAllCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};