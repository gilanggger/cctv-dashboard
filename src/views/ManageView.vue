<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppTopBar from '@/components/AppTopBar.vue'
import { CAMERAS } from '@/cameras.js'
import { useAuthStore } from '@/stores/auth'
import { getUsers, saveUsers } from '@/stores/auth'

const router = useRouter()
const auth   = useAuthStore()

// Redirect jika bukan admin
onMounted(() => {
  if (!auth.isAdmin) router.push({ name: 'dashboard' })
})

// State
const users      = ref([])
const activeTab  = ref('users')   // 'users' | 'add'
const editingId  = ref(null)
const toast      = ref('')
const toastType  = ref('ok')      // 'ok' | 'err'

// Form tambah/edit user
const form = ref({ username: '', password: '', label: '', role: 'divisi', allowedCameras: [] })

onMounted(() => {
  users.value = getUsers()
})

function showToast(msg, type = 'ok') {
  toast.value = msg
  toastType.value = type
  setTimeout(() => { toast.value = '' }, 2800)
}

const nonAdminUsers = computed(() => users.value.filter(u => u.role !== 'admin'))

// Toggle kamera untuk form
function toggleCamera(camId) {
  const idx = form.value.allowedCameras.indexOf(camId)
  if (idx === -1) form.value.allowedCameras.push(camId)
  else            form.value.allowedCameras.splice(idx, 1)
}

function toggleAllCameras() {
  if (form.value.allowedCameras.length === CAMERAS.length) {
    form.value.allowedCameras = []
  } else {
    form.value.allowedCameras = CAMERAS.map(c => c.id)
  }
}

// Tambah user baru
function addUser() {
  if (!form.value.username.trim() || !form.value.password.trim() || !form.value.label.trim()) {
    showToast('Isi semua field yang wajib!', 'err'); return
  }
  const exists = users.value.find(u => u.username === form.value.username.trim())
  if (exists) { showToast('Username sudah dipakai!', 'err'); return }

  const newUser = {
    id: Date.now(),
    username: form.value.username.trim(),
    password: form.value.password.trim(),
    label:    form.value.label.trim(),
    role:     'divisi',
    allowedCameras: [...form.value.allowedCameras],
  }
  users.value.push(newUser)
  saveUsers(users.value)
  resetForm()
  activeTab.value = 'users'
  showToast(`User "${newUser.label}" berhasil ditambahkan.`)
}

// Mulai edit
function startEdit(u) {
  editingId.value = u.id
  form.value = {
    username: u.username,
    password: u.password,
    label:    u.label,
    role:     u.role,
    allowedCameras: [...(u.allowedCameras || [])],
  }
  activeTab.value = 'add'
}

// Simpan edit
function saveEdit() {
  if (!form.value.username.trim() || !form.value.password.trim() || !form.value.label.trim()) {
    showToast('Isi semua field yang wajib!', 'err'); return
  }
  const dupCheck = users.value.find(u => u.username === form.value.username.trim() && u.id !== editingId.value)
  if (dupCheck) { showToast('Username sudah dipakai!', 'err'); return }

  const idx = users.value.findIndex(u => u.id === editingId.value)
  if (idx !== -1) {
    users.value[idx] = {
      ...users.value[idx],
      username: form.value.username.trim(),
      password: form.value.password.trim(),
      label:    form.value.label.trim(),
      allowedCameras: [...form.value.allowedCameras],
    }
    saveUsers(users.value)
    showToast('Perubahan berhasil disimpan.')
  }
  cancelEdit()
}

function cancelEdit() {
  editingId.value = null
  resetForm()
  activeTab.value = 'users'
}

function resetForm() {
  form.value = { username: '', password: '', label: '', role: 'divisi', allowedCameras: [] }
}

// Hapus user
function deleteUser(u) {
  if (!confirm(`Hapus user "${u.label}" (${u.username})?`)) return
  users.value = users.value.filter(x => x.id !== u.id)
  saveUsers(users.value)
  showToast(`User "${u.label}" dihapus.`)
}

// Toggle kamera langsung di tabel (quick edit)
function toggleCameraForUser(userId, camId) {
  const u = users.value.find(x => x.id === userId)
  if (!u) return
  const idx = u.allowedCameras.indexOf(camId)
  if (idx === -1) u.allowedCameras.push(camId)
  else            u.allowedCameras.splice(idx, 1)
  saveUsers(users.value)
  showToast('Akses kamera diperbarui.')
}

function hasCam(u, camId) {
  return (u.allowedCameras || []).includes(camId)
}

function camLabel(camId) {
  const c = CAMERAS.find(x => x.id === camId)
  return c ? `${c.label} ${c.sublabel}` : camId
}
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[#0a0a0e] overflow-hidden">

    <!-- TOP BAR -->
    <AppTopBar title="KELOLA AKSES DIVISI" subtitle="Panel Administrasi" status-dot="amber">
      <button @click="router.push({ name: 'dashboard' })"
        class="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-white
               border border-zinc-700 hover:border-zinc-500 rounded-sm px-3 py-1.5
               transition-colors tracking-wider uppercase font-bold">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-3.5 h-3.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/>
        </svg>
        Dashboard
      </button>
    </AppTopBar>

    <!-- TAB BAR -->
    <div class="flex items-center gap-0 px-5 pt-4 pb-0 border-b border-zinc-800 bg-[#0d0d11] shrink-0">
      <button @click="activeTab = 'users'; editingId = null; resetForm()"
        :class="['text-[11px] font-bold tracking-widest px-5 py-2.5 border-b-2 transition-colors uppercase',
                  activeTab === 'users'
                    ? 'border-green-500 text-green-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300']">
        Daftar Divisi
      </button>
      <button @click="activeTab = 'add'; if(editingId) {} else resetForm()"
        :class="['text-[11px] font-bold tracking-widest px-5 py-2.5 border-b-2 transition-colors uppercase',
                  activeTab === 'add'
                    ? 'border-amber-500 text-amber-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300']">
        {{ editingId ? '✏ Edit Divisi' : '+ Tambah Divisi' }}
      </button>
    </div>

    <!-- TOAST -->
    <transition name="fade">
      <div v-if="toast"
        :class="['fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-sm text-xs font-bold tracking-wider border shadow-lg',
                  toastType === 'ok'
                    ? 'bg-green-900/80 border-green-500 text-green-300'
                    : 'bg-red-900/80 border-red-500 text-red-300']">
        {{ toast }}
      </div>
    </transition>

    <!-- CONTENT -->
    <div class="flex-1 overflow-auto p-5">

      <!-- ========== TAB: DAFTAR USER ========== -->
      <div v-if="activeTab === 'users'">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">
            Divisi Terdaftar ({{ nonAdminUsers.length }})
          </h2>
          <button @click="activeTab = 'add'; resetForm(); editingId = null"
            class="text-[10px] font-bold tracking-wider px-3 py-1.5 rounded-sm border
                   border-amber-500/50 text-amber-400 hover:bg-amber-500/10 transition-colors uppercase">
            + Tambah Divisi
          </button>
        </div>

        <!-- Tidak ada user -->
        <div v-if="nonAdminUsers.length === 0"
          class="border border-zinc-800 rounded-sm p-10 text-center">
          <p class="text-zinc-600 text-xs tracking-widest">Belum ada divisi. Klik "Tambah Divisi".</p>
        </div>

        <!-- Tabel user -->
        <div v-else class="space-y-4">
          <div v-for="u in nonAdminUsers" :key="u.id"
            class="border border-zinc-800 rounded-sm bg-[#0d0d11] overflow-hidden">

            <!-- Header user card -->
            <div class="flex items-center justify-between px-4 py-3 bg-zinc-900/50 border-b border-zinc-800">
              <div class="flex items-center gap-3">
                <div class="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/30
                            flex items-center justify-center text-green-400 font-bold text-xs">
                  {{ u.label.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <div class="text-sm font-bold text-white">{{ u.label }}</div>
                  <div class="text-[10px] text-zinc-500 font-mono">@{{ u.username }} · ****</div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button @click="startEdit(u)"
                  class="text-[10px] font-bold tracking-wider px-3 py-1 rounded-sm border
                         border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors uppercase">
                  Edit
                </button>
                <button @click="deleteUser(u)"
                  class="text-[10px] font-bold tracking-wider px-3 py-1 rounded-sm border
                         border-red-900/50 text-red-500/70 hover:text-red-400 hover:border-red-500/50 transition-colors uppercase">
                  Hapus
                </button>
              </div>
            </div>

            <!-- Grid akses kamera -->
            <div class="p-4">
              <div class="text-[10px] text-zinc-600 tracking-widest uppercase mb-3 font-bold">
                Akses Kamera — klik untuk toggle
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="cam in CAMERAS" :key="cam.id"
                  @click="toggleCameraForUser(u.id, cam.id)"
                  :class="['text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-sm border transition-all',
                            hasCam(u, cam.id)
                              ? 'bg-green-500/15 border-green-500/60 text-green-400'
                              : 'border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400']">
                  <span v-if="hasCam(u, cam.id)" class="mr-1">✓</span>{{ cam.label }} {{ cam.sublabel }}
                </button>
              </div>
              <div class="text-[10px] text-zinc-700 mt-2">
                {{ (u.allowedCameras || []).length }} dari {{ CAMERAS.length }} kamera dapat diakses
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== TAB: TAMBAH / EDIT USER ========== -->
      <div v-if="activeTab === 'add'" class="max-w-xl">
        <h2 class="text-[11px] font-bold tracking-widest text-zinc-400 uppercase mb-5">
          {{ editingId ? 'Edit Divisi' : 'Tambah Divisi Baru' }}
        </h2>

        <div class="space-y-4 border border-zinc-800 rounded-sm p-5 bg-[#0d0d11]">

          <!-- Nama Divisi -->
          <div>
            <label class="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1.5">
              Nama Divisi <span class="text-red-500">*</span>
            </label>
            <input v-model="form.label" placeholder="contoh: Divisi Gilingan"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2
                     text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-green-500
                     transition-colors" />
          </div>

          <!-- Username -->
          <div>
            <label class="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1.5">
              Username <span class="text-red-500">*</span>
            </label>
            <input v-model="form.username" placeholder="contoh: div1"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2
                     text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-green-500
                     transition-colors" />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-1.5">
              Password <span class="text-red-500">*</span>
            </label>
            <input v-model="form.password" type="text" placeholder="contoh: 221"
              class="w-full bg-zinc-900 border border-zinc-700 rounded-sm px-3 py-2
                     text-sm text-white font-mono placeholder-zinc-600 focus:outline-none focus:border-green-500
                     transition-colors" />
          </div>

          <!-- Pilih Kamera -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                Akses Kamera
              </label>
              <button @click="toggleAllCameras"
                class="text-[10px] text-zinc-500 hover:text-zinc-300 underline transition-colors">
                {{ form.allowedCameras.length === CAMERAS.length ? 'Batalkan Semua' : 'Pilih Semua' }}
              </button>
            </div>
            <div class="flex flex-wrap gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-sm">
              <button
                v-for="cam in CAMERAS" :key="cam.id"
                @click="toggleCamera(cam.id)"
                :class="['text-[10px] font-bold tracking-wide px-3 py-1.5 rounded-sm border transition-all',
                          form.allowedCameras.includes(cam.id)
                            ? 'bg-green-500/15 border-green-500/60 text-green-400'
                            : 'border-zinc-700 text-zinc-600 hover:border-zinc-500 hover:text-zinc-400']">
                <span v-if="form.allowedCameras.includes(cam.id)" class="mr-1">✓</span>
                {{ cam.label }} {{ cam.sublabel }}
              </button>
            </div>
            <div class="text-[10px] text-zinc-700 mt-1.5">
              {{ form.allowedCameras.length }} kamera dipilih
            </div>
          </div>

          <!-- Tombol aksi -->
          <div class="flex items-center gap-3 pt-2">
            <button @click="editingId ? saveEdit() : addUser()"
              class="flex-1 bg-green-500 hover:bg-green-400 text-black font-bold text-xs
                     tracking-widest py-2.5 rounded-sm transition-colors uppercase">
              {{ editingId ? 'Simpan Perubahan' : 'Tambah Divisi' }}
            </button>
            <button @click="cancelEdit"
              class="px-5 py-2.5 border border-zinc-700 text-zinc-400 hover:text-white
                     text-xs font-bold tracking-widest rounded-sm transition-colors uppercase">
              Batal
            </button>
          </div>

        </div>
      </div>

    </div>

    <!-- BOTTOM BAR -->
    <div class="flex items-center justify-between px-5 py-2 border-t-2 border-zinc-800
                bg-[#121216] text-[10px] text-zinc-500 tracking-wide shrink-0">
      <span class="font-mono">ADMIN PANEL · {{ nonAdminUsers.length }} DIVISI TERDAFTAR</span>
      <span class="text-amber-500 font-bold uppercase">ADMIN</span>
    </div>

  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
