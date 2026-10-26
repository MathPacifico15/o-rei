import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
export default defineConfig({root:'preview',publicDir:'../public',plugins:[react()],resolve:{alias:{'@':fileURLToPath(new URL('.',import.meta.url))}},define:{'process.env.NEXT_PUBLIC_SUPABASE_URL':'""','process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY':'""'},server:{host:'127.0.0.1',port:4182,strictPort:true},build:{outDir:'../dist-local',emptyOutDir:true}});
