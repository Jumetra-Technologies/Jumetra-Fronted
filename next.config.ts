/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV === "production"
        ? "https://jumetra-backend-1.onrender.com"
        : "http://127.0.0.1:8000"),
  },
};

export default nextConfig;
