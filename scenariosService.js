const { BaseService } = require("./BaseService");
const {
  SCENARIO_TYPES,
  SCENARIO_STATUSES,
} = require("constants/customConstants");
const { formatScenarioCycle } = require("utils/common_utils");

class scenariosData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to get scenario data by scenarioName without V
   */
  async getScenarioData(scenarioName) {
    try {
      const search = `${scenarioName}%`;
      return await this.prisma
        .$queryRaw`select * from supply_planning.scenarios where scenario_name like ${search};`;
    } catch (err) {
      console.log("Error in getScenarioData:", err);
      throw err;
    }
  }

  /**
   * @description Function to create scenario
   */
  async createScenario(
    input,
    scenarioName,
    cycle,
    startMonthYear,
    endMonthYear,
    tx
  ) {
    try {
      let getsudoMonth = null;
      let apMonth = null;
      if (input.type === SCENARIO_TYPES.GETSUDO) {
        getsudoMonth = formatScenarioCycle(cycle);
      } else {
        apMonth = formatScenarioCycle(cycle);
      }
      return await tx.$queryRaw`INSERT INTO supply_planning.scenarios (user_email, user_name, scenario_name,
                    namc,
                    line,
                    plan_type,
                    start_month_year,
                    end_month_year,
                    scenario_cycle,
                    getsudo_month,
                    ap_month,
                    scenario_status,
                    created_by,
                    created_date_timestamp) 
                    VALUES (${input.userEmail},${input.userName},${scenarioName},
                    ${input.namc}, ${input.line},${input.type}, ${startMonthYear},
                    ${endMonthYear}, ${cycle}, ${getsudoMonth}, ${apMonth},
                    ${SCENARIO_STATUSES.NOT_STARTED}, ${input.userEmail}, CURRENT_TIMESTAMP)
                    returning scenario_id;`;
    } catch (err) {
      console.log("Error in createScenario:", err);
      throw err;
    }
  }

  /**
   * @description Function to get scenario data count for table
   */
  async getScenarioTableDataCount(queryConditionForDataNCountByTab) {
    try {
      const condition = queryConditionForDataNCountByTab || Prisma.empty;
      return await this.prisma.$queryRaw`
      select count(*)
      from supply_planning.scenarios
      where is_active = true
      ${condition}
    `;
    } catch (err) {
      console.log("Error in getScenarioTableDataCount:", err);
      throw err;
    }
  }

  /**
   * @description Function to get scenario data for table
   */
  async getScenarioTableData(
    queryConditionForDataNCountByTab,
    perPageRow,
    startAt
  ) {
    try {
      const condition = queryConditionForDataNCountByTab || Prisma.empty;
      return await this.prisma.$queryRaw`
      select *
      from supply_planning.scenarios
      where is_active = true
      ${condition}
       order by created_date_timestamp desc limit ${perPageRow} offset ${startAt};`;
    } catch (err) {
      console.log("Error in getScenarioTableData:", err);
      throw err;
    }
  }

  /**
   * @description Function to get scenario data by scenarioId and scenarioName
   */
  async getScenarioDataByIdAndName(scenarioId, scenarioName) {
    try {
      return await this.prisma
        .$queryRaw`select * from supply_planning.scenarios where scenario_id = ${scenarioId}::uuid 
                   and scenario_name = ${scenarioName} and is_active = true;`;
    } catch (err) {
      console.log("Error in getScenarioDataByIdAndName:", err);
      throw err;
    }
  }

  /**
   * @description Function to get scenario data by scenarioId.
   */
  async getScenarioDataById(scenarioId) {
    try {
      return await this.prisma
        .$queryRaw`select * from supply_planning.scenarios where scenario_id = ${scenarioId}::uuid and is_active = true;`;
    } catch (err) {
      console.log("Error in getScenarioDataById:", err);
      throw err;
    }
  }

  /**
   * @description Function to delete scenario in supply_planning.scenarios table.
   */
  async deleteScenario(input) {
    try {
      return await this.prisma.$queryRaw`
        update supply_planning.scenarios
        set is_active = false,
            last_updated_timestamp = CURRENT_TIMESTAMP,
            updated_by = ${input.userEmail}
        where scenario_id = ${input.scenarioId}::uuid
        returning scenario_id;
      `;
    } catch (err) {
      console.log("Error in deleteScenario:", err);
      throw err;
    }
  }

  /**
   * @description Function to update scenario status in supply_planning.scenarios table.
   */
  async updateScenarioStatus(
    scenarioId,
    userEmail,
    scenarioStatus,
    tx = this.prisma
  ) {
    try {
      return await tx.$queryRaw`UPDATE supply_planning.scenarios
        SET scenario_status = ${scenarioStatus},
            updated_by = ${userEmail},
            last_updated_timestamp = CURRENT_TIMESTAMP
        WHERE scenario_id = ${scenarioId}::uuid
        returning scenario_id;
      `;
    } catch (err) {
      console.log("Error in updateScenarioStatus:", err);
      throw err;
    }
  }
}

module.exports.scenariosData = scenariosData;
