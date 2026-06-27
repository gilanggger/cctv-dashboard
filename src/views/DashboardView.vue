<script setup>
import { computed, ref } from 'vue'
import AppTopBar from '@/components/AppTopBar.vue'
import CameraCard from '@/components/CameraCard.vue'
import { CAMERAS } from '@/cameras.js'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth   = useAuthStore()
const router = useRouter()

// Filter kamera sesuai hak akses user
const allowedCams = computed(() => {
  if (auth.isAdmin) return CAMERAS
  const allowed = auth.user?.allowedCameras ?? []
  return CAMERAS.filter(c => allowed.includes(c.id))
})

// Grid layout — cols saja, tidak ada batas max (tampilkan semua kamera)
const layouts = [
  { id: '2x2', label: '2×2', cols: 2 },
  { id: '3x3', label: '3×3', cols: 3 },
  { id: '4x4', label: '4×4', cols: 4 },
  { id: '8x4', label: '8×4', cols: 8 },
]
const activeLayout  = ref('3x3')
const currentLayout = computed(() => layouts.find(l => l.id === activeLayout.value))

// Semua kamera yang boleh diakses ditampilkan
const visibleCams = computed(() => allowedCams.value)
const numCols     = computed(() => currentLayout.value.cols)
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-[#0a0a0e] overflow-hidden">

    <!-- TOP BAR -->
    <AppTopBar
      title="CCTV MONITORING"
      subtitle="172.16.10.200:8889"
      status-dot="amber"
    >
      <div class="flex items-center gap-2">
        <!-- Tombol Manajemen (admin only) -->
        <button v-if="auth.isAdmin"
          @click="router.push({ name: 'manage' })"
          class="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-amber-300
                 border border-zinc-700 hover:border-amber-500/50 rounded-sm px-3 py-1.5
                 transition-colors tracking-wider uppercase font-bold mr-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="w-3.5 h-3.5">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"/>
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          Kelola Akses
        </button>

        <!-- Grid switcher -->
        <span class="text-[10px] text-zinc-600 tracking-widest mr-1 hidden sm:inline">GRID</span>
        <button v-for="l in layouts" :key="l.id"
          @click="activeLayout = l.id"
          :class="[
            'text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-sm border transition-colors',
            activeLayout === l.id
              ? 'bg-green-500/10 border-green-500/60 text-green-400'
              : 'border-zinc-700 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300'
          ]">
          {{ l.label }}
        </button>
      </div>
    </AppTopBar>

    <!-- CAMERA COUNT BANNER -->
    <div class="flex items-center justify-between px-5 py-2 border-b border-zinc-800/60 bg-[#0d0d11] shrink-0">
      <div class="flex items-center gap-2">
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5" class="w-3.5 h-3.5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z"/>
        </svg>
        <span class="text-[10px] text-zinc-400 tracking-widest">
          MENAMPILKAN <span class="text-white font-bold">{{ visibleCams.length }}</span> DARI
          <span class="text-white font-bold">{{ allowedCams.length }}</span> KAMERA
          <span v-if="!auth.isAdmin" class="text-zinc-600 ml-1">(DIVISI: {{ auth.user?.label }})</span>
        </span>
      </div>
      <div class="text-[10px] text-zinc-600 tracking-widest uppercase hidden sm:block">
        Klik kamera untuk layar penuh
      </div>
    </div>

    <!-- Pesan jika tidak ada kamera -->
    <div v-if="allowedCams.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <div class="text-zinc-600 text-sm font-bold tracking-widest mb-2">TIDAK ADA KAMERA</div>
        <p class="text-zinc-700 text-xs">Divisi Anda belum memiliki akses ke kamera manapun.<br>Hubungi administrator.</p>
      </div>
    </div>

    <!-- CAMERA GRID — tinggi baris eksplisit agar kamera tidak terpotong -->
    <div v-else class="flex-1 overflow-y-auto p-3">
      <div :style="{
        display: 'grid',
        gridTemplateColumns: `repeat(${numCols}, 1fr)`,
        gridAutoRows: `${(56.25 / numCols).toFixed(2)}vw`,
        gap: '8px',
      }">
        <CameraCard
          v-for="cam in visibleCams"
          :key="cam.id"
          :cam="cam"
        />
      </div>
    </div>

    <!-- BOTTOM BAR -->
    <div class="flex items-center justify-between px-5 py-2 border-t-2 border-zinc-800
                bg-[#121216] text-[10px] text-zinc-500 tracking-wide shrink-0">
      <span class="font-mono">SISTEM PEMANTAU CCTV · {{ allowedCams.length }} KAMERA DAPAT DIAKSES</span>
      <span class="text-green-500 font-bold uppercase">LIVE</span>
    </div>

  </div>
</template>