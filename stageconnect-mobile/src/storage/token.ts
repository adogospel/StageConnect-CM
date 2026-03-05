import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "sc_token";

export const saveToken = (token: string) => AsyncStorage.setItem(TOKEN_KEY, token);
export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const clearToken = () => AsyncStorage.removeItem(TOKEN_KEY);