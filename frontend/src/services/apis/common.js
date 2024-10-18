const host = "http://localhost:3000/api";

// A helper function to parse the JSON response body.
const parseResponse = async (response) => {
  if (!response.ok) {
    const content = await response.json();
    throw new Error(content.message || "Unknown error");
  }
  if (response.status === 204) return {};
  return response.json();
};

// A helper function to get the headers for the requests.
// It includes the token if it exists in Local storage.
const getHeaders = () => {
  let token = {};
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    token = { Authorization: `Bearer ${user.token}` };
  } catch {}
  return {
    "Content-Type": "application/json",
    ...token,
  };
};

// A helper function to get the query for fetching.
const getQuery = (method, body = null) => {
  const bodyData = body ? { body: JSON.stringify(body) } : {};
  return {
    mode: "cors",
    method: method,
    headers: getHeaders(),
    ...bodyData,
  };
};

export { host, parseResponse, getQuery };
