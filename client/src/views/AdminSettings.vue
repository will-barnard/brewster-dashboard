<template>
  <div class="admin-page">
    <h1>Admin Settings</h1>
    <p class="section-subtitle">Manage users and app configuration.</p>

    <!-- Create User -->
    <section class="card create-user-section">
      <h2>Create User</h2>
      <form @submit.prevent="handleCreateUser">
        <div v-if="createError" class="error-msg">{{ createError }}</div>
        <div v-if="createSuccess" class="success-msg">{{ createSuccess }}</div>

        <div class="form-row">
          <div class="form-group">
            <label for="newName">Name</label>
            <input id="newName" v-model="newUser.name" type="text" required />
          </div>
          <div class="form-group">
            <label for="newEmail">Email</label>
            <input id="newEmail" v-model="newUser.email" type="email" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="newPass">Password</label>
            <input id="newPass" v-model="newUser.password" type="password" required />
          </div>
          <div class="form-group">
            <label for="newRole">Role</label>
            <select id="newRole" v-model="newUser.role">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <button class="btn btn-primary" :disabled="creating">
          {{ creating ? 'Creating…' : 'Create User' }}
        </button>
      </form>
    </section>

    <!-- Users List -->
    <section class="card users-section">
      <h2>Users</h2>
      <div v-if="loadingUsers" class="loading">Loading users…</div>
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u.id">
            <td>{{ u.name }}</td>
            <td>{{ u.email }}</td>
            <td class="role-badge">{{ u.role }}</td>
            <td>{{ formatDate(u.created_at) }}</td>
            <td>
              <button
                v-if="u.role !== 'super_admin'"
                class="btn btn-danger btn-sm"
                @click="handleDelete(u)"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';

const users = ref([]);
const loadingUsers = ref(true);

const newUser = reactive({ name: '', email: '', password: '', role: 'user' });
const creating = ref(false);
const createError = ref('');
const createSuccess = ref('');

async function fetchUsers() {
  loadingUsers.value = true;
  const res = await fetch('/api/admin/users', { credentials: 'include' });
  const data = await res.json();
  users.value = data.users;
  loadingUsers.value = false;
}

async function handleCreateUser() {
  createError.value = '';
  createSuccess.value = '';
  creating.value = true;

  try {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ ...newUser }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create user');

    createSuccess.value = `User "${data.user.name}" created.`;
    newUser.name = '';
    newUser.email = '';
    newUser.password = '';
    newUser.role = 'user';
    await fetchUsers();
  } catch (e) {
    createError.value = e.message;
  } finally {
    creating.value = false;
  }
}

async function handleDelete(user) {
  if (!confirm(`Delete user "${user.name}"?`)) return;
  await fetch(`/api/admin/users/${user.id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  await fetchUsers();
}

function formatDate(iso) {
  return new Date(iso + 'Z').toLocaleDateString();
}

onMounted(fetchUsers);
</script>

<style scoped>
.admin-page h1 {
  font-size: 1.75rem;
  margin-bottom: 0.25rem;
}

.section-subtitle {
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.create-user-section {
  margin-bottom: 1.5rem;
}

.create-user-section h2,
.users-section h2 {
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th,
.users-table td {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
}

.users-table th {
  color: var(--color-text-muted);
  font-weight: 500;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.role-badge {
  text-transform: capitalize;
}

.btn-sm {
  padding: 0.3rem 0.6rem;
  font-size: 0.8rem;
}

.loading {
  color: var(--color-text-muted);
}
</style>
