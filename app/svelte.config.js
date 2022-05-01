import preprocess from "svelte-preprocess";
// import adapter from '@sveltejs/adapter-static';
import vercel from "@sveltejs/adapter-vercel";
import path from "path";

const config = {
  preprocess: preprocess(),

  kit: {
    adapter: vercel({
      edge: false,
      external: [],
      split: false
    }),

    vite: {
      ssr: {
        noExternal: ["@fortawesome/free-solid-svg-icons"]
      },
      optimizeDeps: {
        include: ["@project-serum/anchor"]
      },
      resolve: {
        alias: {
          $utils: path.resolve("src/utils/")
        }
      },
      define: {
        // This makes @project-serum/anchor 's process error not happen since it replaces all instances of process.env.BROWSER with true
        "process.env.BROWSER": true
      }
    }
  }
};

export default config;
