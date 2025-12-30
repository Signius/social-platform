/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        ...(process.env.NEXT_PUBLIC_APP_URL 
          ? [new URL(process.env.NEXT_PUBLIC_APP_URL).host] 
          : [])
      ],
    },
  },
  // Netlify deployment configuration
  ...(process.env.NETLIFY === 'true' && { output: 'standalone' }),
}

module.exports = nextConfig

