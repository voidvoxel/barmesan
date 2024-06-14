import { ProgressBar } from "../dist/index.js";

const bar = new ProgressBar(
  {
    clearWhenFull: true,
    reuseLine: true,
    thresholds: {
      warm: 0.7,
      cool: 0.89,
      cold: 0.98,
      reverse: true
    }
  }
);

function step(e) {
  const { deltaTime, progressBar } = e;

  progressBar.progress += 0.01 * (deltaTime * 0.02);
}

bar.start(step);
