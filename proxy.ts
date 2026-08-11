import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
        // Izinkan root /admin diakses (untuk menampilkan form login).
        // Halaman itu sendiri akan me-redirect ke dashboard jika sudah terotentikasi.
        if (path !== "/admin") {
            if (!token) {
                // Blokir akses ke sub-path admin (misal /admin/input) jika belum login
                return NextResponse.redirect(new URL("/admin", req.url));
            }
            
            // Pendekatan Allowlist: Hanya admin dan superadmin yang boleh masuk sub-path admin
            const allowedRoles = ['admin', 'superadmin'];
            if (!allowedRoles.includes(token.role as string)) {
                return NextResponse.redirect(new URL("/", req.url));
            }
        }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        // Mengembalikan true karena kita menangani pengecekan otentikasi
        // secara manual di dalam fungsi middleware di atas.
        return true;
      },
    },
  }
);

export const config = {
  // Hanya memproteksi root /admin dan semua sub-pathnya
  matcher: ["/admin", "/admin/:path*"],
};
