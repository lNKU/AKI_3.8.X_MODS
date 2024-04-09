import { DependencyContainer } from "tsyringe";

import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { IDatabaseTables } from "@spt-aki/models/spt/server/IDatabaseTables";
import { ItemHelper } from "@spt-aki/helpers/ItemHelper";
import { BaseClasses } from "@spt-aki/models/enums/BaseClasses";
import { ILogger } from "@spt-aki/models/spt/utils/ILogger";
import { LogTextColor } from "@spt-aki/models/spt/logging/LogTextColor";

class CreatureComforts implements IPostDBLoadMod {
    private logger: ILogger;
    readonly modName = "CreatureComforts";

    public postDBLoad(container: DependencyContainer): void {
        this.logger = container.resolve<ILogger>("WinstonLogger");
        // get database from server
        const databaseServer = container.resolve<DatabaseServer>("DatabaseServer");
        // Get all the in-memory json found in /assets/database
        const database: IDatabaseTables = databaseServer.getTables();
        // Get ItemHelper ready to use
        const itemHelper: ItemHelper = container.resolve<ItemHelper>("ItemHelper");

        // Get all items in the database as an array so we can loop over them later
        // tables.templates.items is a dictionary, the key being the items template id, the value being the objects data,
        // we want to convert it into an array so we can loop over all the items easily
        // Object.values lets us grab the 'value' part as an array and ignore the 'key' part
        const items = Object.values(database.templates.items);
        const ammunition = items.filter(x => x._type === "Item" && itemHelper.isOfBaseclass(x._id, BaseClasses.AMMO))
        const weaponGear = items.filter(x => x._type === "Item" && itemHelper.isOfBaseclass(x._id, BaseClasses.SILENCER))
        const armorPlate = items.filter(x => x._type === "Item" && itemHelper.isOfBaseclass(x._id, BaseClasses.ARMOR_PLATE));
        const armoredEquip = items.filter(x => x._type === "Item" && itemHelper.isOfBaseclass(x._id, BaseClasses.ARMORED_EQUIPMENT));
        const currencies = items.filter(x => x._type === "Item" && itemHelper.isOfBaseclass(x._id, BaseClasses.MONEY));

        const hideoutProds = database.hideout.production;
        const hideoutZones = database.hideout.areas;
        const hideoutScavs = database.hideout.scavcase;
        

        // Blacklist shrapnel, grenades, and other unobtainable ammo types
        const ammunitionBlacklist = [
            // 40x46
            // 40 VOG-25
            // 127x108
            // 26x75
            // shrapnel
        ]

        // const currencyNames = [];
        // // Iterate over the filtered weaponGear and collect names
        // currencies.forEach((currency) => {
        //     currencyNames.push(currency._name); // Push the name to the silencerNames array
        // });

        // currencyNames.forEach(name => this.logger.success(`${this.modName} - MONEY: ${name}`)); // This will print each name on a new line
        

        // const silencerNames = [];
        // // Iterate over the filtered weaponGear and collect names
        // weaponGear.forEach((silencer) => {
        //     silencerNames.push(silencer._props.Name); // Push the name to the silencerNames array
        // });

        // silencerNames.forEach(name => this.logger.warning(`${this.modName} - SILENCER: ${name}`)); // This will print each name on a new line
        
        // const plateNames = [];
        // // Iterate over the filtered armor plates and collect names
        // armorPlate.forEach((plate) => {
        //     plateNames.push(plate._props.Name); // Push the name to the silencerNames array
        // });

        // plateNames.forEach(name => this.logger.warning(`${this.modName} - ARMOR PLATE: ${name}`)); // This will print each name on a new line

        // const armoredEquipNames = [];
        // // Iterate over the filtered armor plates and collect names
        // armoredEquip.forEach((armor) => {
        //     armoredEquipNames.push(armor._props.Name); // Push the name to the silencerNames array
        // });

        // armoredEquipNames.forEach(name => this.logger.success(`${this.modName} - ARMORED EQUIPMENT: ${name}`)); // This will print each name on a new line

        //Buff Fuel Can Resource limits
        for (let i in items) {
            if (items[i]._parent === "5d650c3e815116009f6201d2") {
                if (items[i]._id === "5d1b36a186f7742523398433") { //Metal Fuel Tank
                    items[i]._props.Resource = 220
                    items[i]._props.MaxResource = 220

                } else if (items[i]._id === "5d1b371186f774253763a656") { //Expeditionary Fuel Tank
                    items[i]._props.Resource = 100
                    items[i]._props.MaxResource = 100

                }
            }
        };

        //Hideout Production and Area Build Timers - WIP
        //Area Instant Build Timers
        hideoutZones.forEach(zone => {
            Object.keys(zone.stages).forEach(stageKey => {
                zone.stages[stageKey].constructionTime = 0;
            });
        });

        //Area Production Timers
        hideoutProds.forEach(zone => {
            zone.productionTime = 5;
        });

        //ScavCase Production Timers
        hideoutScavs.forEach(zone => {
            zone.ProductionTime = 5;
        });

        //Allow SMGs to be holstered in Pistol Slot
        const defaultInventory = database.templates.items["55d7217a4bdc2d86028b456d"];
        defaultInventory._props.Slots[2]._props.filters[0].Filter = ["5447b5cf4bdc2d65278b4567", "5447b5e04bdc2d62278b4567"]

        currencies.forEach((currency) => {
            if (
                currency?._props.StackMaxSize
            ) {
                currency._props.StackMaxSize *= 2
            }
            const moneyName = currency._props.ShortName
            this.logger.success(`[${this.modName}]: CURRENCY: ${moneyName} stack size doubled.`)
        });

        // Loop over all the ammunition the above code found
        ammunition.forEach((ammo) => {
            if (
                ammo?._parent !== "5485a8684bdc2da71d8b4567" &&
                ammo?._props.Caliber !== "Caliber127x108" &&
                ammo?._props.Caliber !== "Caliber40x46" &&
                ammo?._props.DurabilityBurnModificator &&
                ammo?._props.StackMaxSize
            ) {
                ammo._props.DurabilityBurnModificator = 1; // remove durability damage trait from ammo
                ammo._props.StackMaxSize = 500 // increase all ammo stack sizes to 500
            }
            const ammoName = ammo._name.replace(/^patron_|\_/g, " ");
            this.logger.success(`[${this.modName}] AMMUNITION: ${ammoName} durability burn removed.`)
        });

        //Remove all armor, armor vest, helmet, and any other gear with movement or speed penalty
        for (let i in items) {
            let item = items[i]._props

            if (items[i]._parent === "5a341c4686f77469e155819e" || items[i]._parent === "5a341c4086f77401f2541505" || // _parent is 'FaceCover' and 'Headwear', respectively.
                items[i]._parent === "5448e5284bdc2dcb718b4567" || items[i]._parent === "5448e54d4bdc2dcc718b4568" || // _parent is 'Chest rig' and 'Armor', respectively.
                items[i]._parent === "57bef4c42459772e8d35a53b" || items[i]._parent === "644120aa86ffbe10ee032b6f") { // _parent is 'Armored equipment' and 'Armor plate', respectively.
                item.mousePenalty = 0
                item.speedPenaltyPercent = 0
                item.weaponErgonomicPenalty = 0
            }
        };
    }
}

module.exports = { mod: new CreatureComforts() }