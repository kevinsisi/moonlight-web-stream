const { execFileSync } = require("child_process");

function run(command, args, options = {}) {
  execFileSync(command, args, {
    stdio: "inherit",
    ...options,
  });
}

function generateWithCargo() {
  run("cargo", ["test", "export_bindings", "--package", "common"]);
}

function generateWithDocker() {
  const setup = [
    "apt-get update",
    "apt-get install -y libclang-dev clang cmake make pkg-config",
    "/usr/local/cargo/bin/cargo test export_bindings --package common",
  ].join(" && ");

  run("docker", [
    "run",
    "--rm",
    "-v",
    `${process.cwd()}:/work`,
    "-w",
    "/work",
    "-e",
    "CARGO_TARGET_DIR=/tmp/moonlight-target",
    "rustlang/rust:nightly",
    "bash",
    "-lc",
    setup,
  ]);
}

if (process.platform === "win32") {
  generateWithDocker();
} else {
  generateWithCargo();
}
