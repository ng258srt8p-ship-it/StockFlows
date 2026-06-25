import { useState, useId } from "react";

/**
 * PillToggle — a compact, pill-shaped toggle button for on/off settings.
 * Supports both controlled (value + onChange) and uncontrolled (defaultChecked) modes.
 *
 * Uses the existing theme colors: --color-success (#008060) when ON,
 * Tailwind grays when OFF.
 */
export function PillToggle({
  name,
  label,
  icon,
  value: controlledValue,
  onChange: controlledOnChange,
  defaultChecked = false,
  className = "",
}: {
  name: string;
  label: string;
  icon?: string;
  /** Controlled: current on/off state */
  value?: boolean;
  /** Controlled: called with new boolean on toggle */
  onChange?: (next: boolean) => void;
  /** Uncontrolled: initial state */
  defaultChecked?: boolean;
  className?: string;
}) {
  const [internalOn, setInternalOn] = useState(defaultChecked);
  const checkboxId = useId();

  // Controlled takes priority; fall back to internal state
  const on = controlledValue !== undefined ? controlledValue : internalOn;

  function toggle() {
    const next = !on;
    if (controlledOnChange) {
      controlledOnChange(next);
    } else {
      setInternalOn(next);
    }
  }

  return (
    <div className={`flex items-stretch gap-3 ${className}`}>
      {/* The pill — acts as the visible toggle */}
      <label
        htmlFor={checkboxId}
        className={`
          flex items-center gap-3 px-4 py-3 rounded-full cursor-pointer
          transition-all duration-200 ease-in-out select-none
          ${
            on
              ? "bg-success text-white shadow-sm"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }
        `}
      >
        {/* Hidden checkbox — drives form submission */}
        <input
          id={checkboxId}
          type="checkbox"
          name={name}
          checked={on}
          onChange={toggle}
          className="sr-only"
        />

        {icon && (
          <span
            className={`material-symbols-outlined ${on ? "text-white" : "text-gray-400"}`}
            style={{ fontSize: 18 }}
          >
            {icon}
          </span>
        )}

        <span className="text-sm font-medium whitespace-nowrap">{label}</span>

        {/* ON/OFF badge */}
        <span
          className={`
            text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
            transition-colors duration-200
            ${on ? "bg-white/20 text-white" : "bg-gray-200 text-gray-400"}
          `}
        >
          {on ? "ON" : "OFF"}
        </span>
      </label>
    </div>
  );
}
