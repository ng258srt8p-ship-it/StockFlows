<brutalist-toggle
  name={name}
  label={label}
  checked={checked}
  onChange={onChange}
  icon={icon}
  iconBg={iconBg}
/>

<style jsx>{`
  .brutalist-toggle-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border: 3px solid var(--color-brutalist-black);
    background: var(--color-brutalist-white);
    box-shadow: var(--shadow-hard);
    margin-bottom: 12px;
  }

  .brutalist-toggle-label {
    font-weight: 900;
    text-transform: uppercase;
    font-size: 0.875rem;
  }

  .brutalist-switch {
    position: relative;
    width: 60px;
    height: 32px;
    background: var(--color-brutalist-black);
    border: 3px solid var(--color-brutalist-black);
    border-radius: 0;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .brutalist-switch::before {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    width: 24px;
    height: 24px;
    background: var(--color-brutalist-white);
    border: 2px solid var(--color-brutalist-black);
    transition: all 0.1s ease;
  }

  .brutalist-switch.active {
    background: var(--color-brutalist-magenta);
  }

  .brutalist-switch.active::before {
    left: 32px;
  }

  .brutalist-toggle-container:active .brutalist-switch {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--color-brutalist-black);
  }
`}</style>

<div className="brutalist-toggle-container">
  <div className="brutalist-toggle-label">{label}</div>
  <div
    className={`brutalist-switch ${checked ? 'active' : ''}`}
    onClick={onChange}
  />
</div>
