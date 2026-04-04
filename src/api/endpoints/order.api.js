import apiClient from "../api.client";

const orderAPI = {
  /**
   * Create a new order from the current user's cart.
   * For online payments, returns { order, razorpayOrderId, keyId }.
   * For COD, returns { order }.
   */
  createOrder: async (paymentMethod, customerNotes = null) => {
    const body = { paymentMethod };
    if (customerNotes) body.customerNotes = customerNotes;
    const response = await apiClient.post("/orders", body);
    return response.data;
  },

  /** Get a single order by its orderId string (e.g. "ORD12345678") */
  getOrder: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  /** Paginated list of the current user's orders */
  getUserOrders: async ({ page = 1, limit = 10, status } = {}) => {
    const params = { page, limit };
    if (status) params.status = status;
    const response = await apiClient.get("/orders", { params });
    return response.data;
  },

  /**
   * Lightweight status poll — returns { orderId, orderStatus, paymentStatus, totalAmount }
   * Call this after Razorpay checkout to check whether the webhook has confirmed the order.
   */
  getOrderStatus: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}/status`);
    return response.data;
  },

  /**
   * Manually verify payment with Razorpay (fallback if webhook was missed).
   * Call this after checkout if polling shows status still "pending".
   */
  verifyPayment: async (orderId) => {
    const response = await apiClient.post(`/orders/${orderId}/verify-payment`, {});
    return response.data;
  },

  /** Get/create Razorpay payment session for a COD order */
  getCodPaymentSession: async (orderId) => {
    const response = await apiClient.post(`/orders/${orderId}/cod-pay`, {});
    return response.data;
  },

  /** Cancel an order in pending or confirmed state */
  cancelOrder: async (orderId, reason) => {
    const response = await apiClient.post(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  },
};

export default orderAPI;
