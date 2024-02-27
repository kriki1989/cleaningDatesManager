import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useBuildingManager } from './buildingManager';
import type { CleaningCosts } from './models/cleaningCosts';
import { CleaningOptions } from './models/cleaningTypes';
import { BuildingTypesOptionsSelect } from './models/buildingTypes';
import type { Job } from './models/building';

// TODO: REMOVE
import { cleaning_costs } from './fetchedDbData/cleaningCostsLIST';

export interface CostRecord {
    name: string;
    out: number;
    out_in: number;
    "out-out_in": number;
    refresh: number;
    "out-out_inPrice": number;
    refreshPrice: number;
}

export const useCalculatePayments = defineStore('calculatePayments', () => {
    //state
    const cleaningCosts = ref<CleaningCosts[]>([]);
    const calculatedList = ref<CostRecord[]>([]);
    const totalRefresh = ref<number | null>(null);
    const totalRefreshPrice = ref<number | null>(null);

    // actions
    const fetchCosts = () => {
        //TODO: Call Api and update store
        cleaningCosts.value = [...cleaning_costs];
    }

    const initializeCalculations = () => {
        const counters = {
            outCounter: 0,
            out_inCounter: 0,
            refreshCounter: 0,
            totalRefreshCounter: 0,
            totalRefreshCalcPrice: 0
        };

        const cloneAllBuildings = [...useBuildingManager().allBuildings];

        const startCalculationList: CostRecord[] = cloneAllBuildings
            .filter(building => building.jobs !== null)
            .map(building => produceCalculatedList(building, counters));

        const groupedByBuildingType: Record<string, CostRecord> = groupUpWithBuildingType(startCalculationList);
        const rearrangedKeys: Record<string, CostRecord> = rearrangeKeyRecords(groupedByBuildingType);
        // Merge the remaining keys (if any) into the groupedByBuildingType
        Object.assign(groupedByBuildingType, rearrangedKeys);

        const preFinalCalculationList: Record<string, CostRecord> = mergeRoomAndStudio(groupedByBuildingType);
        const finalCalculationList: CostRecord[] = Object.values(preFinalCalculationList);

        calculatedList.value = [...finalCalculationList];
        totalRefresh.value = counters.totalRefreshCounter;
        totalRefreshPrice.value = counters.totalRefreshCalcPrice;
    }


    /* PRIVATE FUNCTIONS */
    const produceCalculatedList = (building: any, counters: any) => {
        counters = countCleaningTypes(building, counters);

        let calculatedRecord = null;
        [ calculatedRecord, counters ] = calculatePrices(building, counters);

        return { ...calculatedRecord };
    }

    const countCleaningTypes = (building: any, counters: any) => {
        counters.outCounter = 0;
        counters.out_inCounter = 0;
        counters.refreshCounter = 0;

        building.jobs.map((job: Job) => {
            if (job.cleaning_type === CleaningOptions.Out) {
                counters.outCounter++;
            } else if (job.cleaning_type === CleaningOptions.Out_in) {
                counters.out_inCounter++;
            } else if (job.cleaning_type === CleaningOptions.Refresh) {
                counters.refreshCounter++;
                counters.totalRefreshCounter++;
            }
        })
        return counters;
    }

    const calculatePrices = (building: any, counters: any) => {
        const out_outIn_Counter: number = counters.outCounter + counters.out_inCounter;

        const out_outIn_Price: number = calculateOutInPrice(building.building_type);
        const refreshPrice: number = calculateRefreshPrice(building.building_type);

        const calculatedRecord: CostRecord = {
            name: building.building_type,
            out: counters.outCounter,
            out_in: counters.out_inCounter,
            'out-out_in': out_outIn_Counter,
            refresh: counters.refreshCounter,
            'out-out_inPrice': out_outIn_Counter * out_outIn_Price,
            refreshPrice: counters.refreshCounter * refreshPrice
        }

        counters.totalRefreshCalcPrice += counters.refreshCounter * refreshPrice;
        return [ calculatedRecord, counters ];
    }

    const calculateOutInPrice = (building_type: string): number => {
        let price = 1;
        cleaningCosts.value.map(item => {
            if (
                building_type === item.buildingTypes &&
                item.cleaningTypes === CleaningOptions.Out_in
            ) {
                price = item.cost;
            }
        })
        return price;
    }

    const calculateRefreshPrice = (building_type: string): number => {
        let price = 1;
        cleaningCosts.value.map(item => {
            if (
                building_type === item.buildingTypes &&
                item.cleaningTypes === CleaningOptions.Refresh
            ) {
                price = item.cost;
            }
        })
        return price;
    }

    // This function groups the records according to the building type and sums all the fields in the object
    const groupUpWithBuildingType = (CostRecords: CostRecord[]) => {
        const result: Record<string, CostRecord> = {};

        CostRecords.forEach((record) => {
            const { name, ...rest } = record;

            if (!result[name]) {
                result[name] = { name, ...rest };
            } else {
                for (const key in rest) {
                    if (Object.prototype.hasOwnProperty.call(rest, key)) {
                        result[name][key] += rest[key];
                    }
                }
            }
        });

        return result;
    }

    const rearrangeKeyRecords = (result: Record<string, CostRecord>) => {
        const keyOrder = BuildingTypesOptionsSelect;

         // Reorder keys according to keyOrder
        const orderedResult: Record<string, CostRecord> = {};
        keyOrder.forEach((key) => {
            if (result[key]) {
                orderedResult[key] = result[key];
                delete result[key];
            }
        });

        return orderedResult;
    }

    const mergeRoomAndStudio = (groupedByBuildingType: Record<string, CostRecord>) => {
        const mergedEntry = {
            name: 'Room/Studio',
            out: groupedByBuildingType.Room.out + groupedByBuildingType.Studio.out,
            out_in: groupedByBuildingType.Room.out_in + groupedByBuildingType.Studio.out_in,
            "out-out_in": groupedByBuildingType.Room["out-out_in"] + groupedByBuildingType.Studio["out-out_in"],
            refresh: groupedByBuildingType.Room.refresh + groupedByBuildingType.Studio.refresh,
            "out-out_inPrice": groupedByBuildingType.Room["out-out_inPrice"] + groupedByBuildingType.Studio["out-out_inPrice"],
            refreshPrice: groupedByBuildingType.Room.refreshPrice + groupedByBuildingType.Studio.refreshPrice
        };
        delete groupedByBuildingType["Studio"];
        delete groupedByBuildingType["Room"];

        return { "roomStudio": mergedEntry, ...groupedByBuildingType };
    }


    return {
        calculatedList,
        totalRefresh,
        totalRefreshPrice,

        fetchCosts,
        initializeCalculations
    }
})