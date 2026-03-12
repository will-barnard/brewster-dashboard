<template>
  <nav class="nav-bar">
    <div class="nav-inner">
      <router-link to="/" class="nav-brand">
        Brewster Dashboard
      </router-link>
      <div class="nav-links">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/settings">Settings</router-link>
        <router-link v-if="auth.isSuperAdmin" to="/admin">Admin</router-link>
        <button class="btn btn-secondary btn-sm" @click="handleLogout">
          Log out
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.nav-bar {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 1rem;
}

.nav-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.nav-brand {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--color-primary);
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-links a {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

.nav-links a.router-link-exact-active {
  color: var(--color-primary);
}

.btn-sm {
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
}
</style>
