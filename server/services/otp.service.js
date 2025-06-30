/**
 * @fileoverview OTP Service for sending One-Time Passwords.
 * In a production environment, this file would integrate with a real email
 * or SMS provider (e.g., Nodemailer, Twilio, SendGrid).
 * For this project, it simulates sending an OTP by logging it to the console.
 */

/**
 * Sends an OTP to a user's email address.
 * @param {string} email The recipient's email address.
 * @param {string} otp The One-Time Password to be sent.
 * @returns {Promise<void>} A promise that resolves when the operation is complete.
 */
const sendOtp = async (email, otp) => {
  try {
    // --- Production Integration (Example with Nodemailer) ---
    // const transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({
    //   from: '"Cable Billing System" <no-reply@yourdomain.com>',
    //   to: email,
    //   subject: 'Your Password Reset OTP',
    //   text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
    //   html: `<b>Your OTP is: ${otp}</b>. It is valid for 10 minutes.`
    // });
    // console.log(`OTP email sent successfully to ${email}.`);
    // ---------------------------------------------------------

    // --- Development Mock ---
    // In a development environment, we log the OTP to the console for easy access.
    console.log('--- OTP Service ---');
    console.log(`Simulating sending OTP to: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log('-------------------');

    // Simulate an async operation
    return Promise.resolve();
  } catch (error) {
    console.error('Error in OTP Service:', error);
    // In production, you might have more sophisticated error handling or fallbacks.
    return Promise.reject(new Error('Failed to send OTP.'));
  }
};

module.exports = {
  sendOtp,
};
