import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ======================================================
// KONFIGURASI USERS & AKSES KAMERA PER DIVISI
// Di produksi: ganti dengan API call ke backend.
// ======================================================

// Data users & divisi disimpan di localStorage agar bisa diubah admin
function loadUsers() {
  const saved = localStorage.getItem('cctv_users')
  if (saved) return JSON.parse(saved)
  // Default users
  const defaults = [
    {
      id: 1,
      username: 'admin',
      password: '123456',
      label: 'Administrator',
      role: 'admin',
      allowedCameras: [], // admin = akses semua, array ini diabaikan
    },
    {
      id: 2,
      username: 'div1',
      password: '221',
      label: 'Divisi 1',
      role: 'divisi',
      allowedCameras: ['cam-gawanga-tebu', 'cam-gawangb-tebu'],
    },
    {
      id: 3,
      username: 'div2',
      password: '221',
      label: 'Divisi 2',
      role: 'divisi',
      allowedCameras: ['cam-stasiun-gilingan', 'cam-stasiun-pemurnian'],
    },
  ]
  localStorage.setItem('cctv_users', JSON.stringify(defaults))
  return defaults
}

export function saveUsers(users) {
  localStorage.setItem('cctv_users', JSON.stringify(users))
}

export function getUsers() {
  return loadUsers()
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('cctv_user') || 'null'))

  const isLoggedIn = computed(() => !!user.value)
  const isAdmin    = computed(() => user.value?.role === 'admin')

  async function login(username, password) {
    await new Promise(r => setTimeout(r, 900))

    const users = loadUsers()
    const found = users.find(u => u.username === username && u.password === password)
    if (!found) throw new Error('Username atau password salah.')

    // Jangan simpan password ke session
    const { password: _pw, ...safeUser } = found
    user.value = safeUser
    sessionStorage.setItem('cctv_user', JSON.stringify(safeUser))
    return safeUser
  }

  function logout() {
    user.value = null
    sessionStorage.removeItem('cctv_user')
  }

  return { user, isLoggedIn, isAdmin, login, logout }
})
