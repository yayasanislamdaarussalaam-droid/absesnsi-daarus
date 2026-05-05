# Absensi Daarus - QR Code Attendance System

Sistem absensi berbasis QR Code untuk kantor kecil (<20 karyawan) menggunakan 100% layanan gratis.

## Fitur Utama

- QR Code Scanner: Karyawan scan QR di kantor untuk absen
- Clock In/Out: Absen masuk dan pulang dengan satu tap
- Device Binding: Perangkat terbind otomatis untuk kemudahan scan berikutnya
- Admin Dashboard: Pantau kehadiran real-time
- Export Excel: Export laporan absensi dalam format .xlsx
- Email Notifications: Reminder otomatis via Resend (100 email/hari gratis)
- Mobile-First: Desain responsif untuk penggunaan HP

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database & Auth**: Supabase (PostgreSQL + Auth)
- **Deployment**: Vercel
- **QR Generator**: qrcode npm package
- **Excel Export**: xlsx
- **Email**: Resend
- **Date Handling**: date-fns dengan timezone Asia/Jakarta

## Setup Instructions

### 1. Buat Project Supabase

1. Kunjungi [supabase.com](https://supabase.com) dan buat project baru
2. Di dashboard Supabase, buka SQL Editor
3. Jalankan SQL migration dari file `supabase/migrations/0001_init.sql`
4. Dapatkan URL dan API Keys dari Project Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### 2. Environment Variables

Copy `.env.example` ke `.env.local` dan isi dengan credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=your-resend-api-key
CRON_SECRET=random-secret-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Buat Admin User

1. Jalankan `npm run dev`
2. Buka `http://localhost:3000/register?office=TOKEN` (ganti TOKEN dengan qr_code_token dari database)
3. Daftar dengan email dan password
4. Buka Supabase dashboard > Table Editor > profiles
5. Edit user yang baru daftar, ganti role menjadi `admin`

### 5. Dapatkan QR Code

1. Login sebagai admin
2. Buka `/admin/qr`
3. Download QR Code dan cetak
4. Tempel di pintu masuk kantor

### 6. Deploy ke Vercel

1. Push code ke GitHub repository
2. Import project di [vercel.com](https://vercel.com)
3. Set environment variables yang sama
4. Deploy!

## Project Structure

```
/app
  /(public)        # Halaman publik (login, register)
  /(employee)      # Halaman karyawan (scan, history)
  /(admin)         # Halaman admin (dashboard, employees, dll)
  /api             # API routes (cron, export)
/components
  /ui              # shadcn/ui components
  /attendance      # Komponen absensi
  /admin           # Komponen admin
/lib
  /supabase        # Supabase client/server
  /utils           # Utility functions
  /actions         # Server actions
/types
  database.types.ts
```

## Cron Jobs

Vercel Cron Jobs akan menjalankan:
- **09:30 WIB**: Reminder clock-in untuk yang belum absen
- **17:30 WIB**: Reminder clock-out untuk yang belum pulang
- **23:00 WIB**: Mark absent untuk yang tidak masuk + kirim summary ke admin

## Security

- Row Level Security (RLS) diaktifkan di semua tabel Supabase
- Semua mutations via Server Actions
- Cron endpoints dilindungi dengan CRON_SECRET
- Validasi office token di setiap clock in/out

## License

MIT
