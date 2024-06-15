import { ProgressBar } from "../dist/index.js";

// Pseudo download function.
function download(downloadSizeInBytes) {
  // Create a progress bar.
  const progressBar = new ProgressBar();

  // The total number of bytes downloaded.
  let downloadedByteCount = 0;

  let interval;

  // Receive the next set of bytes.
  function downloadMoreBytes(e) {
    // Add to the total number of downloaded bytes.
    downloadedByteCount += 10;

    // Update the progress bar.
    progressBar.progress = downloadedByteCount / downloadSizeInBytes;
  }

  // Clear the interval upon filling.
  progressBar.on(
    "full",
    () => {
      progressBar.clearInterval(interval);

      // HACK: Workaround for issue #1.
      process.exit();
    }
  );

  // Start the task.
  interval = progressBar.interval(downloadMoreBytes, 10);
}

// Pretend to download a file.
download(1000);
