const cron = require('node-cron');
const Operator = require('../models/operator.model');
const Customer = require('../models/customer.model');

/**
 * @description This job runs every day at midnight (00:00).
 * It finds all operators whose subscription end date is in the past
 * and whose status is still 'active', and updates their status to 'expired'.
 * This effectively disables their login access via the check in the auth controller.
 */
const checkOperatorSubscriptions = () => {
  // Schedule to run at 00:01 AM every day.
  cron.schedule(
    '1 0 * * *',
    async () => {
      console.log('CRON: Running job: checkOperatorSubscriptions...');
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the day

        const result = await Operator.updateMany(
          {
            'subscription.endDate': { $lt: today },
            'subscription.status': 'active',
          },
          {
            $set: { 'subscription.status': 'expired' },
          }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `CRON: Deactivated ${result.modifiedCount} expired operator accounts.`
          );
        } else {
          console.log('CRON: No expired operator accounts found.');
        }
      } catch (error) {
        console.error('CRON ERROR in checkOperatorSubscriptions:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata', // Set to your server's timezone
    }
  );
};

/**
 * @description This job runs every day at 00:05 AM.
 * It finds all customers whose expiry date is in the past and who are
 * still marked as 'active', and updates their status to 'inactive'.
 */
const deactivateOverdueCustomers = () => {
  // Schedule to run at 00:05 AM every day.
  cron.schedule(
    '5 0 * * *',
    async () => {
      console.log('CRON: Running job: deactivateOverdueCustomers...');
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const result = await Customer.updateMany(
          {
            expiryDate: { $lt: today },
            active: true,
          },
          {
            $set: { active: false },
          }
        );

        if (result.modifiedCount > 0) {
          console.log(
            `CRON: Deactivated ${result.modifiedCount} overdue customer accounts.`
          );
        } else {
          console.log('CRON: No overdue customer accounts found.');
        }
      } catch (error) {
        console.error('CRON ERROR in deactivateOverdueCustomers:', error);
      }
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
    }
  );
};

/**
 * @description Initializes and starts all scheduled cron jobs for the application.
 */
const initCronJobs = () => {
  console.log('Initializing cron jobs...');
  checkOperatorSubscriptions();
  deactivateOverdueCustomers();
  console.log('Cron jobs initialized and scheduled.');
};

module.exports = { initCronJobs };
