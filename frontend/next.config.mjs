/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/solar-2",
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
