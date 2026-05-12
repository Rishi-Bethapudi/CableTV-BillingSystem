const rolePermissions = {
  field_agent: [
    'VIEW_CUSTOMERS',
    'COLLECT_PAYMENT',
    'VIEW_TRANSACTIONS',
    'VIEW_SUBSCRIPTIONS',
  ],

  collection_agent: [
    'VIEW_CUSTOMERS',
    'COLLECT_PAYMENT',
    'VIEW_TRANSACTIONS',
    'VIEW_SUBSCRIPTIONS',
  ],

  support_agent: ['VIEW_CUSTOMERS', 'MANAGE_TICKETS'],

  technical_agent: ['VIEW_CUSTOMERS', 'MANAGE_TICKETS'],

  manager: [
    'VIEW_CUSTOMERS',
    'VIEW_REPORTS',
    'VIEW_TRANSACTIONS',
    'MANAGE_TICKETS',
    'VIEW_SUBSCRIPTIONS',
  ],
};

const getDefaultPermissions = (role = 'field_agent') => {
  return rolePermissions[role] || rolePermissions.field_agent;
};

module.exports = {
  getDefaultPermissions,
};
