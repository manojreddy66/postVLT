const { BaseService } = require("./BaseService");
const { Prisma } = require("@prisma/client");

class scenarioStepStatusData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to upsert scenario step status by scenario_id and input_step_name
   */
  async upsertScenarioStepStatus(
    scenarioId,
    userEmail,
    stepName,
    stepType,
    status,
    tx = this.prisma
  ) {
    try {
      return await tx.$queryRaw`insert into supply_planning.scenario_step_status (scenario_id, input_step_type, input_step_name, status, created_by, created_date_timestamp)
                                values (${scenarioId}::uuid, ${stepType}, ${stepName}, ${status}, ${userEmail}, now())
                                on conflict (scenario_id, input_step_name)
                                do update set status = ${status}, updated_by = ${userEmail}, last_updated_timestamp = now()
                                returning scenario_step_status_id::uuid;`;
    } catch (err) {
      console.log("Error in upsertScenarioStepStatus:", err);
      throw err;
    }
  }

  /**
   * @description Function to update scenario step status by scenario_id and input_step_name
   */
  async updateScenarioStepStatus(
    scenarioId,
    stepName,
    status,
    tx = this.prisma
  ) {
    try {
      return await tx.$queryRaw`update supply_planning.scenario_step_status 
                                set status = ${status},
                                last_updated_timestamp = now()
                                where scenario_id = ${scenarioId}::uuid
                                and input_step_name = ${stepName}
                                returning scenario_step_status_id::uuid;`;
    } catch (err) {
      console.log("Error in updateScenarioStepStatus:", err);
      throw err;
    }
  }

  /**
   * @description Function to get scenario step status by scenario_id
   */
  async getScenarioStepStatusData(scenarioId) {
    try {
      return await this.prisma
        .$queryRaw`select * from supply_planning.scenario_step_status 
                                where scenario_id = ${scenarioId}::uuid;`;
    } catch (err) {
      console.log("Error in getScenarioStepStatusData:", err);
      throw err;
    }
  }

  /**
   * @description Function to create scenario step status by scenario_id and input_step_name
   */
  async createScenarioStepStatusData(
    scenarioId,
    userEmail,
    initialStepStatusData
  ) {
    try {
      const values = [];
      Object.entries(initialStepStatusData).forEach(
        ([inputStepType, stepDetails]) => {
          if (
            !stepDetails ||
            typeof stepDetails !== "object" ||
            Array.isArray(stepDetails)
          ) {
            return;
          }
          Object.entries(stepDetails).forEach(([inputStepName, status]) => {
            values.push(
              Prisma.sql`(${scenarioId}::uuid, ${inputStepType}, ${inputStepName}, ${status}, ${userEmail})`
            );
          });
        }
      );

      return await this.prisma
        .$queryRaw`insert into supply_planning.scenario_step_status
                      (scenario_id, input_step_type, input_step_name, status, created_by)
                      values ${Prisma.join(values)}`;
    } catch (err) {
      console.log("Error in createScenarioStepStatusData:", err);
      throw err;
    }
  }
}

module.exports.scenarioStepStatusData = scenarioStepStatusData;
