import ProgressBar from "../dist/progress-bar.js";

test(
  "create a progress bar",
  () => {
    const bar = new ProgressBar( { min: 0, max: 1 } );
  }
);

test(
  "update the progress bar",
  () => {
    const bar = new ProgressBar( { min: 0, max: 1 } );

    for (let i = 0; i <= 10; i++) {
      bar.progress = i++ * 0.1;
    }

    expect(bar.progress).toBe(1);
  }
);
