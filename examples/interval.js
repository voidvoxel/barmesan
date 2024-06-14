import { ProgressBar } from "../dist/index.js";

const bar = new ProgressBar(
  {
    colorBlindnessMode: "r",
    clearWhenFull: true,
    reuseLine: true,
    thresholds: {
      cool: 0.75,
      warm: 0.89,
      hot: 0.98
    }
  }
);

function step(e) {
  const { progressBar } = e;

  progressBar.progress += 0.01;
}

// HACK: Workaround the bug where intervals keep the process running even after the callback returns.
bar.on("full", () => process.exit());

bar.interval(step, 50);
