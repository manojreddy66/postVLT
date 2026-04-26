/**
 * @description Service file for POST vanning lead time API
 */

const { BadRequest } = require("utils/api_response_utils");
const { validateInput } = require("./validateRequest");
const { postVanningLeadTimeData } = require("./vanningLeadTime");
const { prepareResponse } = require("./utils");

/**
 * @description Function to validate input and update vanning lead time response
 * @param {Object} event - lambda event
 * @returns {Promise<Object>} formatted response
 */
async function updateVanningLeadTime(event) {
  try {
    /**
     * @description Parse request body from lambda event
     */
    const requestBody = JSON.parse(event?.body || "{}");
    console.log("requestBody:", requestBody);
    /**
     * @description Validate request body
     * @param {Object} requestBody - request body
     * @returns {Promise<Object>} errorMessagesList - validation errors if any & scenarioData
     */
    const { errorMessagesList, scenarioData } = await validateInput(requestBody);
    /**
     * @description Throw bad request error if validation errors are present
     */
    if (errorMessagesList.length > 0) {
      throw new BadRequest(errorMessagesList);
    }
    /**
     * @description Update vanning lead time data and related statuses
     * @returns {Promise<Void>} Void if update was successful
     */
    await postVanningLeadTimeData(requestBody, scenarioData);
    /**
     * @description Prepare final API response
     */
    return prepareResponse();
  } catch (err) {
    console.log("Error in updateVanningLeadTime:", err);
    throw err;
  }
}

module.exports = {
  updateVanningLeadTime,
};
