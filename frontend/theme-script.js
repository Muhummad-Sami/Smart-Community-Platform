const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = [
  // Hex color replacements (Blue/Violet to Teal/Amber)
  { regex: /#2563eb/gi, replace: '#14B8A6' },
  { regex: /#3b82f6/gi, replace: '#14B8A6' },
  { regex: /#7c3aed/gi, replace: '#14B8A6' },
  { regex: /#8b5cf6/gi, replace: '#0D9488' },
  
  // Tailwind color classes (Accents)
  { regex: /blue-600/g, replace: 'teal-500' },
  { regex: /blue-500/g, replace: 'teal-500' },
  { regex: /violet-600/g, replace: 'teal-500' },
  { regex: /violet-500/g, replace: 'teal-500' },
  { regex: /indigo-600/g, replace: 'teal-500' },

  // Background conversions (Dark mode to Light mode with Navy structural areas)
  { regex: /bg-slate-900/g, replace: 'bg-primary-900' },
  { regex: /bg-slate-800/g, replace: 'bg-white' },
  { regex: /bg-slate-700/g, replace: 'bg-gray-100' },
  { regex: /bg-slate-600/g, replace: 'bg-gray-200' },

  // Borders
  { regex: /border-slate-800/g, replace: 'border-gray-200' },
  { regex: /border-slate-700/g, replace: 'border-gray-200' },
  { regex: /border-slate-600/g, replace: 'border-gray-300' },

  // Text colors (Dark mode text to Light mode text)
  { regex: /text-slate-300/g, replace: 'text-gray-600' },
  { regex: /text-slate-400/g, replace: 'text-gray-500' },
  { regex: /text-slate-200/g, replace: 'text-gray-800' },

  // Hover states
  { regex: /hover:bg-slate-700/g, replace: 'hover:bg-primary-800' },
  { regex: /hover:bg-slate-800/g, replace: 'hover:bg-gray-50' },

  // Miscellaneous old classes
  { regex: /shadow-glow-blue/g, replace: 'shadow-card' },
  { regex: /shadow-glow-violet/g, replace: 'shadow-card' },
  { regex: /glass-card/g, replace: 'card' },
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) { 
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
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});

console.log('Theme applied successfully!');
