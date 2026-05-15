const fs = require("fs");
const path = require("path");

const ignore = ["node_modules", ".git", "dist", "build", ".next"];

function generateTree(dir, prefix = "") {
  let result = "";
  const files = fs.readdirSync(dir);

  files.forEach((file, index) => {
    if (ignore.includes(file)) return;

    const filePath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const connector = isLast ? "└── " : "├── ";

    result += prefix + connector + file + "\n";

    if (fs.statSync(filePath).isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      result += generateTree(filePath, newPrefix);
    }
  });

  return result;
}

const tree = generateTree(process.cwd());
fs.writeFileSync("tree.txt", tree);

console.log("Arborescence générée dans tree.txt");
