<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
</script>

<template>
  <v-card>
    <v-layout>
      <v-navigation-drawer
        class="bg-deep-purple"
        theme="dark"
        permanent
      >
        <v-list color="transparent">
          <RouterLink to="/">
            <v-list-item prepend-icon="mdi-view-dashboard" title="Dashboard"></v-list-item>
          </RouterLink>
          <RouterLink to="/building">
            <v-list-item prepend-icon="mdi-account-box" title="Buildings"></v-list-item>
          </RouterLink>
        </v-list>

        <template v-slot:append>
          <div class="pa-2">
            <v-btn block>
              Logout
            </v-btn>
          </div>
        </template>
      </v-navigation-drawer>
      <v-main style="height: 100vh">
        <div style="padding: 12px 20px">
          <RouterView />
        </div>
      </v-main>
    </v-layout>
  </v-card>
</template>

<style scoped>
a {
  text-decoration: none;
}

a.router-link-active .v-list-item {
  background-color: #3b216a;
  color: white;
}

a.router-link-active :deep(.v-list-item-title) {
  font-weight: bold;
}
</style>