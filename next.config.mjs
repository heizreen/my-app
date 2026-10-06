/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    // The Ghibli API serves its posters from these two hosts
    remotePatterns: [
      new URL("https://image.tmdb.org/t/p/**"),
      new URL("https://www.themoviedb.org/t/p/**"),
    ],
  },
};

export default nextConfig;
