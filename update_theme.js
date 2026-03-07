import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const walk = (dir, callback) => {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) walk(fullPath, callback);
        else if (fullPath.endsWith('.tsx')) callback(fullPath);
    });
};

const replaceInFile = (filePath) => {
    let content = fs.readFileSync(filePath, 'utf8');
    const og = content;

    // Replace text-white
    content = content.replace(/(?<!(?:dark:|hover:|-))text-white\b/g, 'text-gray-900 dark:text-white');
    // Replace text-gray-400
    content = content.replace(/(?<!(?:dark:|hover:|-))text-gray-400\b/g, 'text-gray-500 dark:text-gray-400');
    // Replace hover:text-white
    content = content.replace(/(?<!(?:dark:|-))hover:text-white\b/g, 'hover:text-gray-900 dark:hover:text-white');
    // Replace text-gray-300
    content = content.replace(/(?<!(?:dark:|hover:|-))text-gray-300\b/g, 'text-gray-700 dark:text-gray-300');
    // Replace hover:text-gray-300
    content = content.replace(/(?<!(?:dark:|-))hover:text-gray-300\b/g, 'hover:text-gray-700 dark:hover:text-gray-300');
    // Replace bg-gray-950 (usually min-h-screen bg-gray-950)
    content = content.replace(/(?<!(?:dark:|-))\bbg-gray-950(?!\/)\b/g, 'bg-gray-50 dark:bg-gray-950');
    // Replace bg-white/5
    content = content.replace(/(?<!(?:dark:|hover:|-))bg-white\/5\b/g, 'bg-black/5 dark:bg-white/5');
    // Replace border-white/5
    content = content.replace(/(?<!(?:dark:|-))border-white\/5\b/g, 'border-black/5 dark:border-white/5');
    // Replace border-white/10
    content = content.replace(/(?<!(?:dark:|-))border-white\/10\b/g, 'border-black/10 dark:border-white/10');
    // Replace bg-white/[0.02]
    content = content.replace(/(?<!(?:dark:|-))bg-white\/\[0\.02\]\b/g, 'bg-black/[0.02] dark:bg-white/[0.02]');
    // Replace hover:bg-white/5
    content = content.replace(/(?<!(?:dark:|-))hover:bg-white\/5\b/g, 'hover:bg-black/5 dark:hover:bg-white/5');

    if (og !== content) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
};

walk(path.join(process.cwd(), 'src'), replaceInFile);
