export interface CleaningTypes {
    id: number;
    name: CleaningOptions;
    color: CleaningColors;
}

export enum CleaningOptions {
    Out = 'OUT',
    In = 'IN',
    Out_in = 'OUT/IN',
    Refresh = 'REFRESH',
    Other = 'OTHER',
    New = 'NEW'
}

export enum CleaningColors {
    Red = 'red',
    Green = 'green',
    Purple = 'purple',
    Orange = 'orange',
    Custom = '#ffc000',
    Yellow = '#b8a81a'
}

export const CleaningOptionsSelect = [
    CleaningOptions.Out,
    CleaningOptions.In,
    CleaningOptions.Out_in,
    CleaningOptions.Refresh,
    CleaningOptions.Other,
    CleaningOptions.New
]

export const CleaningColorsSelect = [
    CleaningColors.Red,
    CleaningColors.Green,
    CleaningColors.Purple,
    CleaningColors.Orange,
    CleaningColors.Custom,
    CleaningColors.Yellow
]