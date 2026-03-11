import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const loading = ref(true);

  const isSuperAdmin = computed(() => user.value?.role === 'super_admin');
  const isAdmin = computed(
    () => user.value?.role === 'admin' || user.value?.role === 'super_admin'
  );

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        user.value = data.user;
      } else {
        user.value = null;
      }
    } catch {
      user.value = null;
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    user.value = data.user;
  }

  async function logout() {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    user.value = null;
  }

  return { user, loading, isSuperAdmin, isAdmin, fetchUser, login, logout };
});
