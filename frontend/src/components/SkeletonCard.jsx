export default function SkeletonCard() {
  return (
    <div className="skeleton-card" style={{ animation: 'shimmer 2s infinite' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div className="skeleton-line" style={{ width: '66%', height: '12px' }}></div>
          <div className="skeleton-line" style={{ width: '48px', height: '12px' }}></div>
        </div>
        <div className="skeleton-line" style={{ width: '100%', height: '10px', marginBottom: '0.25rem' }}></div>
        <div className="skeleton-line" style={{ width: '80%', height: '10px' }}></div>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div className="skeleton-line" style={{ width: '64px', height: '12px', borderRadius: '50%' }}></div>
        <div className="skeleton-line" style={{ width: '48px', height: '12px', borderRadius: '50%' }}></div>
        <div className="skeleton-line" style={{ width: '80px', height: '12px', borderRadius: '50%' }}></div>
      </div>

      {/* AI Summary box */}
      <div style={{ flex: 1, marginBottom: '1rem' }}>
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '1rem' }}>
          <div className="skeleton-line" style={{ width: '80px', height: '10px', marginBottom: '0.75rem' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '10px', marginBottom: '0.5rem' }}></div>
          <div className="skeleton-line" style={{ width: '100%', height: '10px', marginBottom: '0.5rem' }}></div>
          <div className="skeleton-line" style={{ width: '75%', height: '10px' }}></div>
        </div>
      </div>

      {/* Topics */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <div className="skeleton-line" style={{ width: '56px', height: '12px', borderRadius: '50%' }}></div>
        <div className="skeleton-line" style={{ width: '72px', height: '12px', borderRadius: '50%' }}></div>
        <div className="skeleton-line" style={{ width: '48px', height: '12px', borderRadius: '50%' }}></div>
      </div>

      {/* Footer buttons */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div className="skeleton-line" style={{ flex: 1, height: '36px' }}></div>
        <div className="skeleton-line" style={{ width: '36px', height: '36px' }}></div>
        <div className="skeleton-line" style={{ width: '36px', height: '36px' }}></div>
      </div>
    </div>
  );
}
