import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { brand: { blue: '#1769E0', bright: '#2F80ED', navy: '#101D55', ink: '#17213D', mist: '#EEF5FF' } } } }, plugins: [] };
export default config;
