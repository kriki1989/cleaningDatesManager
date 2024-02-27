import { defineStore } from 'pinia';
import type { Building } from './models/building';
import { ref, computed } from 'vue';

// TODO: REMOVE
import { receivedBuildings } from './fetchedDbData/receivedBuildingsLIST';

export const useBuildingManager = defineStore('buildingManager', () => {
    //state
    const allBuildings = ref<Building[]>([]);
    const buildings = ref<Building[]>([]);

    // getters
    const getBuildings = computed(() => buildings.value)

    // actions
    const fetchBuildingsJobs = (startDate: string, endDate: string) => {
        // console.log(startDate, endDate);
        // TODO: Make a fetch call with startDate and endDate
        // reads imported file - SHALL BE REMOVED and fetch from db

        const updatedBuildings: any = [];
        receivedBuildings.forEach((building, index) => updatedBuildings.push(createJobsKey(building, index)));

        allBuildings.value = updatedBuildings.reduce((acc: Building[], currentBuilding: Building) => mergeJobsWithTheSameBuildingId(acc, currentBuilding), []);

        buildings.value = [...allBuildings.value];
    }

    const addBuilding = (item: any) => {
        // TODO: Remove logging and edit appropriate
        console.log(item);
        // call the backend, add the building
        // If success, remove the commands below
        buildings.value.push({ id: '3000', ...item });
        allBuildings.value.push({ id: '3000', ...item });
    }

    const updateBuilding = (index: number, item: any) => {
        // TODO: call the backend, update the building
        // If success, update the store
        Object.assign(buildings.value[index], item)
        Object.assign(allBuildings.value[index], item)
    }

    const deleteBuilding = (item: Building, index: number) => {
        // console.log(item.building_id);
        // TODO: Remove record with item.building_id from store and backend

        // If success, remove from store
        buildings.value.splice(index, 1);
        allBuildings.value.splice(index, 1);
    }

    /* PRIVATE FUNCTIONS */
    const createJobsKey = (building: any, index: number) => {
        if (
            building.date === null &&
            building.cleaning_type === null &&
            building.color === null
        ) {
            return {
                id: index,
                cleaning_id: building.id,
                building_id: building.building_id,
                name: building.name,
                code: building.code,
                building_type: building.building_type,
                jobs: null
            }
        } else {
            return {
                id: index,
                cleaning_id: building.id,
                building_id: building.building_id,
                name: building.name,
                code: building.code,
                building_type: building.building_type,
                jobs: [{
                    date: building.date,
                    cleaning_type: building.cleaning_type,
                    color: building.color
                }]
            }
        }
    }

    const mergeJobsWithTheSameBuildingId = (acc: Building[], currentBuilding: Building) => {
        const existingBuilding = acc.find((b) => b.building_id === currentBuilding.building_id);

            if (existingBuilding) {
                // Merge jobs for buildings with the same building_id
                existingBuilding.jobs.push(...currentBuilding.jobs);
            } else {
                // If building_id is not found in the accumulator, add the current building as is
                acc.push({ ...currentBuilding });
            }

            return acc;
    }

    return {
        allBuildings,
        buildings,

        getBuildings,

        fetchBuildingsJobs,
        addBuilding,
        updateBuilding,
        deleteBuilding
    }
})