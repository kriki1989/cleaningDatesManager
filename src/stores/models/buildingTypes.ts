export interface BuildingTypes {
    id: number;
    name: BuildingTypesOptions;
}

export enum BuildingTypesOptions {
    Room = 'Room',
    Studio = 'Studio',
    '1Bedroom' = '1 Bedroom',
    '2Bedroom' = '2 Bedroom',
    '3Bedroom' = '3 Bedroom'
}

export const BuildingTypesOptionsSelect = [
    BuildingTypesOptions.Room,
    BuildingTypesOptions.Studio,
    BuildingTypesOptions['1Bedroom'],
    BuildingTypesOptions['2Bedroom'],
    BuildingTypesOptions['3Bedroom']
]