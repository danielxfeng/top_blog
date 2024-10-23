/**
 * Get value from local storage, parse it and return.
 * @param {string} key to get value from local storage
 * @returns value from local storage
 */
const getLocalStorage = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (error) {
    console.log(`Error getting ${key} from local storage `, error);
    return null;
  }
};

/**
 * Set value in local storage.
 * @param {string} key The key to set in local storage
 * @param {object} value The value to set in local storage
 */
const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting ${key} to local storage `, error);
  }
};

export { getLocalStorage, setLocalStorage };
