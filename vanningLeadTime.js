/**
 * @description DB operations to update vanning lead time and related statuses
 */

const { dbConnect } = require("prismaORM/index");
const {
  vanningLeadTimeData,
} = require("prismaORM/services/vanningLeadTimeService");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  scenarioStepStatusData,
} = require("prismaORM/services/scenarioStepStatusService");
const { VALID_STEP_NAMES } = require("constants/customConstants");
const { updateScenarioNStepStatus } = require("utils/common_utils");

/**
 * @description Function to update vanning lead time data and related statuses
 * @param {Object} requestBody - validated request body
 * @param {Object} scenarioData - scenario data for the given scenarioId
 * @returns {Promise<void>} Void if update was successful, error thrown otherwise
 */
async function postVanningLeadTimeData(requestBody, scenarioData) {
  const rdb = await dbConnect();
  const vanningLeadTimeDataService = new vanningLeadTimeData(rdb);
  const scenariosDataService = new scenariosData(rdb);
  const scenarioStepStatusDataService = new scenarioStepStatusData(rdb);
  try {
    return await rdb.prisma.$transaction(async (tx) => {
      /**
       * @description Update vanning lead time data
       */
      await Promise.all([
        /**
         * @description Function to update vanning lead time data for given scenarioId and vanningCenter
         * @param {Object} requestBody - Input payload
         * @param {Object} tx - transaction object for DB operations
         */
        vanningLeadTimeDataService.updateVanningLeadTimeData(requestBody, tx),
        /**
         * @description Function to upsert scenario step status to In Progress
         * and update scenario status if not already In Progress
         * @param {Object} requestBody - request payload containing scenarioId and userEmail
         * @param {Object} scenarioData - scenario data for the given scenarioId
         * @param {*} scenarioStepName - Vanning lead time step name
         * @param {Object} scenarioStepStatusService - scenarioStepStatusData service instance for DB operations on scenario_step_status table
         * @param {Object} scenariosDataService - scenariosData service instance for DB operations on scenarios table
         * @param {Object} tx - transaction object for DB operations
         */
        updateScenarioNStepStatus(
          requestBody,
          scenarioData,
          VALID_STEP_NAMES[4],
          scenarioStepStatusDataService,
          scenariosDataService,
          tx
        ),
      ]);
    });
  } catch (err) {
    console.log("Error in postVanningLeadTimeData:", err);
    throw err;
  }
}

module.exports = {
  postVanningLeadTimeData,
};
