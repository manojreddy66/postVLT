const { BaseService } = require("./BaseService");

class standardLeadTimeData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to get standard lead time data by scenarioId and vanningCenter
   * @param {String} scenarioId - scenario id
   * @param {String} vanningCenter - vanning center
   * @returns {Array} standard lead time rows
   */
  async getStandardLeadTimeData(scenarioId, vanningCenter) {
    try {
      return await this.prisma.$queryRaw`
        select
          apply_to_all as "entirePlanDuration",
          lead_time as "leadTime"
        from supply_planning.standard_lead_time
        where scenario_id = ${scenarioId}::uuid
          and vanning_center = ${vanningCenter};
      `;
    } catch (err) {
      console.log("Error in getStandardLeadTimeData:", err);
      throw err;
    }
  }
}

module.exports.standardLeadTimeData = standardLeadTimeData;
