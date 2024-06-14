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
  const { deltaTime, progressBar } = e;

  progressBar.progress += 0.01 * (deltaTime * 0.02);
}

bar.start(step);
