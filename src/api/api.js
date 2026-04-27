const BASE_URL = "http://localhost:8081/api";

// Users
export const getUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
};

export const createUser = async (data) => {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

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
  const res = await fetch(`${BASE_URL}/donations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};
