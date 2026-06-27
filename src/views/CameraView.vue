<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppTopBar from '@/components/AppTopBar.vue'
import { CAMERAS, getWhepUrl } from '@/cameras.js'
import { useAuthStore } from '@/stores/auth'

const route  = useRoute()
const router = useRouter()
const auth   = useAuthStore()

// Ambil kamera berdasarkan :id dari route
const cam = computed(() => CAMERAS.find(c => c.id === route.params.id))

// Fallback jika ID tidak ditemukan ATAU tidak punya akses
onMounted(() => {
  if (!cam.value) { router.push({ name: 'dashboard' }); return }
  // Cek akses: admin boleh semua, divisi hanya yang diizinkan
  if (!auth.isAdmin) {
    const allowed = auth.user?.allowedCameras ?? []
    if (!allowed.includes(cam.value.id)) {
      router.push({ name: 'dashboard' })
    }
  }
})

// ====== WebRTC WHEP ======
const videoEl = ref(null)
const status = ref('idle')
const errorMessage = ref('')
const retryCount = ref(0)
let pc = null
let retryTimer = null

function waitIce(peer) {
  return new Promise(resolve => {
    if (peer.iceGatheringState === 'complete') { resolve(); return }
    const fn = () => {
      if (peer.iceGatheringState === 'complete') {
        peer.removeEventListener('icegatheringstatechange', fn)
        resolve()
      }
    }
    peer.addEventListener('icegatheringstatechange', fn)
    setTimeout(resolve, 3000)
  })
}

async function connectCamera() {
  if (!cam.value) return
  status.value = 'connecting'
  errorMessage.value = ''
  disconnectCamera(false)

  try {
    pc = new RTCPeerConnection({ iceServers: [] })
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    pc.ontrack = evt => { if (videoEl.value) videoEl.value.srcObject = evt.streams[0] }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        status.value = 'connected'
        retryCount.value = 0
      } else if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
        if (status.value !== 'idle') scheduleRetry('Koneksi WebRTC terputus dari kamera.')
      }
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await waitIce(pc)

    const headers = { 'Content-Type': 'application/sdp' }
    if (cam.value.user || cam.value.pass) {
      headers['Authorization'] = 'Basic ' + btoa(`${cam.value.user}:${cam.value.pass}`)
    }

    const res = await fetch(getWhepUrl(cam.value), {
      method: 'POST', headers, body: pc.localDescription.sdp
    })
    if (!res.ok) throw new Error('Server kamera merespon status ' + res.status)

    const sdp = await res.text()
    await pc.setRemoteDescription({ type: 'answer', sdp })

  } catch (err) {
    scheduleRetry((err && err.message) ? err.message : 'Gagal terhubung ke kamera.')
  }
}

function scheduleRetry(msg) {
  status.value = 'error'
  errorMessage.value = msg
  retryCount.value++
  retryTimer = setTimeout(connectCamera, Math.min(3000 * retryCount.value, 15000))
}

function disconnectCamera(resetStatus = true) {
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  if (pc) { try { pc.close() } catch {} pc = null }
  if (videoEl.value) videoEl.value.srcObject = null
  if (resetStatus) status.value = 'idle'
}

function retry() { retryCount.value = 0; connectCamera() }

onMounted(connectCamera)
onUnmounted(disconnectCamera)

const statusDot = computed(() => {
  if (status.value === 'connected') return 'green'
  if (status.value === 'error')     return 'red'
  return 'amber'
})
</script>

<template>
  <div class="h-screen w-screen flex flex-col bg-black" v-if="cam">

    <!-- TOP BAR -->
    <AppTopBar
      :title="`${cam.label} — ${cam.sublabel}`"
      :subtitle="cam.baseUrl"
      :status-dot="statusDot"
    >
      <!-- Tombol kembali ke dashboard -->
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

    <!-- VIDEO AREA -->
    <div class="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
      <video ref="videoEl" autoplay playsinline muted class="w-full h-full object-contain"></video>

      <!-- Corner brackets viewfinder -->
      <div class="corner border-t-4 border-l-4 top-4 left-4"></div>
      <div class="corner border-t-4 border-r-4 top-4 right-4"></div>
      <div class="corner border-b-4 border-l-4 bottom-4 left-4"></div>
      <div class="corner border-b-4 border-r-4 bottom-4 right-4"></div>

      <!-- LIVE badge -->
      <div v-if="status === 'connected'"
        class="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2
               bg-black/60 px-3 py-1 rounded-sm border border-green-500">
        <span class="w-2 h-2 rounded-full bg-red-500 rec-dot"></span>
        <span class="text-[11px] font-bold tracking-widest">LIVE</span>
      </div>

      <!-- Overlay states -->
      <div v-if="status !== 'connected'"
        class="absolute inset-0 flex items-center justify-center bg-black/75">
        <div class="text-center px-6 max-w-md">
          <template v-if="status === 'connecting'">
            <div class="text-amber-500 text-sm font-bold tracking-widest mb-2 blink-slow">MENYAMBUNGKAN…</div>
            <p class="text-zinc-400 text-xs">Membangun koneksi WebRTC (WHEP) ke kamera.</p>
          </template>
          <template v-else-if="status === 'error'">
            <div class="text-red-500 text-sm font-bold tracking-widest mb-2">GAGAL TERHUBUNG</div>
            <p class="text-zinc-400 text-xs mb-1">{{ errorMessage }}</p>
            <p v-if="retryCount > 0" class="text-zinc-600 text-[10px] mb-1">
              Percobaan ulang ke-{{ retryCount }}, otomatis…
            </p>
            <p class="text-zinc-400 text-[11px] mb-4 leading-relaxed">
              Pastikan perangkat berada di jaringan LAN yang sama dengan
              <span class="text-zinc-50">{{ cam.baseUrl }}</span>
            </p>
            <button @click="retry"
              class="bg-green-500 text-black font-bold text-xs px-4 py-2 rounded-sm hover:opacity-90 transition-opacity">
              COBA LAGI
            </button>
          </template>
          <template v-else>
            <div class="text-zinc-400 text-sm font-bold tracking-widest">MENUNGGU STREAM…</div>
          </template>
        </div>
      </div>
    </div>

    <!-- BOTTOM BAR -->
    <div class="flex items-center justify-between px-5 py-2 border-t-2 border-zinc-800
                bg-[#121216] text-[10px] text-zinc-400 tracking-wide shrink-0">
      <span class="font-mono">WHEP: {{ getWhepUrl(cam) }}</span>
      <span class="uppercase font-bold"
        :class="status === 'connected' ? 'text-green-500' : status === 'error' ? 'text-red-500' : 'text-amber-500'">
        {{ status === 'connected' ? 'TERHUBUNG' : status === 'error' ? 'ERROR' : status === 'connecting' ? 'MENYAMBUNGKAN' : 'IDLE' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.corner {
  position: absolute;
  width: 28px;
  height: 28px;
  border-color: #22c55e;
}
</style>
