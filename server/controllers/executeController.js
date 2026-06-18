const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const EXECUTION_CONFIG = {
  javascript: {
    fileName: "code.js",
    command: 'node:18 sh -c "node code.js < input.txt"',
  },
  python: {
    fileName: "code.py",
    command: 'python:3.11 sh -c "python code.py < input.txt"',
  },
  c: {
    fileName: "code.c",
    command: 'gcc:13 sh -c "gcc code.c -O2 -o code.out && ./code.out < input.txt"',
  },
  cpp: {
    fileName: "code.cpp",
    command: 'gcc:13 sh -c "g++ code.cpp -std=c++17 -O2 -o code.out && ./code.out < input.txt"',
  },
  java: {
    fileName: "Main.java",
    command: 'eclipse-temurin:17 sh -c "javac Main.java && java Main < input.txt"',
  },
};

const executeCode = (req, res) => {
  const { code, language = "javascript", input = "" } = req.body;
  const selectedLanguage = String(language).toLowerCase();
  const runner = EXECUTION_CONFIG[selectedLanguage];

  if (!runner) {
    return res.status(400).json({
      output: `Unsupported language: ${language}`,
    });
  }

  const dockerPath = path.join(__dirname, "../docker");
  const filePath = path.join(dockerPath, runner.fileName);

  // write code to file
  fs.writeFileSync(filePath, code);
  fs.writeFileSync(
    path.join(dockerPath, "input.txt"),
    input
  );

  const command = `docker run --rm -v "${dockerPath}:/workspace" -w /workspace ${runner.command}`;

  exec(command, { timeout: 5000 }, (err, stdout, stderr) => {
    console.log("STDOUT =", JSON.stringify(stdout));
    console.log("STDERR =", JSON.stringify(stderr));

    if (err) {
      console.log("ERROR =", err);
    }

    res.json({ output: stdout || stderr });
  });
};

module.exports = { executeCode };