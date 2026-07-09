export function getGitCommitHash() {
  const { stdout } = Bun.spawnSync({
    cmd: ["git", "rev-parse", "--short", "HEAD"],
    stdout: "pipe"
  });

  return stdout.toString();
}
