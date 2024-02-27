import { BuildingTypesOptions } from "./buildingTypes";
import { CleaningOptions } from './cleaningTypes';

export interface CleaningCosts {
    cleaningTypes: CleaningOptions;
    buildingTypes: BuildingTypesOptions;
    cost: number;
}