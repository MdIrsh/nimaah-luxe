/**
 * Email Notification Service (Simulation / Nodemailer ready)
 */
export const sendOrderConfirmationEmail = async (order, user) => {
  console.log(`[Email Service] Order Confirmation sent to ${user.email} for Order #${order._id}`);
  return true;
};

export const sendAdminOrderNotification = async (order) => {
  console.log(`[Email Service] Admin notified of new incoming Order #${order._id}`);
  return true;
};

export const sendShippingNotification = async (order, user) => {
  console.log(`[Email Service] Shipping notice sent to ${user.email}. Tracking #${order.trackingNumber}`);
  return true;
};
