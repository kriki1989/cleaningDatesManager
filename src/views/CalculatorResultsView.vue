<script setup lang="ts">
import { reactive, onMounted, getCurrentInstance } from 'vue';
import { useCalculatePayments } from '@/stores/calculatePayments';

const dateInfo = reactive({
  month: '',
  year: ''
})

const store = useCalculatePayments();
store.fetchCosts();
store.initializeCalculations();

onMounted(() => {
  const { params } = getCurrentInstance().appContext.config.globalProperties.$route;

  dateInfo.month = params.month;
  dateInfo.year = params.year;
});

const items = store.calculatedList;
const totalRefresh = store.totalRefresh;
const totalRefreshPrice = store.totalRefreshPrice;
</script>

<template>
  <main>
    <h1>Calculator Results for {{ dateInfo.month }}/{{ dateInfo.year }}</h1>

    <v-table class="mt-10" density="compact" id="calculateTable">
      <thead>
        <tr>
          <th></th>
          <th class="text-left">
            OUT
          </th>
          <th class="text-left">
            OUT/IN
          </th>
          <th class="text-left">
            OUT+OUT/IN
          </th>
          <th class="text-left">
            REFRESH
          </th>
          <th class="text-left">
            OUT+OUT/IN PAYMENT
          </th>
          <th class="text-left">
            REFRESH PAYMENT
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in items" :key="i">
          <th>{{ item.name }}</th>
          <td>{{ item.out }}</td>
          <td>{{ item.out_in }}</td>
          <td>{{ item['out-out_in'] }}</td>
          <td>{{ item.refresh }}</td>
          <td>{{ item['out-out_inPrice'] }} &euro;</td>
          <td>{{ item.refreshPrice }} &euro;</td>
        </tr>
        <tr>
          <th>TOTAL REFRESH</th>
          <td></td>
          <td></td>
          <td></td>
          <td>{{ totalRefresh }}</td>
          <td></td>
          <td>{{ totalRefreshPrice }} &euro;</td>
        </tr>
      </tbody>
    </v-table>

  </main>
</template>

<style scoped>
#calculateTable table tr th {
  font-weight: bold;
}
</style>
