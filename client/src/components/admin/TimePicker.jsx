/**
 * TimePicker.jsx  (Part 4 Prompt 03)
 *
 * Custom HH : MM : SS time input component.
 * Three separate number inputs NOT a date picker or native time input.
 *
 * Props:
 *   hours    {number}   current hours value
 *   minutes  {number}   current minutes value
 *   seconds  {number}   current seconds value
 *   onChange {function} called with ({ hours, minutes, seconds }) on change
 *   error    {string}   optional validation error message
 */

export default function TimePicker({ hours = 0, minutes = 0, seconds = 0, onChange, error }) {

  function clamp(val, min, max) {
    const n = parseInt(val, 10);
    if (isNaN(n)) return min;
    return Math.min(Math.max(n, min), max);
  }

  function handleHours(e) {
    onChange({ hours: clamp(e.target.value, 0, 23), minutes, seconds });
  }

  function handleMinutes(e) {
    onChange({ hours, minutes: clamp(e.target.value, 0, 59), seconds });
  }

  function handleSeconds(e) {
    onChange({ hours, minutes, seconds: clamp(e.target.value, 0, 59) });
  }

  const inputClass =
    "w-16 text-center bg-bg border rounded-lg px-2 py-2.5 text-black text-lg font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors " +
    (error ? "border-danger/60" : "border-border hover:border-txt-muted");

  return (
    <div>
      <div className="flex items-center gap-2">
        {/* Hours */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            max="23"
            value={String(hours).padStart(2, "0")}
            onChange={handleHours}
            className={inputClass}
            aria-label="Hours"
          />
          <span className="text-xs text-txt-muted">Hours</span>
        </div>

        <span className="text-txt-secondary text-2xl font-bold mb-4">:</span>

        {/* Minutes */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            max="59"
            value={String(minutes).padStart(2, "0")}
            onChange={handleMinutes}
            className={inputClass}
            aria-label="Minutes"
          />
          <span className="text-xs text-txt-muted">Minutes</span>
        </div>

        <span className="text-txt-secondary text-2xl font-bold mb-4">:</span>

        {/* Seconds */}
        <div className="flex flex-col items-center gap-1">
          <input
            type="number"
            min="0"
            max="59"
            value={String(seconds).padStart(2, "0")}
            onChange={handleSeconds}
            className={inputClass}
            aria-label="Seconds"
          />
          <span className="text-xs text-txt-muted">Seconds</span>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs text-danger flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
