import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";

class IncreasedCarryWeight implements IPostDBLoadMod
{
    private logger: ILogger;
    readonly modName = "IncreasedCarryWeight";

    public postDBLoad(container: DependencyContainer): void 
    {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        // Get all the in-memory json found in /assets/database
        const database: IDatabaseTables = databaseServer.getTables();
        const globalStamina = database.globals.config.Stamina;
        this.IncreasedCarryWeight(globalStamina);
    }

    private IncreasedCarryWeight(globalStamina): void 
    {
        //Dictates walk speed when at overweight and overencumbered statuses
        this.logger.info(`[${this.modName}]: WalkOverweightLimits X is Currently: ${globalStamina.WalkOverweightLimits.x}`)
        globalStamina.WalkOverweightLimits.x = 125;
        this.logger.info(`[${this.modName}]: WalkOverweightLimits X after assignment is Currently: ${globalStamina.WalkOverweightLimits.x}`)

        this.logger.info(`[${this.modName}]: WalkOverweightLimits Y is Currently: ${globalStamina.WalkOverweightLimits.y}`)
        globalStamina.WalkOverweightLimits.y = 150;
        this.logger.info(`[${this.modName}]: WalkOverweightLimits Y after assignment is Currently: ${globalStamina.WalkOverweightLimits.y}`)

        //Dictates how much you can carry before weight debuff(s) appear
        this.logger.info(`[${this.modName}]: BaseOverweightLimits X is Currently: ${globalStamina.BaseOverweightLimits.x}`)
        globalStamina.BaseOverweightLimits.x = 115;
        this.logger.info(`[${this.modName}]: BaseOverweightLimits X after assignment is Currently: ${globalStamina.BaseOverweightLimits.x}`)

        this.logger.info(`[${this.modName}]: BaseOverweightLimits Y is Currently: ${globalStamina.BaseOverweightLimits.y}`)
        globalStamina.BaseOverweightLimits.y = 150;
        this.logger.info(`[${this.modName}]: BaseOverweightLimits Y after assignment is Currently: ${globalStamina.BaseOverweightLimits.y}`)

        //Dictates sprint stamina penalties when at overweight or overencumbered statuses
        this.logger.info(`[${this.modName}]: SprintOverweightLimits X is Currently: ${globalStamina.SprintOverweightLimits.x}`)
        globalStamina.SprintOverweightLimits.x = 120;
        this.logger.info(`[${this.modName}]: SprintOverweightLimits X after assignment is Currently: ${globalStamina.SprintOverweightLimits.x}`)

        this.logger.info(`[${this.modName}]: SprintOverweightLimits Y is Currently: ${globalStamina.SprintOverweightLimits.y}`)
        globalStamina.SprintOverweightLimits.y = 140;
        this.logger.info(`[${this.modName}]: SprintOverweightLimits Y after assignment is Currently: ${globalStamina.SprintOverweightLimits.y}`)

        //Dictates walk speed stamina penalties when at overweight or overencumbered statuses
        this.logger.info(`[${this.modName}]: WalkSpeedOverweightLimits X is Currently: ${globalStamina.WalkSpeedOverweightLimits.x}`)
        globalStamina.WalkSpeedOverweightLimits.x = 120;
        this.logger.info(`[${this.modName}]: WalkSpeedOverweightLimits X after assignment is Currently: ${globalStamina.WalkSpeedOverweightLimits.x}`)

        this.logger.info(`[${this.modName}]: WalkSpeedOverweightLimits Y is Currently: ${globalStamina.WalkSpeedOverweightLimits.y}`)
        globalStamina.WalkSpeedOverweightLimits.y = 150;
        this.logger.info(`[${this.modName}]: WalkSpeedOverweightLimits Y after assignment is Currently: ${globalStamina.WalkSpeedOverweightLimits.y}`)

        this.logger.success(`[${this.modName}]: Carry Weight values successfully updated!`);
    }
}

module.exports = { mod: new IncreasedCarryWeight() }