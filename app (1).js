/**
 * @name vanning-lead-time
 * @description Updates scenario vanning lead time by scenarioId and vanningCenter
 * @createdOn Apr 20th, 2026
 * @author Priyadarshini Gangone
 * @modifiedBy
 * @modifiedOn
 * @modificationSummary
 */

const {
  sendResponse,
  BadRequest,
  HTTP_RESPONSE_CODES,
} = require("utils/api_response_utils");
const { updateVanningLeadTime } = require("./vanningLeadTimeService");
const { API_ERROR_MESSAGE } = require("constants/customConstants");

/**
 * @description Lambda handler for POST vanning lead time API.
 * @param {Object} event: API event with request body:
   {
     "scenarioId": "uniqueScenarioId",
     "vanningCenter": "NH",
     "userEmail": "user@toyota.com",
     "data": [
       {
         "orderDate": "2025-01-01",
         "orderDay": "Monday",
         "vanningDate": "2025-01-07",
         "vanningDay": "Monday",
         "leadTime": 7
       },
       {
         "orderDate": "2025-01-01",
         "orderDay": "Monday",
         "vanningDate": "2025-01-08",
         "vanningDay": "Tuesday",
         "leadTime": 8
       }
     ]
   }
 * @returns {Promise<Object>}: response sample is detailed below.
 * Success response with status code 200:
   {
     "message": "Successfully updated data."
   }
 * In-valid input error with status 400:
  {
    "errorMessage": [<"ValidationError: validation error message">]
  }
 * Internal server error with status code 500:
  {
    "errorMessage": "Internal Server Error"
  }
 */
exports.handler = async (event) => {
  try {
    /**
     * @description Function to validate input and update vanning lead time response.
     * @param {Object} event: Input parameters
     * @returns {Promise<Object>} response - success response
     */
    const response = await updateVanningLeadTime(event);
    console.log("Vanning Lead Time Post API Response:", response);
    return sendResponse(HTTP_RESPONSE_CODES.SUCCESS, response);
  } catch (err) {
    console.log("Handler Error - Vanning Lead Time Post API:", err);
    let errorMessage = API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    let statusCode = HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR;
    /**
     * @description If error is BadRequest, return 400 with validation messages
     */
    if (err instanceof BadRequest) {
      statusCode = HTTP_RESPONSE_CODES.BAD_REQUEST;
      errorMessage = err.message
        .split(/,(?=ValidationError:)/)
        .map((e) => e.trim());
      console.log(
        "Validation error messages - Vanning Lead Time Post API: ",
        errorMessage
      );
    }
    return sendResponse(statusCode, { errorMessage: errorMessage });
  }
};
