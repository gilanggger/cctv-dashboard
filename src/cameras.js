// ============================================================
// KONFIGURASI SEMUA KAMERA
// Tambah / hapus kamera di sini tanpa ubah kode lain.
// ============================================================

export const CAMERAS = [
  {
    id: 'cam-gawanga-tebu',
    label: 'Cam-server',
    sublabel: 'Tebu',
    baseUrl: 'http://172.16.10.200:8889/cam-server/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-gawangb-tebu',
    label: 'Cam-edp',
    sublabel: 'Tebu',
    baseUrl: 'http://172.16.10.200:8889/cam-edp/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-stasiun-gilingan',
    label: 'cam-mejatebu-14',
    sublabel: 'Gilingan',
    baseUrl: 'http://172.16.10.200:8889/cam-mejatebu-14/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-stasiun-pemurnian',
    label: 'cam-mejatebu-3',
    sublabel: 'Pemurnian',
    baseUrl: 'http://172.16.10.200:8889/cam-mejatebu-3/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-stasiun-penguapan',
    label: 'cam-mejatebu-2',
    sublabel: 'Penguapan',
    baseUrl: 'http://172.16.10.200:8889/cam-mejatebu-2/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-stasiun-masakan',
    label: 'cam-gawangb-nopol',
    sublabel: 'Masakan',
    baseUrl: 'http://172.16.10.200:8889/cam-gawangb-nopol/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-gudang-gula',
    label: 'cam-gawangb-tebu',
    sublabel: 'Gula',
    baseUrl: 'http://172.16.10.200:8889/cam-gawangb-tebu/',
    user: 'admin',
    pass: '123456',
  },
  {
    id: 'cam-area-parkir',
    label: 'Area',
    sublabel: 'Parkir',
    baseUrl: 'http://172.16.10.200:8889/cam-area-parkir/',
    user: 'admin',
    pass: '123456',
  },
]

export function getWhepUrl(cam) {
  return cam.baseUrl.replace(/\/?$/, '/') + 'whep'
}
