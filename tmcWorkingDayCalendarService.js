const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class tmcWorkingDayCalendarData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to fetch TMC Working Day Calendar data by scenarioId, vanningCenter and monthNumber
   * @param {String} scenarioId - scenario id
   * @param {String} vanningCenter - vanning center code
   * @param {String} monthYear - month and year in YYYYMM format
   * @returns {Array} TMC Working Day Calendar rows
   */
  async getTmcWorkingDayCalendarData(scenarioId, vanningCenter, monthYear) {
    try {
      return await this.prisma.$queryRaw`
        select
          tmc_date         as "prodDate",
          day_of_week       as "dayOfWeek",
          is_working_day    as "isWorkingDay",
          work_day_percentage as "workDayPercentage",
          week_number              as "week"
        from supply_planning.tmc_working_day_calendar
        where scenario_id = ${scenarioId}::uuid
          and vanning_center = ${vanningCenter}
          and month_number = ${Number(monthYear)}::integer
        order by tmc_date;
      `;
    } catch (err) {
      console.log("Error in getTmcWorkingDayCalendarData:", err);
      throw err;
    }
  }

  /**
   * @description Function to update TMC Working Day Calendar data
   * @param {String} scenarioId - scenario id
   * @param {String} vanningCenter - vanning center code
   * @param {String} userEmail - user email
   * @param {Array} data - [{ prodDate, workDayPercentage }]
   * @param {Object} tx - Prisma transaction client
   */
  async updateTmcWorkingDayCalendarData(
    scenarioId,
    vanningCenter,
    userEmail,
    data,
    tx = this.prisma
  ) {
    try {
      return await tx.$executeRaw`
        UPDATE supply_planning.tmc_working_day_calendar twdc
        SET
            work_day_percentage = src.work_day_percentage,
            is_working_day = (src.work_day_percentage <> 0),
            last_updated_timestamp = CURRENT_TIMESTAMP,
            updated_by = ${userEmail}
        FROM (
            VALUES
            ${Prisma.join(
              data.map(
                (item) => Prisma.sql`(
                  ${item.prodDate}::date,
                  ${item.workDayPercentage}::integer
                )`
              )
            )}
        ) AS src(tmc_date, work_day_percentage)
        WHERE twdc.scenario_id = ${scenarioId}::uuid
          AND twdc.vanning_center = ${vanningCenter}
          AND twdc.tmc_date = src.tmc_date;
      `;
    } catch (err) {
      console.log("Error in updateTmcWorkingDayCalendarData:", err);
      throw err;
    }
  }

  /**
   * @description Function to fetch TMC Working Day Calendar data by scenarioId and vanningCenter
   * @param {Object} body - request payload with scenarioId and vanningCenter
   * @returns {Array} TMC Working Day Calendar data for the scenario and vanning center
   */
  async getTmcWorkingDayCalendarByScenarioIdVc(body) {
    try {
      return await this.prisma.$queryRaw`
        select
          tmc_date         as "prodDate",
          day_of_week       as "dayOfWeek",
          is_working_day    as "isWorkingDay",
          work_day_percentage as "workDayPercentage",
          week_number              as "week"
        from supply_planning.tmc_working_day_calendar
        where scenario_id = ${body.scenarioId}::uuid
          and vanning_center = ${body.vanningCenter}
        order by tmc_date;
      `;
    } catch (err) {
      console.log("Error in getTmcWorkingDayCalendarByScenarioIdVc:", err);
      throw err;
    }
  }

  /**
   * @description Check if all vanning centers have TMC Working Day Calendar data
   * @param {String} scenarioId - scenario UUID
   * @param {Array} vanningCenters - expected vanning center strings
   * @returns {boolean} true if all VCs have data
   */
  async isTmcWorkingDayCalDataComplete(scenarioId, vanningCenters) {
    try {
      const result = await this.prisma
        .$queryRaw`SELECT COUNT(DISTINCT vanning_center) = ${vanningCenters.length} AS is_complete
          FROM supply_planning.tmc_working_day_calendar
          WHERE scenario_id = ${scenarioId}::uuid
          AND vanning_center = ANY(${vanningCenters}::text[]);`;
      return result && result.length > 0 && result[0].is_complete === true;
    } catch (error) {
      console.log("Error in isTmcWorkingDayCalDataComplete:", error);
      throw error;
    }
  }

  /**
   * @description Function to fetch TMC Working Days data by scenarioId, vanningCenter and vanningDates
   * @param {String} scenarioId - scenario id
   * @param {String} vanningCenter - vanning center code
   * @param {Array} vanningDates - array of vanning dates
   * @returns {Array} TMC Working Days data
   */
  async getTmcWorkingDaysByDates(scenarioId, vanningCenter, vanningDates) {
    try {
      return await this.prisma.$queryRaw`
        select
          tmc_date         as "prodDate",
          day_of_week       as "dayOfWeek",
          is_working_day    as "isWorkingDay",
          work_day_percentage as "workDayPercentage",
          week_number              as "week"
        from supply_planning.tmc_working_day_calendar
        where scenario_id = ${scenarioId}::uuid
          and vanning_center = ${vanningCenter}
          and tmc_date in (${Prisma.join(vanningDates.map((date) => Prisma.sql`${date}::date`))})
          and is_working_day = true
        order by tmc_date;
      `;
    } catch (err) {
      console.log("Error in getTmcWorkingDaysByDates:", err);
      throw err;
    }
  }
}

module.exports.tmcWorkingDayCalendarData = tmcWorkingDayCalendarData;
