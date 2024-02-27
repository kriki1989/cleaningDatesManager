<script lang="ts">
import MonthCalendar from '../components/calendars/MonthCalendar.vue';
import HistoricalLog from '../components/forms/HistoricalLog.vue';

// store imports
import { mapState } from 'pinia';
import { useBuildingManager } from '@/stores/buildingManager';
import type { Building } from '@/stores/models/building';
import { CleaningOptionsSelect, CleaningColorsSelect, CleaningOptions, CleaningColors } from '@/stores/models/cleaningTypes';
import { BuildingTypesOptionsSelect } from '@/stores/models/buildingTypes';

  export default {
    components: {
      MonthCalendar,
      HistoricalLog
    },
    data: () => ({
      cleaningOptionsSelect: CleaningOptionsSelect,
      cleaningColorsSelect: CleaningColorsSelect,
      buildingTypesOptionsSelect: BuildingTypesOptionsSelect,
      search: '',
      addressColumnShown: true,
      codeColumnShown: true,
      typeColumnShown: true,
      columnDialog: false,
      visibility: true,
      month: 0,
      year: 0,
      originalHeaders: [{}],
      headers: [{}],
      monthDates: [''],
      datesOfTheMonth: [{date: ' ', name: ' '}],
      dialog: false,
      dialogDelete: false,
      editedIndex: -1,
      editedItem: {
        name: '',
        code: '',
        building_type: '',
        jobs: null
      },
      defaultItem: {
        name: '',
        code: '',
        building_type: '',
        jobs: null
      },
    }),

    computed: {
      ...mapState(useBuildingManager, {
        buildings: 'getBuildings'
      }),
      formTitle () {
        return this.editedIndex === -1 ? 'New Item' : 'Edit Item'
      },
      datesOfTheMonthSelectOptions() {
        const datesSelectArray = this.datesOfTheMonth.map(date => {
          return { title: date.name + ' ' + date.date, value: date.date};
        })

        return datesSelectArray;
      }
    },

    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },

    // TODO: async created
    created () {
      this.month = this.getCurrentMonth();
      this.year = this.getCurrentYear();
      // TODO: await useBuildingManager().fetchBuildingsJobs...
      this.fetchNewDataTable();
    },

    methods: {
      handleUpdateVisibility(value = null) {
        if (typeof value === 'boolean') {
          this.visibility = value;
        } else {
          this.visibility = !this.visibility;
        }
      },

      handleUpdateHeaders(selectedDates: any) {
        let headersObj = [
          { title: 'Actions', key: 'actions', sortable: false }
        ];
        if (this.addressColumnShown) headersObj.push({ title: 'Address', align: 'start', key: 'name', sortable: true });
        if (this.codeColumnShown) headersObj.push({ title: 'Code', key: 'code', sortable: true });
        if (this.typeColumnShown) headersObj.push({ title: 'Type', key: 'building_type', sortable: true });

        const dateStringArray = selectedDates.map((date: Date) => {
            const isoDateString = date.toDateString();
            const inputDateString = new Date(isoDateString);
            const day = String(inputDateString.getDate()).padStart(2, '0');
            const month = String(inputDateString.getMonth() + 1).padStart(2, '0'); // Months are zero-based
            const year = inputDateString.getFullYear();

            return `${day}-${month}-${year}`;
        });

        const copyAllHeaders = [...this.originalHeaders];
        copyAllHeaders.forEach((item: any) => {
          if (item.title && dateStringArray.some((date: string) => item.title.startsWith(date))) {
            headersObj.push(item);
          }
        });

        this.headers = [...headersObj];
      },

      // TODO: Make Async
      handleUpdateView(payload: {month: number, year: number}) {
        this.month = payload.month;
        this.year = payload.year;
        // TODO: Make await
        this.fetchNewDataTable();
      },

      // TODO: Make async
      fetchNewDataTable() {
        this.startHeaders();
        // TODO: Make await
        useBuildingManager().fetchBuildingsJobs(this.datesOfTheMonth[0].date, this.datesOfTheMonth[this.datesOfTheMonth.length-1].date);
      },

      startHeaders() {
        let headersObj = [
          { title: 'Actions', key: 'actions', sortable: false }
        ];
        if (this.addressColumnShown) headersObj.push({ title: 'Address', align: 'start', key: 'name', sortable: true });
        if (this.codeColumnShown) headersObj.push({ title: 'Code', key: 'code', sortable: true });
        if (this.typeColumnShown) headersObj.push({ title: 'Type', key: 'building_type', sortable: true });

        this.datesOfTheMonth = this.generateDaysOfWeek(this.month, this.year);
        this.datesOfTheMonth.forEach(item => {
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
        this.originalHeaders = [...headersObj];
        this.headers = [...headersObj];
      },

      addEmptyElement() {
        if (this.editedItem.jobs === null) {
          this.editedItem.jobs = [{
            date: null,
            cleaning_type: null,
            color: null
          }]
        } else {
          this.editedItem.jobs.push({
            date: null,
            cleaning_type: null,
            color: null
          })
        }
      },
      removeElement(id: number) {
        this.editedItem.jobs.splice(id, 1);
      },

      editItem (item: Building) {
        this.editedIndex = this.buildings.indexOf(item);
        this.editedItem = { ...item };
        if (this.editedItem.jobs !== null)
          this.editedItem.jobs = this.editedItem.jobs.map(job => ({ ...job }));
        this.dialog = true
      },

      deleteItem (item: Building) {
        this.editedIndex = this.buildings.indexOf(item);
        this.editedItem = { ...item };
        if (this.editedItem.jobs !== null)
          this.editedItem.jobs = this.editedItem.jobs.map(job => ({ ...job }));
        this.dialogDelete = true
      },

      deleteItemConfirm () {
        useBuildingManager().deleteBuilding(this.buildings[this.editedIndex], this.editedIndex);
        this.closeDelete()
      },

      close () {
        this.dialog = false
        this.$nextTick(() => {
          this.editedItem = { ...this.defaultItem };
          this.editedIndex = -1
        })
      },

      closeDelete () {
        this.dialogDelete = false
        this.$nextTick(() => {
          this.editedItem = { ...this.defaultItem };
          this.editedIndex = -1
        })
      },

      updateColorSelection(el: {date: string, cleaning_type: string, color: string}) {
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
        }
      },

      async save () {
        const { valid } = await this.$refs.form.validate();
        if (valid) {
          if (this.editedIndex > -1) {
            // update item
            useBuildingManager().updateBuilding(this.editedIndex, this.editedItem);
          } else {
            // new item
            useBuildingManager().addBuilding(this.editedItem);

            // TODO: Once store connects, uncomment the below command
            // useBuildingManager().fetchBuildingsJobs(this.datesOfTheMonth[0].date, this.datesOfTheMonth[this.datesOfTheMonth.length-1].date);
          }
          this.close()
        }
      },

      generateDaysOfWeek(month: number, year: number) {
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
      },

      getCurrentMonth(): number {
        const currentDate = new Date();
        return currentDate.getMonth() + 1; // Adding 1 to get the human-readable month
      },
      getCurrentYear(): number {
        const currentDate = new Date();
        return currentDate.getFullYear();
      }
  }
}
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
            items-per-page="10"
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
                  <v-form ref="form">
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
                                :rules="[v => !!v || 'Building address is required', v => (v && v.length <= 150) || 'Building address must be less than 150 characters']"
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
                                :rules="[v => !!v || 'Building Code is required', v => (v && v.length <= 30) || 'Building Code must be less than 30 characters']"
                                required
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
                                :rules="[v => !!v || 'Building type is required']"
                                required
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
                                lg="4"
                                cols="12"
                              >
                                <v-select
                                  v-model="el.date"
                                  :item-props="true"
                                  :items="datesOfTheMonthSelectOptions"
                                  :rules="[v => !!v || 'Date is required']"
                                  required
                                  label="Date"
                                ></v-select>
                              </v-col>
                              <v-col
                                class="py-0"
                                lg="3"
                                cols="12"
                              >
                                <v-select
                                  v-model="el.cleaning_type"
                                  :items="cleaningOptionsSelect"
                                  :rules="[v => !!v || 'Cleaning type is required']"
                                  required
                                  label="Cleaning Type"
                                  @update:modelValue="updateColorSelection(el)"
                                ></v-select>
                              </v-col>
                              <v-col
                                class="py-0"
                                col="auto"
                              >
                                <v-select
                                  v-model="el.color"
                                  :items="cleaningColorsSelect"
                                  :rules="[v => !!v || 'Color is required']"
                                  required
                                  label="Color"
                                  disabled
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
  height: 671px;
  scroll-behavior: auto;
}
.customTableSize :deep(tr.v-data-table__tr) {
  white-space: nowrap;
}

.customTableSize :deep(.v-data-table__td) {
  --v-table-header-height: 40px;
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