<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  title: { type: String, default: 'SISTEM PEMANTAU' },
  subtitle: { type: String, default: '' },
  statusDot: { type: String, default: 'amber' }, // green | amber | red
})

const auth = useAuthStore()
const router = useRouter()

const now = ref(new Date())
let t = null
onMounted(() => { t = setInterval(() => { now.value = new Date() }, 1000) })
onUnmounted(() => clearInterval(t))

function fmtTime(d) { return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }
function fmtDate(d) { return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) }

function logout() {
  auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex items-center justify-between px-5 py-3 border-b-2 border-zinc-800 bg-[#121216] shrink-0">
    <!-- Kiri: status dot + judul -->
    <div class="flex items-center gap-3 min-w-0">
      <span class="w-2.5 h-2.5 rounded-full shrink-0"
        :class="{
          'bg-green-500 rec-dot': statusDot === 'green',
          'bg-red-500 blink-slow': statusDot === 'red',
          'bg-amber-500 blink-slow': statusDot === 'amber',
        }">
      </span>
      <div class="min-w-0">
        <div class="font-display font-bold text-base leading-tight truncate">{{ title }}</div>
        <div v-if="subtitle" class="text-[10px] text-zinc-400 tracking-wide truncate">{{ subtitle }}</div>
      </div>
    </div>

    <!-- Tengah: slot untuk konten tambahan (misal tombol back) -->
    <div class="flex-1 flex justify-center px-4">
      <slot />
    </div>

    <!-- Kanan: jam + user + logout -->
    <div class="flex items-center gap-4 shrink-0">
      <div class="text-right hidden sm:block">
        <div class="text-sm font-semibold tabular-nums font-mono">{{ fmtTime(now) }}</div>
        <div class="text-[10px] text-zinc-400">{{ fmtDate(now) }}</div>
      </div>

      <div v-if="auth.isLoggedIn" class="flex items-center gap-2 border-l border-zinc-700 pl-4">
        <div class="text-right hidden sm:block">
          <div class="text-[11px] font-bold text-zinc-300">{{ auth.user.label }}</div>
          <div class="text-[10px] text-zinc-500 uppercase tracking-wider">{{ auth.user.role }}</div>
        </div>
        <button @click="logout"
          class="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-red-400
                 border border-zinc-700 hover:border-red-500/50 rounded-sm px-2 py-1.5
                 transition-colors tracking-wider uppercase font-bold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"/>
          </svg>
          <span class="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </div>
  </div>
</template>
