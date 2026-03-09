const fs = require('fs');
const path = require('path');

const log = fs.readFileSync('tsc_errors.log', 'utf-8');
const missingPropRegex = /'(.*?)' does not exist.*?(?:Did you mean '(.*?)')?/g;

const missing = new Set();
let match;
while ((match = missingPropRegex.exec(log)) !== null) {
    missing.add(match[1]);
}

console.log("Remaining unique missing properties/names:");
console.log(Array.from(missing).join(", "));
