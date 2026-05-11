import api from "./axiosInstance";

export const getCartItems = () => api.get("/CartItem");
export const addCartItem = (data: FormData) => api.post("/CartItem", data);
export const deleteCartItem = (id: number) => api.post(`/delete_CartItem/${id}`);
export const clearCart = () => api.delete("/CartItem");
