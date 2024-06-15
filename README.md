# Barmesan

Barmesan is a simple progress bar utility library.

## Features

* [ ] `ProgressBar.render()`
  * [ ] Web
  * [x] Node
  * [ ] Deno
  * [ ] Bun
* [x] `ProgressBar.toString()`

## Installation

```sh
npm i barmesan
```

or

```sh
bun i barmesan
```

## Importing

### Module

```js
import { ProgressBar } from "barmesan";
```

### CommonJS

```js
const { ProgressBar } = require("barmesan");
```

## Usage

### "Direct" method

```js
ProgressBar.progress
```

This method is the most direct and simple, hence the name.

```js
// Create a progress bar.
const progressBar = new ProgressBar();

// Set the progress bar's value.
progressBar.progress = 0.42;
```

### "Step" method

```js
ProgressBar.start(callback)
```

This method allows for a step function to be called repeatedly until the progress bar is full.

```js
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
```

### "Interval" method

```js
ProgressBar.interval(callback, delay)
```

This method allows for an interval callback to be defined, similar to `setInterval()`. The callback method will be called once every `delay` milliseconds. Once the progress bar is full, the interval callback is automatically cleared, similar to `clearInterval()`.

Note: There is currently a bug with the interval method whereby the thread will not close even after the progress bar is full.
For now, it is best to rely on the other methods in production code until this bug is resolved.

```js
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
```
