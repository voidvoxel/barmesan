import { EventEmitter } from "events";

const DEV_NULL = {
  clearLine: () => {},
  cursorTo: () => {},
  write: () => {}
};

class BackgroundConsoleColor {
  static get blue() {
    return 44;
  }

  static get cyan() {
    return 46;
  }

  static get gray() {
    return BackgroundConsoleColor.grey;
  }

  static get green() {
    return 42;
  }

  static get grey() {
    return 100;
  }

  static get magenta() {
    return 45;
  }

  static get red() {
    return 41;
  }

  static get white() {
    return 47;
  }

  static get yellow() {
    return 43;
  }
}

class ForegroundConsoleColor {
  static get gray() {
    return ForegroundConsoleColor.grey;
  }

  static get green() {
    return 32;
  }

  static get grey() {
    return 90;
  }

  static get magenta() {
    return 35;
  }

  static get red() {
    return 31;
  }

  static get white() {
    return 37;
  }

  static get yellow() {
    return 33;
  }
}

class ConsoleColor {
  static get bg() {
    return BackgroundConsoleColor;
  }

  static get fg() {
    return ForegroundConsoleColor;
  }
}

function colorText(
  string: string,
  consoleColor: number
) {
  return `\x1b[${consoleColor}m${string}\x1b[0m`;
}

const DEFAULT_SIZE = 50;

function colorBarSegment(
  string: string,
  percentage: number,
  empty: boolean
) {
  if (empty) return colorText(string, ConsoleColor.bg.gray);
  if (percentage >= 1.0) return colorText(string, ConsoleColor.bg.cyan);
  else if (percentage >= 0.89) return colorText(string, ConsoleColor.bg.green);
  else if (percentage >= 0.6) return colorText(string, ConsoleColor.bg.yellow);

  return colorText(string, ConsoleColor.bg.red);
}

export interface IProgressBarOptions {
  colorMode: boolean,
  max: number,
  min: number,
  size: number
}

export class ProgressBar extends EventEmitter {
  private _isColorModeEnabled: boolean;
  private _min: number;
  private _max: number;
  private _previousString: string;
  private _progress: number;
  private _size: number;

  public static string(
    min: number,
    max: number,
    progress: number | undefined = undefined
  ) {
    if (!progress) progress = min;

    const progressBar = new ProgressBar( { min, max } );

    progressBar.progress = progress;

    return progressBar.toString();
  }

  constructor(
    options?: Partial<IProgressBarOptions>
  ) {
    super();

    options ??= {};

    if (options.min && (!options.max || options.max <= options.min)) throw new RangeError(`If \`options.min\` is set, then \`options.max\` must be a number greater than \`options.min\`.`);

    const isColorModeEnabled = options.colorMode ??= true;
    const size = options.size ??= DEFAULT_SIZE;
    const max = options.max ??= 1;
    const min = options.min ??= 0;

    this._min = min;
    this._max = max;
    this._size = size;
    this._isColorModeEnabled = isColorModeEnabled;

    this._progress = 0.0;
    this._previousString = "";
  }

  public get max() {
    return this._max;
  }

  private set max(
    value: number
  ) {
    this._max = value;
  }

  public get min() {
    return this._min;
  }

  private set min(
    value: number
  ) {
    this._min = value;
  }

  public get percentage() {
    return (this.progress - this.min) / (this.max - this.min);
  }

  public get progress() {
    return this._progress;
  }

  public set progress(
    value: number
  ) {
    this.update(value);
  }

  public get size() {
    return this._size;
  }

  start(
    callback: (progressBar: ProgressBar) => number
  ): Promise<ProgressBar> {
    return new Promise(
      (resolve, reject) => {
        const interval = setInterval(
          () => {
            const value = callback(this);

            this.update(value);

            if (this.progress >= this.max) {
              clearInterval(interval);

              resolve(this);

              return;
            }
          }
        );
      }
    )
  }

  toString() {
    let string = "";

    const segments = {
      empty: " ",
      full: " "
    };

    if (this._isColorModeEnabled) {
      segments.full = colorBarSegment(segments.empty, this.percentage, false);
      segments.empty = colorBarSegment(segments.empty, this.percentage, true);
    }

    let i = 0;

    const segmentCount = Math.round(this.percentage * this.size);

    for (
      ;
      i < segmentCount;
      i++
    ) {
      string += segments.full;
    }

    while (i < this.size) {
      string += segments.empty;

      i++;
    }

    if (this._isColorModeEnabled) return string;

    return `|${string}|`;
  }

  update(
    value: number
  ) {
    const previousProgress = this.progress;

    this._progress = value;

    /* Emit events. */
    if (this.progress >= this.max) this.emit("finish", this);

    if (this.toString() === this._previousString) {
      this.emit("idle", this);
    } else {
      if (this.progress > previousProgress) {
        this._update$write(this.progress, previousProgress);

        this.emit("increase", this);
      }
      if (this.progress < previousProgress) this.emit("decrease", this);
    }

    this._previousString = this.toString();

    return this;
  }

  private _update$write(
    progress: number,
    previousProgress: number
  ) {
    if (progress <= previousProgress) return;

    const stdout: NodeJS.WriteStream = globalThis.process ? process.stdout : DEV_NULL as unknown as NodeJS.WriteStream;

    stdout.clearLine(0);
    stdout.cursorTo(0);
    stdout.write(this.toString());
  }
}

export default ProgressBar;
