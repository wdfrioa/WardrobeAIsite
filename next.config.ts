// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'export',
//   images: { unoptimized: true },
// };
// module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',              // статический экспорт
  basePath: '/WardrobeAIsite',   // название твоего репо
  assetPrefix: '/WardrobeAIsite/',
  images: {
    unoptimized: true,           // GitHub Pages не поддерживает оптимизацию картинок
  },
  trailingSlash: true,
};

module.exports = nextConfig;