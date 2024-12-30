/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack(config) {
      config.experiments = { 
        ...config.experiments, 
        asyncWebAssembly: true 
      };
      return config;
    },
  
    async rewrites() {
      return [
        {
          source: '/privacy-policy',
          destination: '/privacy-policy.html',
        },
        {
            source: '/t&c',
            destination: '/t&c.html',
          },
      ];
    },
  };
  
  module.exports = nextConfig;
  