<brutal-card>
  {children}
</brutal-card>

<style jsx>{`
  .brutalist-card {
    background: var(--color-brutalist-blue) !important;
    border: 4px solid var(--color-brutalist-white);
    box-shadow: var(--shadow-hard);
    padding: 24px;
    border-radius: 0 !important;
    margin-bottom: 32px;
  }

  .brutalist-card:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0px 0px var(--color-brutalist-black);
  }
`}</style>

<div className="brutalist-card">
  {children}
</div>
