const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const EXECUTION_CONFIG = {
  javascript: {
    fileName: "code.js",
    command: "node:18 node code.js",
  },
  python: {
    fileName: "code.py",
    command: "python:3.11 python code.py",
  },
  c: {
    fileName: "code.c",
    command: 'gcc:13 sh -c "gcc code.c -O2 -o code.out && ./code.out"',
  },
  cpp: {
    fileName: "code.cpp",
    command: 'gcc:13 sh -c "g++ code.cpp -std=c++17 -O2 -o code.out && ./code.out"',
  },
  java: {
    fileName: "Main.java",
    command: 'eclipse-temurin:17 sh -c "javac Main.java && java Main"',
  },
};

const executeCode = (req, res) => {
  const { code, language = "javascript" } = req.body;
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

  const command = `docker run --rm -v "${dockerPath}:/workspace" -w /workspace ${runner.command}`;

  exec(command, { timeout: 300000 }, (err, stdout, stderr) => {
    if (err) {
      if (err.killed && err.signal === "SIGTERM") {
        return res.json({
          output:
            "Execution timed out while Docker image was downloading or code was running. Please run again after images finish pulling.",
        });
      }

      return res.json({ output: stderr || err.message });
    }

    return res.json({ output: stdout });
  });
};

module.exports = { executeCode };