import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import UserSettings from '../views/UserSettings.vue';
import AdminSettings from '../views/AdminSettings.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
  { path: '/', name: 'Dashboard', component: Dashboard, meta: { auth: true } },
  {
    path: '/settings',
    name: 'UserSettings',
    component: UserSettings,
    meta: { auth: true },
  },
  {
    path: '/admin',
    name: 'AdminSettings',
    component: AdminSettings,
    meta: { auth: true, superAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // Wait for initial auth check
  if (auth.loading) {
    await auth.fetchUser();
  }

  if (to.meta.auth && !auth.user) {
    return { name: 'Login' };
  }

  if (to.meta.superAdmin && !auth.isSuperAdmin) {
    return { name: 'Dashboard' };
  }

  if (to.meta.guest && auth.user) {
    return { name: 'Dashboard' };
  }
});

export default router;
