<script setup lang="ts">
import { useField, useForm } from 'vee-validate';

const emits = defineEmits(['updateVisibility', 'updateView']);
const months = [
  { title: 'January', value: 1 },
  { title: 'February', value: 2 },
  { title: 'March', value: 3 },
  { title: 'April', value: 4 },
  { title: 'May', value: 5 },
  { title: 'June', value: 6 },
  { title: 'July', value: 7 },
  { title: 'August', value: 8 },
  { title: 'September', value: 9 },
  { title: 'October', value: 10 },
  { title: 'November', value: 11 },
  { title: 'December', value: 12 }
];

const { handleSubmit } = useForm({
  validationSchema: {
    year (value) {
      if (value?.length === 4 && /[0-9-]+/.test(value)) return true

      return 'Year should have 4 digits.'
    },
    monthSelect (value) {
      if (value) return true

      return 'Select a month.'
    }
  },
})

const year = useField('year');
const monthSelect = useField('monthSelect');

const submit = handleSubmit(values => {
  emits('updateView', {month: values.monthSelect, year: values.year});
  emits('updateVisibility', true);
})
</script>

<template>
  <v-form @submit.prevent="submit">
  <div>
    <h2>Select Month</h2>
    <v-select
      v-model="monthSelect.value.value"
      :items="months"
      :error-messages="monthSelect.errorMessage.value"
      label="Month"
    ></v-select>
  </div>
  <div>
    <h2>Select Year</h2>
    <v-text-field
      v-model="year.value.value"
      :counter="4"
      :error-messages="year.errorMessage.value"
      label="Year"
    ></v-text-field>
  </div>
  <div class="d-flex justify-end">
    <v-btn prepend-icon="mdi-close" variant="outlined" color="red" @click="emits('updateVisibility', true)">
      Cancel
    </v-btn>
    <v-btn class="ms-3" prepend-icon="mdi-check" variant="outlined" color="green" type="submit">
      Filter
    </v-btn>
  </div>
  </v-form>
</template>