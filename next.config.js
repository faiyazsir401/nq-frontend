/** @type {import('next').NextConfig} */
const nextConfig = {
    //   images: {
    //     unoptimized: true
    //   }
    webpack(config) {
        config.experiments = { ...config.experiments, asyncWebAssembly: true };
        return config;
    },
}

module.exports = nextConfig