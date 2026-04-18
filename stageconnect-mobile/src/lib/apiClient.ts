import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ remplace par l'IP locale de ton PC
const BASE_URL = "http://192.168.100.238:5000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("sc_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});