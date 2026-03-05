import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../config/api";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("sc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});