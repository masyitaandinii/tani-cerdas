import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin")) {
        // Proteksi 1: Role 'user' murni (publik yang ter-auth) tidak boleh masuk /admin
        if (token?.role === 'user') {
            return NextResponse.redirect(new URL("/", req.url));
        }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        // Mengembalikan true berarti diizinkan lanjut ke middleware function di atas.
        // Jika belum login (token null) dan mengakses /admin, biarkan masuk agar 
        // halaman /admin bisa me-render komponen form login.
        return true;
      },
    },
  }
);

export const config = {
  // Hanya memproteksi root /admin dan semua sub-pathnya
  matcher: ["/admin", "/admin/:path*"],
};
