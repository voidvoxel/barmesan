import { ProgressBar } from "../dist/index.js";

const bar = new ProgressBar(
  {
    size: 64,
    thresholds: {
      cool: NaN
    }
  }
);

function step(e) {
  const { deltaTime, progressBar } = e;

  progressBar.progress += 0.01 * (deltaTime * 0.02);
}

bar.start(step);
