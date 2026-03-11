<template>
  <div class="settings-page">
    <h1>Settings</h1>
    <p class="section-subtitle">Update your profile information.</p>

    <form class="card settings-form" @submit.prevent="handleSave">
      <div v-if="error" class="error-msg">{{ error }}</div>
      <div v-if="success" class="success-msg">{{ success }}</div>

      <div class="form-group">
        <label for="name">Name</label>
        <input id="name" v-model="form.name" type="text" />
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input id="email" :value="auth.user?.email" type="email" disabled />
      </div>

      <hr />

      <h3>Change Password</h3>

      <div class="form-group">
        <label for="currentPassword">Current Password</label>
        <input
          id="currentPassword"
          v-model="form.currentPassword"
          type="password"
          autocomplete="current-password"
        />
      </div>

      <div class="form-group">
        <label for="newPassword">New Password</label>
        <input
          id="newPassword"
          v-model="form.newPassword"
          type="password"
          autocomplete="new-password"
        />
      </div>

      <button class="btn btn-primary" :disabled="saving">
        {{ saving ? 'Saving…' : 'Save Changes' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useAuthStore } from '../stores/auth';

const auth = useAuthStore();

const form = reactive({
  name: auth.user?.name || '',
  currentPassword: '',
  newPassword: '',
});

const error = ref('');
const success = ref('');
const saving = ref(false);

async function handleSave() {
  error.value = '';
  success.value = '';
  saving.value = true;

  try {
    const body = {};
    if (form.name && form.name !== auth.user?.name) {
      body.name = form.name;
    }
    if (form.newPassword) {
      body.currentPassword = form.currentPassword;
      body.newPassword = form.newPassword;
    }

    if (Object.keys(body).length === 0) {
      error.value = 'No changes to save.';
      saving.value = false;
      return;
    }

    const res = await fetch('/api/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Update failed');

    auth.user.name = data.user.name;
    form.currentPassword = '';
    form.newPassword = '';
    success.value = 'Settings saved.';
  } catch (e) {
    error.value = e.message;
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.settings-page h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.section-subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.settings-form {
  max-width: 480px;
}

.settings-form hr {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.25rem 0;
}

.settings-form h3 {
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}
</style>
