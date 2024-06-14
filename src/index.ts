import { EventEmitter } from "events";

const DEV_NULL = {
  clearLine: () => {},
  cursorTo: () => {},
  write: () => {}
};

type ColorBlindnessMode = "" | "none" | "r" | "red" | "g" | "green" | "b" | "blue";

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
  thresholds: IProgressBarThresholds,
  empty: boolean = false,
  colorBlindnessMode?: ColorBlindnessMode,
) {
  colorBlindnessMode ??= "";

  colorBlindnessMode = colorBlindnessMode.toLowerCase() as ColorBlindnessMode;

  let coolTone = ConsoleColor.bg.green;

  if (colorBlindnessMode.startsWith("r")) coolTone = ConsoleColor.bg.magenta;

  // Empty
  if (empty) return colorText(string, ConsoleColor.bg.gray);
  // Hot
  if (percentage >= thresholds.hot) return colorText(string, ConsoleColor.bg.red);
  // Warm
  else if (percentage >= thresholds.warm) return colorText(string, ConsoleColor.bg.yellow);
  // Cool
  else if (percentage >= thresholds.cool) return colorText(string, coolTone);
  // Cold
  return colorText(string, ConsoleColor.bg.cyan);
}

export interface IProgressBarThresholds {
  cool: number;
  hot: number;
  warm: number;
}

export interface IProgressBarOptions {
  colorBlindnessMode: ColorBlindnessMode;
  clearWhenFull: boolean;
  colorMode: boolean;
  max: number;
  min: number;
  reuseLine: boolean;
  size: number;
  thresholds: IProgressBarThresholds;
}

interface IIntervals {
  [index: number]: NodeJS.Timeout;
}

interface IPreviousIntervalTimes {
  [index: number]: number;
}

interface IProgressBarStepEvent {
  deltaTime: number;
  elapsedTime: number;
  progressBar: ProgressBar;
}

interface IProgressBarIntervalEvent extends IProgressBarStepEvent {
  interval: NodeJS.Timeout;
  intervalId: number;
}

type ProgressBarStartCallback = (e: IProgressBarStepEvent) => unknown;
type ProgressBarIntervalCallback = (e: IProgressBarIntervalEvent) => unknown;

export class ProgressBar extends EventEmitter {
  private _colorBlindnessMode: ColorBlindnessMode;
  private _clearWhenFull: boolean;
  private _intervals: IIntervals;
  private _previousIntervalTimes: IPreviousIntervalTimes;
  private _isColorModeEnabled: boolean;
  private _min: number;
  private _max: number;
  private _previousString: string;
  private _progress: number;
  private _reuseLine: boolean;
  private _size: number;
  private _thresholds: IProgressBarThresholds;

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

    const colorBlindnessMode = options.colorBlindnessMode ??= "";
    const isColorModeEnabled = options.colorMode ??= true;
    const size = options.size ??= DEFAULT_SIZE;
    const max = options.max ??= 1;
    const min = options.min ??= 0;
    const reuseLine = options.reuseLine ??= false;
    const shouldClearLine = options.clearWhenFull ??= true;
    const thresholds = options.thresholds ??= {
      cool: 0.25,
      warm: 0.5,
      hot: 0.75
    };

    this._min = min;
    this._max = max;
    this._reuseLine = reuseLine;
    this._clearWhenFull = shouldClearLine;
    this._colorBlindnessMode = colorBlindnessMode;
    this._size = size;
    this._isColorModeEnabled = isColorModeEnabled;
    this._thresholds = thresholds;

    this._intervals = {};
    this._previousIntervalTimes = {};
    this._progress = 0.0;
    this._previousString = "";

    this.once(
      "full",
      () => {
        for (let intervalId in this.intervals) this.clearInterval(parseInt(intervalId));
      }
    );
  }

  public get colorBlindnessMode() {
    return this._colorBlindnessMode;
  }

  public set colorBlindnessMode(
    value: ColorBlindnessMode
  ) {
    this._colorBlindnessMode;
  }

  private get intervals() {
    return this._intervals;
  }

  private set intervals(
    value: IIntervals
  ) {
    this.intervals = value;
  }

  private get previousIntervalTimes() {
    return this._previousIntervalTimes;
  }

  private set previousIntervalTimes(
    value: IPreviousIntervalTimes
  ) {
    this._previousIntervalTimes = value;
  }

  public get removeWhenFull() {
    return this._clearWhenFull;
  }

  private set removeWhenFull(
    value: boolean
  ) {
    this._clearWhenFull = value;
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

  public get reuseLine() {
    return this._reuseLine;
  }

  private set reuseLine(
    value: boolean
  ) {
    this._reuseLine = value;
  }

  public get size() {
    return this._size;
  }

  public get thresholds() {
    return this._thresholds;
  }

  public interval(
    callback: ProgressBarIntervalCallback,
    delay: number = 100
  ) {
    const intervalId = Math.round(Math.random() * 0xFFFFFFFF);

    let elapsedTime = 0;

    const interval = setInterval(
      () => {
        const now = Date.now();
        const previousTime = this.previousIntervalTimes[intervalId];

        const deltaTime = (now - previousTime) || 0;

        elapsedTime += deltaTime;

        const e: IProgressBarIntervalEvent = {
          deltaTime,
          elapsedTime,
          interval,
          intervalId,
          progressBar: this
        };

        this.previousIntervalTimes[intervalId] = Date.now();

        callback(e);
      },
      delay
    );

    this.once("full", () => this.clearInterval(intervalId));

    return intervalId;
  }

  public clearInterval(
    intervalId: number
  ) {
    const interval = this.intervals[intervalId];

    clearInterval(interval);

    delete this.intervals[intervalId];
  }

  public async start(
    callback: ProgressBarStartCallback
  ) {
    return new Promise(
      resolve => {
        let elapsedTime = 0;
        let previousTime = Date.now();

        while (this.progress <= this.max) {
          const now = Date.now();

          const deltaTime = (now - previousTime) || 0;

          elapsedTime += deltaTime;

          const e: IProgressBarStepEvent = {
            deltaTime,
            elapsedTime,
            progressBar: this
          };

          callback(e);

          previousTime = now;
        }

        resolve(elapsedTime);
      }
    )
  }

  public override toString() {
    let string = "";

    const segments = {
      empty: " ",
      full: " "
    };

    if (this._isColorModeEnabled) {
      segments.full = colorBarSegment(segments.empty, this.percentage, this.thresholds, false, this.colorBlindnessMode);
      segments.empty = colorBarSegment(segments.empty, this.percentage, this.thresholds, true, this.colorBlindnessMode);
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

  public update(
    value: number
  ) {
    const previousProgress = this.progress;

    this._progress = value;

    /* Emit events. */
    if (this.progress <= 0) this.emit("empty", this);
    if (this.progress >= this.max) {
      if (this.removeWhenFull) this._clearLine();

      if (!this.reuseLine) {
        this._newLine();
      }

      this.emit("full", this);

      return;
    }

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

  private _clearLine(
    value: string = ""
  ) {
    const stdout: NodeJS.WriteStream = globalThis.process ? process.stdout : DEV_NULL as unknown as NodeJS.WriteStream;

    stdout.clearLine(0);
    stdout.cursorTo(0);

    stdout.write(value);
  }

  private _newLine() {
    console.log();

    this._clearLine();
  }

  private _update$write(
    progress: number,
    previousProgress: number
  ) {
    if (progress <= previousProgress) return;

    const stdout: NodeJS.WriteStream = globalThis.process ? process.stdout : DEV_NULL as unknown as NodeJS.WriteStream;

    this._clearLine(this.toString());
  }
}

export default ProgressBar;
