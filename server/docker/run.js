const fs = require("fs");

// read code
const code = fs.readFileSync("code.js", "utf-8");

// capture console output and the final expression result
let output = "";

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  output += args.join(" ") + "\n";
};

console.error = (...args) => {
  output += args.join(" ") + "\n";
};

const run = async () => {
  try {
    const result = eval(code);

    if (result instanceof Promise) {
      const resolved = await result;

      if (resolved !== undefined) {
        output += `${typeof resolved === "object" ? JSON.stringify(resolved, null, 2) : resolved}\n`;
      }
    } else if (result !== undefined) {
      output += `${typeof result === "object" ? JSON.stringify(result, null, 2) : result}\n`;
    }
  } catch (err) {
    output += err.stack || err.message;
  } finally {
    console.log = originalLog;
    console.error = originalError;

    // print final output
    process.stdout.write(output);
  }
};

run();