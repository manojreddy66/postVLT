const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class vanningLeadTimeData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Check if all vanning centers have Vanning Lead Time data up to last vanning date
   * @param {String} scenarioId - scenario UUID
   * @param {Array} vanningCenters - expected vanning center strings
   * @returns {boolean} true if all VCs have data
   */
  async isVanningLeadTimeDataComplete(scenarioId, vanningCenters) {
    try {
      const result = await this.prisma
        .$queryRaw`SELECT COUNT(DISTINCT vanning_center) = ${vanningCenters.length} AS is_complete
          FROM supply_planning.vanning_lead_time
          WHERE scenario_id = ${scenarioId}::uuid
          AND vanning_center = ANY(${vanningCenters}::text[])
          AND vanning_date <= (
            SELECT MAX(tmc_date)
            FROM supply_planning.tmc_working_day_calendar
            WHERE scenario_id = ${scenarioId}::uuid
          );`;
      return result && result.length > 0 && result[0].is_complete === true;
    } catch (error) {
      console.log("Error in isVanningLeadTimeDataComplete:", error);
      throw error;
    }
  }

  /**
   * @description Function to get vanning lead time data by scenarioId, vanningCenter and yearMonth
   * @param {String} scenarioId - scenario id
   * @param {String} vanningCenter - vanning center
   * @param {String} yearMonth - year-month in YYYY-MM format
   * @returns {Array} vanning lead time rows
   */
  async getVanningLeadTimeData(scenarioId, vanningCenter, yearMonth) {
    try {
      return await this.prisma.$queryRaw`
        select
          order_date as "orderDate",
          order_day as "orderDay",
          vanning_date as "vanningDate",
          vanning_day as "vanningDay",
          lead_time as "leadTime"
        from supply_planning.vanning_lead_time
        where scenario_id = ${scenarioId}::uuid
          and vanning_center = ${vanningCenter}
          and vanning_date::text like ${`${yearMonth}%`}
        order by vanning_date;
      `;
    } catch (err) {
      console.log("Error in getVanningLeadTimeData:", err);
    }
  }
  
  /**
   * @description Function to update vanning_lead_time for the provided dates.
   * Updates tmc_working and audit columns (updated_by, last_updated_timestamp).
   * @param {String} scenarioId - scenario UUID
   * @param {String} vanningCenter - vanning center code
   * @param {String} userEmail - user email for audit
   * @param {Array} dates - array of date strings (YYYY-MM-DD) to update
   * @param {Boolean} isWorking - boolean value to set for tmc_working
   * @param {Object} tx - Prisma transaction client
   */
  async updateVanningLeadTimeTmcWorking(
    scenarioId,
    vanningCenter,
    userEmail,
    dates,
    isWorking,
    tx = this.prisma
  ) {
    try {
      return await tx.$executeRaw`
        UPDATE supply_planning.vanning_lead_time
        SET
          tmc_working = ${isWorking}::boolean,
          updated_by = ${userEmail}::text,
          last_updated_timestamp = NOW()
        WHERE scenario_id = ${scenarioId}::uuid
          AND vanning_center = ${vanningCenter}::text
          AND vanning_date IN (${Prisma.join(dates.map((d) => Prisma.sql`${d}::date`))})
      `;
    } catch (err) {
      console.log("Error in updateVanningLeadTimeTmcWorking:", err);
      throw err;
    }
  }

  /**
   * @description Function to update vanning lead time data by scenarioId and vanningDate
   * @param {Object} input - input object containing scenarioId, userEmail, vanningCenter, and data
   * @param {Object} tx - prisma transaction client
   */
  async updateVanningLeadTimeData(input, tx = this.prisma) {
    try {
      return await tx.$executeRaw`
        UPDATE supply_planning.vanning_lead_time vlt
        SET
          order_date = src.order_date,
          order_day = src.order_day,
          lead_time = src.lead_time,
          updated_by = ${input.userEmail}::text,
          last_updated_timestamp = NOW()
        FROM (
          VALUES
          ${Prisma.join(
            input.data.map(
              (item) => Prisma.sql`(
                ${item.vanningDate}::date,
                ${item.orderDate}::date,
                ${item.orderDay}::text,
                ${item.leadTime}::int
              )`
            )
          )}
        ) AS src(
          vanning_date,
          order_date,
          order_day,
          lead_time
        )
        WHERE vlt.scenario_id = ${input.scenarioId}::uuid
          AND vlt.vanning_center = ${input.vanningCenter}::text
          AND vlt.vanning_date = src.vanning_date
      `;
    } catch (err) {
      console.log("Error in updateVanningLeadTimeData:", err);
      throw err;
    }
  }
}

module.exports.vanningLeadTimeData = vanningLeadTimeData;
