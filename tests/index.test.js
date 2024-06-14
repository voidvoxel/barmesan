import ProgressBar from "../dist/index.js";

test(
  "create a progress bar",
  () => {
    const bar = new ProgressBar(
      {
        clearWhenFull: true,
        reuseLine: true,
      }
    );
  }
);

test(
  "update the progress bar",
  () => {
    const bar = new ProgressBar(
      {
        clearWhenFull: true,
        reuseLine: true,
      }
    );

    for (let i = 0; i <= 10; i++) {
      bar.progress = i++ * 0.1;
    }

    expect(bar.progress).toBe(1);
  }
);
