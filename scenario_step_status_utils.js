const {
  scenarioStepStatusData,
} = require("prismaORM/services/scenarioStepStatusService");
const { INIT_SCENARIO_STEP_STATUS_DATA } = require("constants/customConstants");

/**
 * @description Function to get scenario step status by scenario_id, if not present create with initial status
 * @param {*} scenarioId: scenario_id for which the step status needs to be fetched/created
 * @param {*} userEmail: user email to be used in case scenario step status data needs to be created for the given scenario_id
 * @param {*} rdb: prisma client instance to be used for db operations
 * @returns {Array} scenario step status data for the given scenario_id
 */
async function getScenarioStepStatusData(scenarioId, userEmail, rdb) {
  const scenarioStepStatusDataService = new scenarioStepStatusData(rdb);
  try {
    /**
     * @description Fetch scenario step status data for the given scenario_id,
     * if not present create with initial status and return the same
     */
    const scenarioStepStatusDetails =
      await scenarioStepStatusDataService.getScenarioStepStatusData(scenarioId);
    /**
     * If no scenario step status data is present for the given scenario_id,
     * create scenario step status data with initial status and return the same
     */
    if (!scenarioStepStatusDetails || scenarioStepStatusDetails.length === 0) {
      const initialStepStatusData = INIT_SCENARIO_STEP_STATUS_DATA;
      /**
       * @description Create scenario step status data with initial status for the given scenario_id
       * and return the same
       */
      await scenarioStepStatusDataService.createScenarioStepStatusData(
        scenarioId,
        userEmail,
        initialStepStatusData
      );
      return initialStepStatusData;
    }
    /**
     * @description Format the scenario step status data in the required format
     */
    const formattedScenarioStepStatusData = formatScenarioStepStatusData(
      scenarioStepStatusDetails
    );
    return formattedScenarioStepStatusData;
  } catch (err) {
    console.log("Error in getScenarioStepStatusData: ", err);
    throw err;
  }
}

/**
 * @description Function to format scenario step status data in the required format
 * @param {Array} scenarioStepStatusDetails: Scenario step status data fetched from DB for a given scenario_id
 * @returns {Object} formattedData: Formatted scenario step status data
 */
function formatScenarioStepStatusData(scenarioStepStatusDetails) {
  const formattedData = { other: INIT_SCENARIO_STEP_STATUS_DATA.other };
  scenarioStepStatusDetails.forEach((record) => {
    const { input_step_type, input_step_name, status } = record;
    if (!formattedData[input_step_type]) {
      formattedData[input_step_type] = {};
    }
    formattedData[input_step_type][input_step_name] = status;
  });
  return formattedData;
}

module.exports = {
  getScenarioStepStatusData,
};
