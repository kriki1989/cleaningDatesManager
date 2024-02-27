<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import MonthCalendar from '../components/calendars/MonthCalendar.vue'
import HistoricalLog from '../components/forms/HistoricalLog.vue'

// store imports
import { useBuildingManager } from '@/stores/buildingManager'
import type { Building, Job } from '@/stores/models/building'
import { CleaningColors, CleaningOptions, CleaningOptionsSelect } from '@/stores/models/cleaningTypes'
import { BuildingTypesOptionsSelect } from '@/stores/models/buildingTypes'

const store = useBuildingManager();
const cleaningOptionsSelect = CleaningOptionsSelect;
const buildingTypesOptionsSelect = BuildingTypesOptionsSelect;
const search = ref('');
const addressColumnShown = ref(true);
const codeColumnShown = ref(true);
const typeColumnShown = ref(true);
const columnDialog = ref(false);
const visibility = ref(true);
const month = ref(0);
const year = ref(0);
const originalHeaders = ref<any[]>([]);
const headers = ref<any[]>([]);
const datesOfTheMonth = ref([{date: ' ', name: ' '}]);
const dialog = ref(false);
const dialogDelete = ref(false);
const form = ref(null);
const editedIndex = ref(-1);
const editedItem = ref({
  name: '',
  code: '',
  building_type: '',
  jobs: reactive<Job[]>([])
});
const defaultItem = ref({
  name: '',
  code: '',
  building_type: '',
  jobs: reactive<Job[]>([])
});

const buildings = computed(() => {
  return store.getBuildings;
});
const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'New Item' : 'Edit Item';
});
const datesOfTheMonthSelectOptions = computed(() => {
  return datesOfTheMonth.value.map(date => {
    return { title: date.name + ' ' + date.date, value: date.date };
  });
});

watch( dialog, (val) => val || close() );
watch( dialogDelete, (val) => val || closeDelete() );

const handleUpdateVisibility = (value = null) => {
  if (typeof value === 'boolean') {
    visibility.value = value;
  } else {
    visibility.value = !visibility.value;
  }
};

const handleUpdateHeaders = (selectedDates: any) => {
  let headersObj: {title: string, key: string, sortable: boolean, align?: string}[] = [
    { title: 'Actions', key: 'actions', sortable: false }
  ];
  if (addressColumnShown.value) headersObj.push({ title: 'Address', align: 'start', key: 'name', sortable: true });
  if (codeColumnShown.value) headersObj.push({ title: 'Code', key: 'code', sortable: true });
  if (typeColumnShown.value) headersObj.push({ title: 'Type', key: 'building_type', sortable: true });

  const dateStringArray = selectedDates.map((date: Date) => {
      const isoDateString = date.toDateString();
      const inputDateString = new Date(isoDateString);
      const day = String(inputDateString.getDate()).padStart(2, '0');
      const month = String(inputDateString.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const year = inputDateString.getFullYear();

      return `${day}-${month}-${year}`;
  });

  const copyAllHeaders = [...originalHeaders.value];
  copyAllHeaders.forEach((item: any) => {
    if (item.title && dateStringArray.some((date: string) => item.title.startsWith(date))) {
      headersObj.push(item);
    }
  });

  headers.value = [...headersObj];
};

// TODO: Make Async
const handleUpdateView = (payload: {month: number, year: number}) => {
  month.value = payload.month;
  year.value = payload.year;
  // TODO: Make await
  fetchNewDataTable();
};

// TODO: Make async
const fetchNewDataTable = () => {
  startHeaders();
  // TODO: Make await
  store.fetchBuildingsJobs(datesOfTheMonth.value[0].date, datesOfTheMonth.value[datesOfTheMonth.value.length-1].date);
};

const startHeaders = () => {
  let headersObj: {title: string, key: string, sortable: boolean, align?: string}[] = [
    { title: 'Actions', key: 'actions', sortable: false }
  ];
  if (addressColumnShown.value) headersObj.push({ title: 'Address', align: 'start', key: 'name', sortable: true });
  if (codeColumnShown.value) headersObj.push({ title: 'Code', key: 'code', sortable: true });
  if (typeColumnShown.value) headersObj.push({ title: 'Type', key: 'building_type', sortable: true });

  datesOfTheMonth.value = generateDaysOfWeek(month.value, year.value);
  datesOfTheMonth.value.forEach(item => {
    const newObj: any = {
      title: item.date,
      align: 'center',
      children: [{
        title: item.name,
        label: item.date,
        key: 'customField',
        minWidth: '130px',
        align: 'center',
        sortable: false
      }]
    }
    headersObj.push(newObj);
  })
  originalHeaders.value = [...headersObj];
  headers.value = [...headersObj];
};

const addEmptyElement = () => {
  if (editedItem.value.jobs === null) {
    editedItem.value.jobs = [{
      date: '',
      cleaning_type: CleaningOptions.Out,
      color: CleaningColors.Red
    }]
  } else {
    editedItem.value.jobs.push({
      date: '',
      cleaning_type: CleaningOptions.Out,
      color: CleaningColors.Red
    })
  }
};

const removeElement = (id: number) => {
  editedItem.value.jobs.splice(id, 1);
};

const editItem = (item: Building) => {
  editedIndex.value = buildings.value.indexOf(item);
  editedItem.value = { ...item };
  if (editedItem.value.jobs !== null)
    editedItem.value.jobs = editedItem.value.jobs.map(job => ({ ...job }));
  dialog.value = true
};

const deleteItem = (item: Building) => {
  editedIndex.value = buildings.value.indexOf(item);
  editedItem.value = { ...item };
  if (editedItem.value.jobs !== null)
    editedItem.value.jobs = editedItem.value.jobs.map(job => ({ ...job }));
  dialogDelete.value = true
};

// TODO: Make async - await
const deleteItemConfirm = () => {
  store.deleteBuilding(buildings.value[editedIndex.value], editedIndex.value);
  closeDelete()
};

const close = () => {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem.value };
    editedIndex.value = -1;
  })
};

const closeDelete = () => {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = { ...defaultItem.value };
    editedIndex.value = -1;
  })
};

const updateColorSelection = (el: {date: string, cleaning_type: string, color: string}) => {
  switch(el.cleaning_type) {
    case CleaningOptions.Out:
      el.color = CleaningColors.Red;
      break;
    case CleaningOptions.In:
      el.color = CleaningColors.Green;
      break;
    case CleaningOptions.Out_in:
      el.color = CleaningColors.Purple;
      break;
    case CleaningOptions.Refresh:
      el.color = CleaningColors.Orange;
      break;
    case CleaningOptions.Other:
      el.color = CleaningColors.Custom;
      break;
    case CleaningOptions.New:
      el.color = CleaningColors.Yellow;
      break;
  }
};

const save = async () => {
  const { valid } = await form.value.validate();
  if (valid) {
    if (editedIndex.value > -1) {
      // TODO:  Make await
      // update item
      store.updateBuilding(editedIndex.value, editedItem.value);
    } else {
      // TODO:  Make await
      // new item
      store.addBuilding(editedItem.value);

      // TODO: Once store connects, uncomment the below command
      // store.fetchBuildingsJobs(this.datesOfTheMonth.value[0].date, this.datesOfTheMonth.value[this.datesOfTheMonth.value.length-1].date);
    }
    close();
  }
}

const generateDaysOfWeek = (month: number, year: number) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
    const formattedDate = {
      date: `${day.toString().padStart(2, '0')}-${(month).toString().padStart(2, '0')}-${year}`,
      name: `${dayOfWeek}`
    };

    daysArray.push(formattedDate);
  }

  return daysArray;
};

const getCurrentMonth = (): number => {
  const currentDate = new Date();
  return currentDate.getMonth() + 1; // Adding 1 to get the human-readable month
};
const getCurrentYear = (): number => {
  const currentDate = new Date();
  return currentDate.getFullYear();
};


month.value = getCurrentMonth();
year.value = getCurrentYear();
// TODO: await store.fetchBuildingsJobs...
fetchNewDataTable();
</script>

<template>
  <main>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <h1>Buildings Manager</h1>
        </v-col>
        <v-col class="py-0">
            <MonthCalendar @updateHeaders="handleUpdateHeaders" :month="month" />

            <v-btn class="ms-3" prepend-icon="mdi-filter" variant="outlined" @click="columnDialog = true">
              Toggle Columns
            </v-btn>
            <v-dialog v-model="columnDialog" max-width="500px">
              <v-card class="py-5">
                <v-card-title class="text-center">Toggle visibility of columns</v-card-title>
                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" class="py-0">
                        <v-checkbox label="Address" density="compact" :hide-details="true" v-model="addressColumnShown" @update:modelValue="startHeaders"></v-checkbox>
                      </v-col>
                      <v-col cols="12" class="py-0">
                        <v-checkbox label="Code" density="compact" :hide-details="true" v-model="codeColumnShown" @update:modelValue="startHeaders"></v-checkbox>
                      </v-col>
                      <v-col cols="12" class="py-0">
                        <v-checkbox label="Type" density="compact" :hide-details="true" v-model="typeColumnShown" @update:modelValue="startHeaders"></v-checkbox>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>
              </v-card>
            </v-dialog>

            <v-btn class="ms-3" prepend-icon="mdi-filter" variant="outlined" @click="handleUpdateVisibility">
            {{ visibility ? 'Show' : 'Hide' }}
              Historical Log
            </v-btn>

            <v-btn
              class="ms-3"
              prepend-icon="mdi-calculator"
              variant="flat"
              color="green"
              @click="$router.push({ name: 'calculatorResults', params: { month: month, year: year } })"
            >
              Calculate Payments
            </v-btn>
        </v-col>
      </v-row>

      <v-row v-if="visibility">
        <v-card
          class="buildingsCard"
          flat
        >
          <template v-slot:text>
            <v-text-field
              v-model="search"
              label="Search"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              single-line
              variant="outlined"
              hide-details
            ></v-text-field>
          </template>
          <v-data-table
            class="customTableSize"
            :headers="headers"
            :items="buildings"
            :search="search"
            :sort-by="[{ key: 'building_id', order: 'asc' }]"
            item-key="id"
            items-per-page="-1"
            sticky
            hover
          >
            <template v-slot:top>

                <v-dialog
                  v-model="dialog"
                  max-width="700px"
                >

                  <template v-slot:activator="{ props }">
                    <div class="d-flex justify-start">
                      <div class="px-3" style="width: 212px">
                          <v-btn
                            color="#673ab7"
                            dark
                            class="mb-2"
                            v-bind="props"
                          >
                            Add New Building
                          </v-btn>
                      </div>
                      <div class="px-3" style="width: 283px">
                          <v-btn
                            color="#673ab7"
                            dark
                            class="mb-2"
                          >
                            Restore Existing Building
                          </v-btn>
                      </div>
                    </div>
                  </template>
                  <v-form ref="form" @submit.prevent>
                    <v-card>
                      <v-card-title class="px-10 pt-8">
                        <span>{{ formTitle }}</span>
                      </v-card-title>

                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col
                              cols="12"
                            >
                              <v-text-field
                                v-model="editedItem.name"
                                :rules="[(v: string) => !!v || 'Building address is required', (v: string) => (v && v.length <= 150) || 'Building address must be less than 150 characters']"
                                required
                                label="Address"
                              ></v-text-field>
                            </v-col>
                            <v-col
                              lg="6"
                              cols="12"
                            >
                              <v-text-field
                                v-model="editedItem.code"
                                label="Code"
                              ></v-text-field>
                            </v-col>
                            <v-col
                              lg="6"
                              cols="12"
                            >
                              <v-select
                                v-model="editedItem.building_type"
                                :items="buildingTypesOptionsSelect"
                                label="Building Type"
                              ></v-select>
                            </v-col>
                            </v-row>
                            <template v-for="(el, i) in editedItem.jobs" :key="i">

                            <v-row
                              class="dateCard"
                            >
                              <v-col
                                class="py-0"
                                lg="5"
                                cols="12"
                              >
                                <v-select
                                  v-model="el.date"
                                  :item-props="true"
                                  :items="datesOfTheMonthSelectOptions"
                                  :rules="[(v: string) => !!v || 'Date is required']"
                                  required
                                  label="Date"
                                ></v-select>
                              </v-col>
                              <v-col
                                class="py-0"
                                lg="5"
                                cols="12"
                              >
                                <v-select
                                  v-model="el.cleaning_type"
                                  :items="cleaningOptionsSelect"
                                  :rules="[(v: string) => !!v || 'Cleaning type is required']"
                                  required
                                  label="Cleaning Type"
                                  @update:modelValue="updateColorSelection(el)"
                                ></v-select>
                              </v-col>
                              <v-col
                                class="py-0"
                                lg="2"
                                cols="12"
                              >
                                <v-btn icon="mdi-close" variant="plain" color="gray" @click="removeElement(i)">
                                </v-btn>
                              </v-col>
                            </v-row>
                            </template>
                            <v-row>
                            <v-col cols="12">
                              <v-btn prepend-icon="mdi-plus" variant="outlined" color="gray" @click="addEmptyElement()">
                                New Date
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-container>
                      </v-card-text>

                      <v-card-actions class="py-5 px-5">
                        <v-spacer></v-spacer>
                        <v-btn prepend-icon="mdi-close" variant="outlined" color="red" @click="close">
                          Cancel
                        </v-btn>
                        <v-btn prepend-icon="mdi-check" variant="outlined" color="green" type="submit" @click="save">
                          {{ editedIndex === -1 ? 'Create' : 'Update' }}
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-form>
                </v-dialog>

                <v-dialog v-model="dialogDelete" max-width="500px">
                  <v-card class="py-5">
                    <v-card-title class="text-center">Are you sure you want to delete this item?</v-card-title>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn prepend-icon="mdi-close" variant="outlined" color="red" @click="closeDelete">
                        Cancel
                      </v-btn>
                      <v-btn prepend-icon="mdi-check" variant="outlined" color="green" @click="deleteItemConfirm">
                        Apply
                      </v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-card>
                </v-dialog>
            </template>

            <template v-slot:item.customField="{ item, column }">
              <span v-for="(rec, i) in item.jobs" :key="i">
                <span v-if="column.label?.includes(rec.date)">
                  <strong class="font-bold" :style="{'color': rec.color}">{{ rec.cleaning_type }}</strong>
                </span>
              </span>
            </template>

            <template v-slot:item.actions="{ item }">
              <v-icon
                size="small"
                class="me-2"
                @click="editItem(item)"
                color="green"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                size="small"
                @click="deleteItem(item)"
                color="red"
              >
                mdi-delete
              </v-icon>
            </template>

            <template v-slot:no-data>
              Please Refresh the page, something went wrong!
            </template>

          </v-data-table>
        </v-card>

      </v-row>
      <v-row v-else>
        <v-col>
          <HistoricalLog @updateView="handleUpdateView" @updateVisibility="handleUpdateVisibility"/>
        </v-col>
      </v-row>
    </v-container>
  </main>
</template>

<style scoped>
.customTableSize.v-table {
  height: 680px;
  scroll-behavior: auto;
}

.customTableSize :deep(tr.v-data-table__tr) {
  white-space: nowrap;
}

.customTableSize :deep(.v-data-table__td) {
  --v-table-header-height: 32px;
  height: 32px;
}

:deep(.buildingsCard.v-card .v-card-text) {
  padding: 12px;
}

@media only screen and (max-width: 1279px) {
  .dateCard {
    border: 1px solid lightgray;
    border-radius: 25px;
    padding-top: 22px;
    margin-bottom: 10px;
  }
}
</style>