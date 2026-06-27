<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getWhepUrl } from '@/cameras.js'

const props = defineProps({
  cam: { type: Object, required: true },
})

const router = useRouter()
const videoEl = ref(null)
const status = ref('idle') // idle | connecting | connected | error
let pc = null
let retryTimer = null
let retryCount = 0

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

async function connect() {
  status.value = 'connecting'
  disconnect(false)

  try {
    pc = new RTCPeerConnection({ iceServers: [] })
    pc.addTransceiver('video', { direction: 'recvonly' })
    pc.addTransceiver('audio', { direction: 'recvonly' })

    pc.ontrack = evt => {
      if (videoEl.value) videoEl.value.srcObject = evt.streams[0]
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        status.value = 'connected'
        retryCount = 0
      } else if (['failed', 'disconnected', 'closed'].includes(pc.connectionState)) {
        if (status.value !== 'idle') scheduleRetry()
      }
    }

    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    await waitIce(pc)

    const headers = { 'Content-Type': 'application/sdp' }
    if (props.cam.user || props.cam.pass) {
      headers['Authorization'] = 'Basic ' + btoa(`${props.cam.user}:${props.cam.pass}`)
    }

    const res = await fetch(getWhepUrl(props.cam), {
      method: 'POST', headers, body: pc.localDescription.sdp
    })
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const sdp = await res.text()
    await pc.setRemoteDescription({ type: 'answer', sdp })

  } catch {
    scheduleRetry()
  }
}

function scheduleRetry() {
  status.value = 'error'
  retryCount++
  const delay = Math.min(3000 * retryCount, 15000)
  retryTimer = setTimeout(connect, delay)
}

function disconnect(resetStatus = true) {
  if (retryTimer) { clearTimeout(retryTimer); retryTimer = null }
  if (pc) { try { pc.close() } catch {} pc = null }
  if (videoEl.value) videoEl.value.srcObject = null
  if (resetStatus) status.value = 'idle'
}

function openFullscreen() {
  router.push({ name: 'camera', params: { id: props.cam.id } })
}

onMounted(connect)
onUnmounted(disconnect)
</script>

<template>
  <div
    @click="openFullscreen"
    class="group relative bg-black rounded-sm overflow-hidden border border-zinc-800
           hover:border-green-500/60 transition-colors cursor-pointer aspect-video"
  >
    <!-- Video stream -->
    <video ref="videoEl" autoplay playsinline muted class="w-full h-full object-cover"></video>

    <!-- Status overlay when not connected -->
    <div v-if="status !== 'connected'"
      class="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 gap-1">
      <template v-if="status === 'connecting'">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500 blink-slow mb-1"></span>
        <span class="text-[9px] text-amber-500 font-bold tracking-widest">MENYAMBUNGKAN</span>
      </template>
      <template v-else-if="status === 'error'">
        <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="1.5" class="w-4 h-4 mb-1">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z"/>
        </svg>
        <span class="text-[9px] text-red-500 font-bold tracking-widest">NO SIGNAL</span>
      </template>
      <template v-else>
        <span class="text-[9px] text-zinc-600 tracking-widest">IDLE</span>
      </template>
    </div>

    <!-- LIVE badge -->
    <div v-if="status === 'connected'"
      class="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5
             rounded-sm border border-green-500/50">
      <span class="w-1.5 h-1.5 rounded-full bg-red-500 rec-dot"></span>
      <span class="text-[8px] font-bold tracking-widest text-green-400">LIVE</span>
    </div>

    <!-- Fullscreen hint on hover -->
    <div class="absolute inset-0 flex items-center justify-center
                opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      <div class="bg-black/60 border border-green-500/40 rounded-sm px-3 py-1.5">
        <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="1.5" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
        </svg>
      </div>
    </div>

    <!-- Camera label bar at bottom -->
    <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent
                px-2 pt-4 pb-1.5">
      <div class="text-[10px] font-bold text-white tracking-wider leading-tight">
        {{ cam.label }}
      </div>
      <div class="text-[9px] text-zinc-400 tracking-widest uppercase">{{ cam.sublabel }}</div>
    </div>
  </div>
</template>
