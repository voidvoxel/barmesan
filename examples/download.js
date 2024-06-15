import { ProgressBar } from "../dist/index.js";

// Define options to create a new progress bar with.
const options = {
  thresholds: {
    cold: NaN,
    cool: 0,
    warm: NaN,
    hot: NaN
  }
};

// Create a progress bar.
const progressBar = new ProgressBar(options);

// Pseudo download function.
function download(downloadSizeInBytes) {
  let downloadedByteCount = 0;

  function downloadMoreBytes(e) {
    downloadedByteCount += Math.round(e.deltaTime);

    progressBar.progress = downloadedByteCount / downloadSizeInBytes;
  }

  // Start the task.
  progressBar.start(downloadMoreBytes);
}

// Pretend to download a file.
download(1000);
