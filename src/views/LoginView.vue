<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth   = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const status   = ref('idle') // idle | loading | error | success
const errorMsg = ref('')
const showPass = ref(false)

async function handleLogin() {
  if (!username.value.trim() || !password.value) {
    errorMsg.value = 'Username dan password wajib diisi.'
    status.value = 'error'
    return
  }
  status.value = 'loading'
  errorMsg.value = ''
  try {
    await auth.login(username.value.trim(), password.value)
    status.value = 'success'
    setTimeout(() => router.push({ name: 'dashboard' }), 700)
  } catch (e) {
    status.value = 'error'
    errorMsg.value = e.message || 'Gagal login.'
  }
}

function handleKey(e) { if (e.key === 'Enter') handleLogin() }

// Jam
import { onMounted, onUnmounted } from 'vue'
const now = ref(new Date())
let t = null
onMounted(() => { t = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(t))
function fmtTime(d) { return d.toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', second:'2-digit' }) }
function fmtDate(d)  { return d.toLocaleDateString('id-ID',  { day:'2-digit', month:'short', year:'numeric' }) }
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[#0d0d11] text-white overflow-hidden">

    <!-- TOP BAR -->
    <div class="flex items-center justify-between px-5 py-3 border-b-2 border-zinc-800 bg-[#121216] shrink-0">
      <div class="flex items-center gap-3">
        <span class="w-2.5 h-2.5 rounded-full bg-amber-500 blink-slow"></span>
        <div>
          <div class="font-display font-bold text-base leading-tight tracking-wide">SISTEM PEMANTAU</div>
          <div class="text-[10px] text-zinc-400 tracking-widest uppercase">Akses Terbatas · Autentikasi Diperlukan</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm font-semibold tabular-nums font-mono">{{ fmtTime(now) }}</div>
        <div class="text-[10px] text-zinc-400">{{ fmtDate(now) }}</div>
      </div>
    </div>

    <!-- CENTER -->
    <div class="flex-1 flex items-center justify-center px-4 overflow-auto">
      <div class="relative w-full max-w-sm my-8">

        <!-- Corner brackets -->
        <div class="corner-lg border-t-2 border-l-2 top-0 left-0"></div>
        <div class="corner-lg border-t-2 border-r-2 top-0 right-0"></div>
        <div class="corner-lg border-b-2 border-l-2 bottom-0 left-0"></div>
        <div class="corner-lg border-b-2 border-r-2 bottom-0 right-0"></div>

        <div class="bg-[#111116] border border-zinc-800 rounded-sm px-8 pt-8 pb-9 mx-3 my-3">

          <!-- Header -->
          <div class="mb-7 text-center">
            <div class="mx-auto mb-4 w-12 h-12 flex items-center justify-center rounded-sm border border-zinc-700 bg-[#0d0d11]">
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"/>
              </svg>
            </div>
            <div class="font-display font-bold text-lg tracking-wider">MASUK KE SISTEM</div>
            <div class="text-[11px] text-zinc-500 mt-1 tracking-widest uppercase">CCTV Monitoring</div>
          </div>

          <!-- SUCCESS -->
          <div v-if="status === 'success'" class="text-center py-4">
            <div class="w-10 h-10 rounded-full border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/>
              </svg>
            </div>
            <div class="text-green-500 font-bold tracking-widest text-sm mb-1">AKSES DIBERIKAN</div>
            <p class="text-zinc-400 text-xs">Selamat datang, <span class="text-white">{{ username }}</span>. Mengalihkan…</p>
          </div>

          <!-- FORM -->
          <div v-else class="space-y-4">
            <!-- Username -->
            <div>
              <label class="block text-[10px] text-zinc-400 tracking-widest uppercase mb-1.5">Username</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
                  </svg>
                </span>
                <input v-model="username" @keydown="handleKey" type="text" autocomplete="username"
                  placeholder="masukkan username" :disabled="status === 'loading'"
                  class="w-full bg-[#0d0d11] border border-zinc-700 rounded-sm pl-9 pr-4 py-2.5
                         text-sm text-zinc-100 placeholder-zinc-600 font-mono tracking-wide
                         focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30
                         disabled:opacity-40 transition-colors" />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label class="block text-[10px] text-zinc-400 tracking-widest uppercase mb-1.5">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
                  </svg>
                </span>
                <input v-model="password" @keydown="handleKey" :type="showPass ? 'text' : 'password'"
                  autocomplete="current-password" placeholder="masukkan password"
                  :disabled="status === 'loading'"
                  class="w-full bg-[#0d0d11] border border-zinc-700 rounded-sm pl-9 pr-10 py-2.5
                         text-sm text-zinc-100 placeholder-zinc-600 font-mono tracking-widest
                         focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500/30
                         disabled:opacity-40 transition-colors" />
                <button type="button" @click="showPass = !showPass" tabindex="-1"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                  <svg v-if="!showPass" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error -->
            <div v-if="status === 'error'"
              class="flex items-start gap-2 bg-red-950/40 border border-red-800/50 rounded-sm px-3 py-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="1.5" class="w-3.5 h-3.5 shrink-0 mt-0.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
              </svg>
              <p class="text-red-400 text-[11px] leading-relaxed">{{ errorMsg }}</p>
            </div>

            <!-- Submit -->
            <button @click="handleLogin" :disabled="status === 'loading'"
              class="w-full mt-2 flex items-center justify-center gap-2
                     bg-green-500 hover:bg-green-400 disabled:bg-green-900/50
                     text-black disabled:text-zinc-500 font-bold text-xs tracking-widest uppercase
                     py-3 rounded-sm transition-colors">
              <template v-if="status === 'loading'">
                <svg class="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                MEMVERIFIKASI…
              </template>
              <template v-else>MASUK</template>
            </button>
          </div>

        </div>
      </div>
    </div>

    <!-- BOTTOM BAR -->
    <div class="flex items-center justify-between px-5 py-2 border-t-2 border-zinc-800 bg-[#121216]
                text-[10px] text-zinc-600 tracking-wide shrink-0">
      <span class="font-mono">WHEP://172.16.10.200:8889</span>
      <span class="uppercase font-bold"
        :class="status === 'success' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-amber-500'">
        {{ status === 'success' ? 'TERAUTENTIKASI' : status === 'loading' ? 'MEMPROSES' : status === 'error' ? 'DITOLAK' : 'BELUM MASUK' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.corner-lg {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: #22c55e;
  opacity: 0.5;
}
</style>
