import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const githubMain=fileURLToPath(new URL('../github-main-minigames/',import.meta.url));
export default defineConfig({root:'preview-github-main',plugins:[react()],resolve:{alias:{'@':githubMain}},define:{'process.env.NEXT_PUBLIC_SUPABASE_URL':'""','process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY':'""'},server:{host:'127.0.0.1',port:4185,strictPort:true}});
