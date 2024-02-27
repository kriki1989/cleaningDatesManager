<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps(['month']);
const emits = defineEmits(['updateHeaders']);
const selectDate = ref<any[]>([]);
const openFilter = ref(false);

const filterDates = () => {
  if (selectDate.value.length >= 2) {
    emits('updateHeaders', selectDate.value);
    setTimeout(() => { openFilter.value = false }, 300);
  }
};
</script>

<template>
    <v-btn prepend-icon="mdi-calendar" variant="outlined" @click="openFilter = !openFilter">
        Filter Dates
    </v-btn>
    <v-date-picker v-if="openFilter" class="filterDateUI" :hide-header="true" elevation="12" multiple="range" v-model="selectDate" :month="props.month-1" position="absolute" @click="filterDates"></v-date-picker>
</template>


<style scoped>
.filterDateUI { top: 140px;z-index: 1; }
.filterDateUI :deep(.v-date-picker-controls) {
  display: none;
}
.filterDateUI :deep(.v-date-picker-month) {
  padding-top: 40px;
}

</style>