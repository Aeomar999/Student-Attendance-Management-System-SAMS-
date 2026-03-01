const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (file === "node_modules" || file === ".next") return;
        let p = path.join(dir, file);
        const stat = fs.statSync(p);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(p));
        } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
            results.push(p);
        }
    });
    return results;
}

const dir = 'C:\\Users\\Jerry\\Desktop\\PROJECT 2026\\SAMS\\SAMS\\sams-app\\src\\app';
const files = walk(dir);

const badClasses = [
    "rounded-2xl",
    "rounded-3xl",
    "bg-card/80",
    "backdrop-blur-sm",
    "bg-sams-primary-dark",
    "bg-sams-primary",
    "text-sams-primary",
    "hover:bg-sams-primary-dark",
    "active:scale-95",
    "transition-shadow",
    "hover:shadow-md",
    "hover:shadow-xl",
    "hover:-translate-y-0.5",
    "hover:-translate-y-1",
    "duration-300",
    "group",
    "rounded-full" // be careful with this one, but mostly safe to strip from generic wrappers
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // We only want to strip rounded-full from Buttons or generic divs, but it's hard to parse AST.
    // Instead, let's just do text replacement for exact common SAMS class strings first.
    
    // Auth Page Replacements
    content = content.replace(/className="w-full rounded-full bg-sams-primary text-white hover:bg-sams-primary-dark active:scale-95 transition-all shadow-sm hover:shadow-md"/g, 'className="w-full"');
    
    // Generic Button Replacements
    content = content.replace(/className="rounded-full bg-sams-primary text-white hover:bg-sams-primary-dark active:scale-95 transition-all shadow-sm hover:shadow-md"/g, '');
    content = content.replace(/className="rounded-full bg-sams-primary text-white hover:bg-sams-primary-dark shadow-sm px-5"/g, '');
    content = content.replace(/className="rounded-full active:scale-95 transition-all shadow-sm hover:shadow-md"/g, '');
    content = content.replace(/className="rounded-full active:scale-95 transition-all shadow-sm"/g, '');
    content = content.replace(/className="w-full rounded-full active:scale-95 transition-all shadow-sm"/g, 'className="w-full"');
    content = content.replace(/className="rounded-full hover:bg-muted"/g, '');
    content = content.replace(/className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full"/g, '');
    
    // Generic Card Replacements
    content = content.replace(/rounded-2xl border border-border\/50 bg-card\/80 backdrop-blur-sm/g, '');
    content = content.replace(/rounded-3xl bg-card border border-border\/50 shadow-sm/g, '');
    content = content.replace(/rounded-2xl border bg-sams-primary text-white shadow-sm/g, 'bg-primary text-primary-foreground');
    content = content.replace(/bg-sams-primary\/10/g, 'bg-primary/10');
    content = content.replace(/bg-sams-primary\/5/g, 'bg-primary/5');
    content = content.replace(/text-sams-primary/g, 'text-primary');
    content = content.replace(/bg-sams-primary/g, 'bg-primary');
    
    // Clean up scattered bad utility classes inside classNames using a regex replacer
    content = content.replace(/className="([^"]*)"/g, (match, p1) => {
        let classes = p1.split(/\s+/);
        // Remove bad classes ONLY if it's not likely an Avatar or specific rounded UI meant to be circle.
        // Actually, if it's an Avatar, it usually doesn't have these other specific hovering classes together.
        // We will remove transition-shadow, active:scale-95 etc.
        classes = classes.filter(c => {
            if (c === "active:scale-95" || c === "hover:-translate-y-0.5" || c === "hover:-translate-y-1" || c === "backdrop-blur-sm" || c === "bg-card/80" || c.startsWith("hover:shadow-") || c === "transition-shadow") return false;
            // remove rounded-2xl completely
            if (c === "rounded-2xl" || c === "rounded-3xl") return false;
            return true;
        });
        const clean = classes.join(' ').trim();
        if (!clean) return '';
        return `className="${clean}"`;
    });

    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated ${file}`);
    }
});
