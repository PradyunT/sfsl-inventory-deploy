// neighbor.js
import axios from 'axios';

const NeighborClient = axios.create({
  baseURL: `${import.meta.env.VITE_SERVER_URL}/api/neighbors`,
  timeout: 1000,
});

/**
 * Get all neighbors, optionally filtering by gender, age, or zipcode.
 * Corresponds to: GET /neighbors
 * @param {object} [filters] - Optional filters.
 * @param {string} [filters.gender] - Filter by gender.
 * @param {number} [filters.age] - Filter by age.
 * @param {string} [filters.zipcode] - Filter by zipcode.
 * @returns {Promise<Array<object>>} A promise resolving to an array of neighbor objects.
 */
export const getNeighbors = async ({ gender, age, zipcode } = {}) => {
  const params = {};
  if (gender) params.gender = gender;
  if (age !== undefined && age !== null) params.age = age;
  if (zipcode) params.zipcode = zipcode;

  const response = await NeighborClient.get('/', { params });
  // return the neighbors array
  return response.data.neighbors;
};

/**
 * Get a single neighbor by their ID.
 * Corresponds to: GET /neighbors/:id
 * @param {object} params - Parameters.
 * @param {string} params.id - The ID of the neighbor to retrieve.
 * @returns {Promise<object>} A promise resolving to the neighbor object.
 */
export const getNeighbor = async ({ id }) => {
  if (!id) throw new Error("Neighbor ID is required."); // Basic validation
  const response = await NeighborClient.get(`/${id}`);
  // The controller returns { neighbor: {...} }, so we extract the object.
  return response.data.neighbor;
};

/**
 * Create a new neighbor.
 * Corresponds to: POST /neighbors
 * @param {object} neighborData - Data for the new neighbor.
 * @param {string} neighborData.race - The race of the neighbor.
 * @param {string} neighborData.gender - The gender of the neighbor.
 * @param {number} neighborData.age - The age of the neighbor.
 * @param {Array} [neighborData.history=[]] - Optional history array, defaults to empty.
 * @returns {Promise<object>} A promise resolving to the newly created neighbor object.
 */
export const createNeighbor = async ({ race, gender, age, history = [] }) => {
  // Basic client-side validation matching controller requirements
  if (!race || !gender || age == null) {
    throw new Error("Missing required fields (race, gender, age) for creating neighbor.");
  }

  const response = await NeighborClient.post('/', { race, gender, age, history });
  // return the created object
  return response.data.neighbor;
};

/**
 * Delete a neighbor by their ID.
 * Corresponds to: DELETE /neighbors/:id
 * @param {object} params - Parameters.
 * @param {string} params.id - The ID of the neighbor to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 */
export const deleteNeighbor = async ({ id }) => {
  if (!id) throw new Error("Neighbor ID is required for deletion."); // Basic validation
  await NeighborClient.delete(`/${id}`);
  // No explicit return value needed, success is implied if no error is thrown.
  // The controller actually returns the deleted neighbor, but usually the client
  // doesn't need it after a delete operation. If needed, you could return response.data.neighbor.
};

/**
 * Deletes multiple neighbors one by one by calling deleteNeighbor.
 * Note: This performs sequential individual delete requests.
 * @param {Array<object>} neighbors - An array of neighbor objects, each must have an _id property.
 * @returns {Promise<void>} A promise that resolves when all deletions are attempted.
 */
export const deleteNeighbors = async (neighbors) => {
  // Ensure neighbors is an array and has items
  if (!Array.isArray(neighbors) || neighbors.length === 0) {
    console.warn("deleteNeighbors called with empty or invalid input.");
    return; // Nothing to delete
  }
  // Sequentially delete each neighbor
  for (const neighbor of neighbors) {
    if (neighbor && neighbor._id) {
      try {
        await deleteNeighbor({ id: neighbor._id });
      } catch (error) {
        console.error(`Failed to delete neighbor with ID ${neighbor._id}:`, error);
        // Continue to attempt to delete the other neighbors after error
      }
    } else {
      console.warn("Skipping invalid neighbor object in deleteNeighbors:", neighbor);
    }
  }
};

// Note: No updateNeighbor function yet