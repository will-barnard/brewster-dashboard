<template>
  <div id="app-root">
    <AppNav v-if="auth.user" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import AppNav from './components/AppNav.vue';

const auth = useAuthStore();

onMounted(async () => {
  await auth.fetchUser();
});
</script>
