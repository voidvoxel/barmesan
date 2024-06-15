import { ProgressBar } from "../dist/index.js";

// Create a progress bar.
const progressBar = new ProgressBar();

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
