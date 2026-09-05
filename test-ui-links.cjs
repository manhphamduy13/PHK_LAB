const fs = require("fs");
const path = require("path");

function searchDeadLinks(dir) {
  let files = fs.readdirSync(dir);
  let deadCount = 0;

  for (let f of files) {
    let fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      searchDeadLinks(fullPath);
    } else if (fullPath.endsWith(".tsx")) {
      let content = fs.readFileSync(fullPath, "utf8");
      if (content.includes('href="#"') || content.includes('to="#"')) {
        console.warn(`Found potential dead link in ${fullPath}`);
        deadCount++;
      }
      if (
        content.toLowerCase().includes("todo") ||
        content.toLowerCase().includes("fixme")
      ) {
        console.warn(`Found TODO/FIXME in ${fullPath}`);
        deadCount++;
      }
    }
  }
}
searchDeadLinks("src/pages");
searchDeadLinks("src/layouts");
console.log("Dead link scan complete.");
