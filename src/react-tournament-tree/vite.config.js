import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    build: {
        lib: {
            entry: './src/index.ts',
            name: 'ReactTournamentTree',
            formats: ['es'],
            fileName: () => 'index.js',
        },
        rollupOptions: {
            external: [
                'react',
                'react/jsx-runtime',
                'react/jsx-dev-runtime',
                'react-dom',
                'react-dom/client',
                '@graph-render/react',
                '@graph-render/types',
            ],
        },
    },
    server: {
        port: 5173,
        open: true,
    },
});
//# sourceMappingURL=vite.config.js.map