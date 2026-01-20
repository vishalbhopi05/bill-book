/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    MONGODB_URI: 'mongodb+srv://vishalbhopi:vishalbhopi@cluster0.xa7hyrs.mongodb.net/mandap-planner',
    NEXTAUTH_SECRET: 'your-secret-key-change-in-production',
    NEXTAUTH_URL: 'http://localhost:3000'
  }
}

module.exports = nextConfig
