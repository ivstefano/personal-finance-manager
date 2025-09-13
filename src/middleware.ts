import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect dashboard and other authenticated routes
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }

        // Allow access to all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*']
}