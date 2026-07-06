const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Backgrounds
  { regex: /bg-white\/5/g, replace: 'bg-slate-800' },
  { regex: /bg-white\/10/g, replace: 'bg-slate-700' },
  { regex: /bg-white\/\[0\.02\]/g, replace: 'bg-slate-800' },
  { regex: /bg-white\/\[0\.03\]/g, replace: 'bg-slate-800' },
  { regex: /bg-white\/\[0\.05\]/g, replace: 'bg-slate-700' },
  { regex: /bg-\[#0d1117\](\/\d+)?/g, replace: 'bg-slate-900' },
  { regex: /bg-\[#0f1629\](\/\d+)?/g, replace: 'bg-slate-900' },
  { regex: /bg-\[#141e35\](\/\d+)?/g, replace: 'bg-slate-800' },
  { regex: /bg-black\/40/g, replace: 'bg-slate-900' },
  { regex: /bg-black\/60/g, replace: 'bg-slate-800' },
  { regex: /bg-black\/70/g, replace: 'bg-slate-900\/90' },
  
  // Borders
  { regex: /border-white\/5/g, replace: 'border-slate-700' },
  { regex: /border-white\/8/g, replace: 'border-slate-700' },
  { regex: /border-white\/10/g, replace: 'border-slate-700' },
  { regex: /border-white\/20/g, replace: 'border-slate-600' },
  { regex: /border-\[#141e35\]/g, replace: 'border-slate-700' },
  
  // Hover states
  { regex: /hover:bg-white\/5/g, replace: 'hover:bg-slate-700' },
  { regex: /hover:bg-white\/8/g, replace: 'hover:bg-slate-700' },
  { regex: /hover:bg-white\/10/g, replace: 'hover:bg-slate-600' },
  { regex: /hover:bg-white\/\[0\.02\]/g, replace: 'hover:bg-slate-800' },
  { regex: /hover:bg-white\/\[0\.05\]/g, replace: 'hover:bg-slate-700' },
  { regex: /hover:bg-\[#0f1629\]/g, replace: 'hover:bg-slate-800' },
  
  // Text colors
  { regex: /text-\[#94a3b8\]/g, replace: 'text-slate-300' },
  { regex: /text-gray-400/g, replace: 'text-slate-300' },
  { regex: /text-gray-300/g, replace: 'text-slate-200' },
  
  // Blurs
  { regex: /backdrop-blur-(sm|md|lg|xl|2xl)/g, replace: '' },
  
  // Shadows (removing glowing box shadows)
  { regex: /shadow-\[.*?\]/g, replace: 'shadow-lg' },
  
  // Gradients (replace with solid vibrant colors)
  { regex: /bg-gradient-to-(r|br|tr|bl) from-\[#3b82f6\] to-\[#8b5cf6\]/g, replace: 'bg-blue-600' },
  { regex: /bg-gradient-to-(r|br|tr|bl) from-\[#2563eb\] to-\[#7c3aed\]/g, replace: 'bg-blue-600' },
  { regex: /bg-gradient-to-(r|br|tr|bl) from-\[#ef4444\] to-\[#f97316\]/g, replace: 'bg-red-600' },
  
  // Custom button gradients -> solid
  { regex: /bg-gradient-to-(r|br|l) from-blue-600 to-violet-600/g, replace: 'bg-blue-600' },
  { regex: /bg-gradient-to-(r|br|l) from-blue-500 to-violet-600/g, replace: 'bg-blue-600' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.css')) { 
      results.push(file);
    }
  });
  return results;
}

const files = walk(directoryPath);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(r => {
    content = content.replace(r.regex, r.replace);
  });
  
  // Clean up any double spaces caused by removing backdrop-blur
  content = content.replace(/  +/g, ' ');
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('UI Overhaul Complete!');
