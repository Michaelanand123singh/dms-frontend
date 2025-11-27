/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Compress output
  compress: true,
  
  // Production optimizations (swcMinify and optimizeFonts are enabled by default in Next.js 16)
  
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // Production source maps (optional - disable for smaller bundle)
  productionBrowserSourceMaps: false,
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
