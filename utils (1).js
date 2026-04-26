/**
 * @description this file contains vanning lead time common utils
 */

/**
 * @description Function to prepare vanning lead time post response
 * @returns {Object} response - success response
 */
function prepareResponse() {
  return {
    message: "Successfully updated data.",
  };
}

module.exports = {
  prepareResponse,
};