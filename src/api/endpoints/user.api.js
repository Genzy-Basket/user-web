import apiClient from "../api.client";

/**
 * No try/catch here — apiClient interceptor already normalizes all errors
 * into proper Error objects with .message set. useApiCall catches them upstream.
 */
const userAPI = {
  getProfile: async () => {
    const response = await apiClient.get("/user/");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await apiClient.put("/user/", data);
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await apiClient.post("/user/address", addressData);
    return response.data;
  },

  updateAddress: async (addressData) => {
    const response = await apiClient.put("/user/address", addressData);
    return response.data;
  },

  addMember: async (memberData) => {
    const response = await apiClient.post("/user/members", memberData);
    return response.data;
  },

  updateMember: async (memberId, memberData) => {
    const response = await apiClient.put(
      `/user/members/${memberId}`,
      memberData,
    );
    return response.data;
  },

  removeMember: async (memberId) => {
    const response = await apiClient.delete(`/user/members/${memberId}`);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await apiClient.delete("/user/account");
    return response.data;
  },
};

export default userAPI;
