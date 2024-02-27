import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '../views/DashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/building',
      name: 'building',
      // route level code-splitting
      // this generates a separate chunk (House.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/BuildingView.vue')
    },
    {
      path: '/calculator-results/:month/:year',
      name: 'calculatorResults',
      component: () => import('../views/CalculatorResultsView.vue')
    }
  ]
})

export default router;
