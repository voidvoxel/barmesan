import { ProgressBar } from "../dist/index.js";

// Pseudo download function.
function download(downloadSizeInBytes) {
  // Create a progress bar.
  const progressBar = new ProgressBar();

  // The total number of bytes downloaded.
  let downloadedByteCount = 0;

  // Receive the next set of bytes.
  function downloadMoreBytes(e) {
    // Add to the total number of downloaded bytes.
    downloadedByteCount += e.deltaTime;

    // Update the progress bar.
    progressBar.progress = downloadedByteCount / downloadSizeInBytes;
  }

  // Start the task.
  progressBar.start(downloadMoreBytes);
}

// Pretend to download a file.
download(1000);
