import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Permite acesso externo no Docker
    port: 8080,
    watch: {
      usePolling: true, // Necessário para hot reload no Docker
    },
  },

preview: {
    host: true, // Ouve em todos os IPs, incluindo 127.0.0.1
    port: 8080, // A porta que o Nginx está usando
    strictPort: true,
    // A LINHA MAIS IMPORTANTE QUE RESOLVE O PROBLEMA
    allowedHosts: ["jpedidos.klafkefilho.com.br"],
  },


  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
