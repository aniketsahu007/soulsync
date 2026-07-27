const fs = require('fs');
const path = require('path');

// We need to carefully match Tailwind opacity modifiers like \/(\d+) or \/\[.*?\]
// Example: bg-white/80 -> bg-white/80 dark:bg-slate-950/80
// bg-white -> bg-white dark:bg-slate-950

const replacements = [
  { search: /\bbg-white(?:\/(\d+|\[.*?\]))?(?!\s+dark:bg-)\b/g, replace: (match, opacity) => `bg-white${opacity ? '/' + opacity : ''} dark:bg-slate-950${opacity ? '/' + opacity : ''}` },
  
  { search: /\btext-slate-950(?:\/(\d+|\[.*?\]))?(?!\s+dark:text-)\b/g, replace: (match, opacity) => `text-slate-950${opacity ? '/' + opacity : ''} dark:text-slate-50${opacity ? '/' + opacity : ''}` },
  { search: /\btext-slate-900(?:\/(\d+|\[.*?\]))?(?!\s+dark:text-)\b/g, replace: (match, opacity) => `text-slate-900${opacity ? '/' + opacity : ''} dark:text-slate-50${opacity ? '/' + opacity : ''}` },
  { search: /\btext-slate-800(?:\/(\d+|\[.*?\]))?(?!\s+dark:text-)\b/g, replace: (match, opacity) => `text-slate-800${opacity ? '/' + opacity : ''} dark:text-slate-200${opacity ? '/' + opacity : ''}` },
  { search: /\btext-slate-700(?:\/(\d+|\[.*?\]))?(?!\s+dark:text-)\b/g, replace: (match, opacity) => `text-slate-700${opacity ? '/' + opacity : ''} dark:text-slate-300${opacity ? '/' + opacity : ''}` },
  { search: /\btext-slate-600(?:\/(\d+|\[.*?\]))?(?!\s+dark:text-)\b/g, replace: (match, opacity) => `text-slate-600${opacity ? '/' + opacity : ''} dark:text-slate-400${opacity ? '/' + opacity : ''}` },
  { search: /\btext-slate-500(?:\/(\d+|\[.*?\]))?(?!\s+dark:text-)\b/g, replace: (match, opacity) => `text-slate-500${opacity ? '/' + opacity : ''} dark:text-slate-400${opacity ? '/' + opacity : ''}` },
  
  { search: /\bborder-slate-50(?:\/(\d+|\[.*?\]))?(?!\s+dark:border-)\b/g, replace: (match, opacity) => `border-slate-50${opacity ? '/' + opacity : ''} dark:border-slate-800${opacity ? '/' + opacity : ''}` },
  { search: /\bborder-slate-100(?:\/(\d+|\[.*?\]))?(?!\s+dark:border-)\b/g, replace: (match, opacity) => `border-slate-100${opacity ? '/' + opacity : ''} dark:border-slate-800${opacity ? '/' + opacity : ''}` },
  { search: /\bborder-slate-200(?:\/(\d+|\[.*?\]))?(?!\s+dark:border-)\b/g, replace: (match, opacity) => `border-slate-200${opacity ? '/' + opacity : ''} dark:border-slate-800${opacity ? '/' + opacity : ''}` },
  
  { search: /\bbg-slate-50(?:\/(\d+|\[.*?\]))?(?!\s+dark:bg-)\b/g, replace: (match, opacity) => `bg-slate-50${opacity ? '/' + opacity : ''} dark:bg-slate-900${opacity ? '/' + opacity : ''}` },
  { search: /\bbg-slate-100(?:\/(\d+|\[.*?\]))?(?!\s+dark:bg-)\b/g, replace: (match, opacity) => `bg-slate-100${opacity ? '/' + opacity : ''} dark:bg-slate-900${opacity ? '/' + opacity : ''}` },
  
  { search: /bg-\[\#f7fbf8\](?:\/(\d+|\[.*?\]))?(?!\s+dark:bg-)/g, replace: (match, opacity) => `bg-[#f7fbf8]${opacity ? '/' + opacity : ''} dark:bg-[#09090b]${opacity ? '/' + opacity : ''}` },
  
  { search: /\bshadow-sm(?!\s+dark:shadow-none)\b/g, replace: 'shadow-sm dark:shadow-none' },
  { search: /\bshadow-md(?!\s+dark:shadow-none)\b/g, replace: 'shadow-md dark:shadow-none' },
  { search: /\bshadow-lg(?!\s+dark:shadow-none)\b/g, replace: 'shadow-lg dark:shadow-none' },
  { search: /\bshadow-xl(?!\s+dark:shadow-none)\b/g, replace: 'shadow-xl dark:shadow-none' },
  { search: /\bshadow-2xl(?!\s+dark:shadow-none)\b/g, replace: 'shadow-2xl dark:shadow-none' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const rule of replacements) {
        if (rule.search.test(content)) {
          content = content.replace(rule.search, rule.replace);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
console.log("Done.");
