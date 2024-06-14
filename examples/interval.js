import { ProgressBar } from "../dist/index.js";

const bar = new ProgressBar(
  {
    clearWhenFull: true,
    reuseLine: true
  }
);

function step(e) {
  const { progressBar } = e;

  progressBar.progress += 0.01;
}

// HACK: Workaround the bug where intervals keep the process running even after the callback returns.
bar.on("full", () => process.exit());

bar.interval(step, 50);
