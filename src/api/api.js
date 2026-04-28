const normalizeBaseUrl = (url) => url.replace(/\/$/, "");

const getDefaultBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return normalizeBaseUrl(import.meta.env.VITE_API_URL);
  }

  if (typeof window === "undefined") {
    return "http://localhost:8081/api";
  }

  const { hostname, origin, port, protocol } = window.location;
  const isLocalHost = hostname === "localhost" || hostname === "127.0.0.1";
  const isViteDevServer = port === "5173" || port === "5174";

  if (isViteDevServer && !isLocalHost) {
    return `http://${hostname}:8081/api`;
  }

  if (isLocalHost) {
    return "http://localhost:8081/api";
  }

  if (protocol === "https:") {
    return `${origin}/api`;
  }

  return `http://${hostname}:8081/api`;
};

export const BASE_URL = getDefaultBaseUrl();

const getConnectionError = () =>
  new Error(`Unable to connect to the backend at ${BASE_URL}. Check VITE_API_URL and make sure the backend is reachable from this device.`);

// Users
export const getUsers = async () => {
  let res;
  try {
    res = await fetch(`${BASE_URL}/users`);
  } catch {
    throw getConnectionError();
  }

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
};

export const createUser = async (data) => {
  let res;
  try {
    res = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw getConnectionError();
  }

  if (!res.ok) {
    let message = "Failed to create user";
    try {
      const errorData = await res.json();
      message = errorData.message || message;
    } catch {
      // Ignore JSON parsing failures and keep the default message.
    }
    throw new Error(message);
  }

  return res.json();
};

// Donations
export const createDonation = async (data) => {
  let res;
  try {
    res = await fetch(`${BASE_URL}/donations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  } catch {
    throw getConnectionError();
  }

  return res.json();
};
