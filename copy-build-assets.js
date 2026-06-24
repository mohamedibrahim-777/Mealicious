const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  let entries = fs.readdirSync(src, { withFileTypes: true });

  for (let entry of entries) {
    let srcPath = path.join(src, entry.name);
    let destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  console.log("Copying build assets...");
  
  // Copy .next/static -> .next/standalone/.next/static
  const srcStatic = path.join(__dirname, '.next', 'static');
  const destStatic = path.join(__dirname, '.next', 'standalone', '.next', 'static');
  if (fs.existsSync(srcStatic)) {
    copyDir(srcStatic, destStatic);
    console.log("Copied .next/static successfully.");
  } else {
    console.warn("Warning: .next/static not found");
  }

  // Copy public -> .next/standalone/public
  const srcPublic = path.join(__dirname, 'public');
  const destPublic = path.join(__dirname, '.next', 'standalone', 'public');
  if (fs.existsSync(srcPublic)) {
    copyDir(srcPublic, destPublic);
    console.log("Copied public successfully.");
  } else {
    console.warn("Warning: public directory not found");
  }

  console.log("Assets copy complete!");
} catch (err) {
  console.error("Error copying build assets:", err);
  process.exit(1);
}
