import { host, parseResponse, getQuery } from "./common";

// A helper function to save the user information to the local storage.
const saveUserToLocalStorage = (user) => {
  try {
    localStorage.setItem("user", JSON.stringify(user));
  } catch {
    console.log("Error saving user information to local storage");
  }
};

const removeUserFromLocalStorage = () => {
  try {
    localStorage.removeItem("user");
  } catch {
    console.log("Error removing user information from local storage");
  }
};

/**
 * Register a new user
 * See API documentation for more information.
 * It also saves the user information to the local storage.
 */
const userRegister = async (username, password) => {
  const response = await fetch(
    `${host}/user`,
    getQuery("POST", { username, password })
  );
  return parseResponse(response);
};

// A helper function to login a user.
const loginHelper = async(response) => {
  const user = await parseResponse(response);
  saveUserToLocalStorage(user);
  return user;
}

/**
 * Login a user
 * See API documentation for more information.
 * It also saves the user information to the local storage.
 */
const userLogin = async (username, password) => {
  const response = await fetch(
    `${host}/user/login`,
    getQuery("POST", { username, password })
  );
  return loginHelper(response);
};

/**
 * Login a user by token.
 * See API documentation for more information.
 * It also saves the user information to the local storage.
 */
const userLoginByToken = async () => {
  const response = await fetch(`${host}/user/login`, getQuery("POST"));
  return loginHelper(response);
};

/**
 * Get a user's information
 * See API documentation for more information.
 */
const getUserInfo = async () => {
  const response = await fetch(`${host}/user`, getQuery("GET"));
  return parseResponse(response);
};

/**
 * Update a user's information
 * See API documentation for more information.
 * It also updates the user information in the local storage.
 */
const updateUserInfo = async (payload) => {
  const response = await fetch(`${host}/user`, getQuery("PUT", payload));
  const user = await parseResponse(response);
  saveUserToLocalStorage(user);
  return user;
};

/**
 * Delete a user
 * See API documentation for more information.
 * It also removes the user information from the local storage.
 *
 * @returns {boolean} true if the user is deleted successfully.
 */
const deleteUser = async () => {
  const response = await fetch(`${host}/user`, getQuery("DELETE"));
  await parseResponse(response);
  logout();
  return true;
};

const logout = () => {
  removeUserFromLocalStorage();
};

export {
  userRegister,
  userLogin,
  userLoginByToken,
  getUserInfo,
  updateUserInfo,
  deleteUser,
  logout,
};
