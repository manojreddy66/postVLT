/**
 * @description this file contains request validation methods
 */

const { dbConnect } = require("prismaORM/index");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  getValidationSchema,
} = require("schemaValidator/supplyPlanning/vanningLeadTime/postVanningLeadTimeSchema");
const {
  emptyInputCheck,
  validateScenarioTimeframe,
  validateWorkingDays,
} = require("utils/common_utils");
const { BadRequest } = require("utils/api_response_utils");

/**
 * @description Function to validate input request body
 * @param {Object} requestBody - API input request body
 * @returns {Promise<Object>} errorMessagesList - Validation errors if any & scenarioData
 */
async function validateInput(requestBody) {
  const errorMessagesList = [];
  /**
   * @description Validate request body is not empty
   */
  emptyInputCheck(requestBody);
  /**
   * @description Validate request body using Joi schema
   */
  validateRequest(requestBody, errorMessagesList);
  let scenarioData = null;
  /**
   * @description If Joi validation is successful, validate whether scenario exists
   */
  if (errorMessagesList.length === 0) {
    /**
     * @description Check if scenario exists for provided scenarioId.
     * If scenario doesn't exist, throw validation error.
     * @returns {Promise<Object>} scenarioData - scenario data from DB for provided scenarioId
     */
    scenarioData = await checkForInvalidScenarioId(requestBody);
    /**
     * @description Validate whether provided vanningDate values fall within the scenario timeframe.
     */
    validateScenarioTimeframe(requestBody, scenarioData);
    /**
     * @description Validate date sequence - orderDate should be earlier than vanningDate
     */
    validateDateSequence(requestBody);
    /**
     * @description Function to validate whether provided vanning dates are working days
     * @returns {Promise<void>} Void if validation is successful, otherwise throws BadRequest error with list of non-working vanning dates provided in the request
     */
    await validateWorkingDays(requestBody);
  }
  return { errorMessagesList: [...new Set(errorMessagesList)], scenarioData };
}

/**
 * @description Function to validate request body using Joi schema
 * @param {Object} requestBody - request body
 * @param {Array} errorMessagesList - array to collect validation errors
 */
function validateRequest(requestBody, errorMessagesList) {
  const options = { abortEarly: false };
  const schema = getValidationSchema();
  const { error } = schema.validate(requestBody, options);
  if (error) {
    error.details.forEach((detail) => {
      errorMessagesList.push(detail.message);
    });
  }
}

/**
 * @description Function to check if a scenario exists
 * @param {Object} requestBody - input request body
 * @returns {Promise<Object>} scenarioData - scenario data from DB
 */
async function checkForInvalidScenarioId(requestBody) {
  const rdb = await dbConnect();
  const scenariosDataService = new scenariosData(rdb);
  try {
    /**
     * @description Get scenario data by scenarioId
     */
    const scenarioData = await scenariosDataService.getScenarioDataById(
      requestBody.scenarioId
    );
    /**
     * @description If provided scenarioId doesn't exist, throw validation error
     */
    if (!scenarioData || scenarioData.length === 0) {
      throw new BadRequest("ValidationError: Scenario doesn't exist.");
    }
    return scenarioData[0];
  } catch (err) {
    console.log("Error in checkForInvalidScenarioId:", err);
    throw err;
  }
}

/**
 * @description Function to validate date sequence orderDate < vanningDate
 * @param {Object} requestBody - request body
 */
function validateDateSequence(requestBody) {
  const isInvalidSequence = requestBody.data.some((item) => {
    return new Date(item.orderDate) > new Date(item.vanningDate);
  });
  if (isInvalidSequence) {
    throw new BadRequest(
      "ValidationError: orderDate must be earlier than the vanningDate."
    );
  }
}

module.exports = {
  validateInput,
};
