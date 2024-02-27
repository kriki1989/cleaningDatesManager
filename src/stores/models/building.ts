import type { CleaningOptions, CleaningColors } from './cleaningTypes';
import type { BuildingTypesOptions } from './buildingTypes';

export interface Job {
    date: string;
    cleaning_type: CleaningOptions;
    color: CleaningColors;
}

export interface Building {
    id: number;
    building_id: number;
    name: string;
    code: string;
    building_type: BuildingTypesOptions;
    jobs: Job[];
}