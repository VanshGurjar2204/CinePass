import axiosInstance from "./axiosInstance";

export const paymentApi = {
  createCheckoutSession: (data) => axiosInstance.post("/payments/create-checkout-session", data),
  createPaymentIntent: (data) => axiosInstance.post("/payments/create-payment-intent", data),
  verify: (data) => axiosInstance.post("/payments/verify", data),
};

