<brutal-input-row
  name={name}
  label={label}
  value={value}
  onChange={onChange}
  suffix={suffix}
/>

<style jsx>{`
  .brutalist-input-row-container {
    display: flex;
    flex-direction: column;
    padding: 16px;
    border: 3px solid var(--color-brutalist-black);
    background: var(--color-brutalist-white);
    box-shadow: var(--shadow-hard);
    margin-bottom: 12px;
  }

  .brutalist-input-row-label {
    font-weight: 900;
    text-transform: uppercase;
    font-size: 0.75rem;
    margin-bottom: 8px;
    color: var(--color-brutalist-black);
  }

  .brutalist-input-field {
    width: 100%;
    padding: 12px;
    border: 3px solid var(--color-brutalist-black);
    background: transparent;
    font-weight: bold;
    font-size: 1.25rem;
    outline: none;
  }

  .brutalist-input-field:focus {
    background: var(--color-brutalist-magenta);
  }

  .brutalist-input-row-suffix {
    font-weight: bold;
    margin-left: 8px;
  }

  .brutalist-input-row-container:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--color-brutalist-black);
  }
`}</style>

<div className="brutalist-input-row-container">
  <label className="brutalist-input-row-label">{label}</label>
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <input
      name={name}
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="brutalist-input-field"
    />
    {suffix && <span className="brutalist-input-row-suffix">{suffix}</span>}
  </div>
</div>
