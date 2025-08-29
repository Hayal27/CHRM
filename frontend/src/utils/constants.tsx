// src/utils/constants.js

export const SUPPORT_WEBSITE = "https://www.lochina.com/report";
export const DEVELOPER_NAME = "Hayal Tamrat";

// Access environment variables using import.meta.env for Vite
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001"; // Use configured base URL or fallback

export const ITEMS_PER_PAGE = 10; // Default items per page for pagination