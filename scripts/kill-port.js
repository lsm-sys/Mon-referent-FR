const { execSync } = require("child_process");

const port = process.argv[2] ?? "3001";

function killPortWindows(targetPort) {
  try {
    const output = execSync(`netstat -ano | findstr ":${targetPort}"`, {
      encoding: "utf8",
    });

    const pids = new Set(
      output
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.includes("LISTENING"))
        .map((line) => line.split(/\s+/).at(-1))
        .filter((pid) => pid && pid !== "0"),
    );

    for (const pid of pids) {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
      console.log(`Stopped process ${pid} on port ${targetPort}`);
    }
  } catch {
    // Port is already free.
  }
}

if (process.platform === "win32") {
  killPortWindows(port);
}
