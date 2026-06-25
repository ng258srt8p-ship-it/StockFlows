import { useState, useId } from "react";

/**
 * IosToggle — iOS-style toggle row for settings pages.
 * Renders a full row: colored icon + label + iOS toggle switch.
 * Supports both controlled (value + onChange) and uncontrolled (defaultChecked) modes.
 */
export function IosToggle({
  name,
  label,
  icon,
  iconBg = "#008060",
  value: controlledValue,
  onChange: controlledOnChange,
  defaultChecked = false,
  className = "",
}: {
  name: string;
  label: string;
  icon?: string;
  iconBg?: string;
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
    <div className={`ios-row ${className}`}>
      {icon && (
        <span className="ios-icon" style={{ backgroundColor: iconBg }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {icon}
          </span>
        </span>
      )}
      <label htmlFor={checkboxId} className="ios-row-label cursor-pointer select-none">
        {label}
      </label>
      <label htmlFor={checkboxId} className="ios-toggle cursor-pointer">
        <input
          id={checkboxId}
          type="checkbox"
          name={name}
          checked={on}
          onChange={toggle}
        />
        <span className="ios-toggle-track" />
        <span className="ios-toggle-thumb" />
      </label>
    </div>
  );
}

/** @deprecated Use IosToggle instead */
export const PillToggle = IosToggle;
