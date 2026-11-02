import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'Selaras — Pendamping Kesejahteraan Digital',
    description: 'Pemantauan ergonomi, kelelahan, dan ritme fokus berbasis privacy-by-design tanpa surveillance.',
    version: '0.1.0',
    permissions: [
      'storage',
      'alarms',
      'idle',
      'notifications',
      'offscreen',
    ],
    host_permissions: [
      'https://*.supabase.co/*',
    ],
    action: {
      default_title: 'Selaras',
    },
    options_ui: {
      page: 'entrypoints/options/index.html',
      open_in_tab: true,
    },
    web_accessible_resources: [
      {
        resources: ['wasm/*', 'models/*'],
        matches: ['<all_urls>'],
      },
    ],
  },
  vite: () => ({
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    optimizeDeps: {
      include: ['@selaras/shared', 'idb', 'lucide-react'],
    },
  }),
});
