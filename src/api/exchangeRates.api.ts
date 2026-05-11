import api from "./axiosInstance";

export const getExchangeRates = async () => {
  return api.get("/admin/exchange-rates");
};

export const createExchangeRate = (data: { currency_name: string; rate: number; is_default: boolean }) => {
  return api.post("/admin/exchange-rates", data);
};

export const updateExchangeRate = (id: number, data: { currency_name: string; rate: number; is_default: boolean }) => {
  return api.put(`/admin/exchange-rates/${id}`, data);
};

export const deleteExchangeRate = (id: number) => {
  return api.delete(`/admin/exchange-rates/${id}`);
};
