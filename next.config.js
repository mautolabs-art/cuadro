/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable PWA headers
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
