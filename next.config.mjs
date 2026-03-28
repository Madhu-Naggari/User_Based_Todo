import path from "path";

const nextConfig = {
  reactCompiler: true,
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
