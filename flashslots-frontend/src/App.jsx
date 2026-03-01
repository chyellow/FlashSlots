import './App.css'

function App() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 32 }}>
      <h1 style={{ marginBottom: 8 }}>FlashSlots</h1>
      <h2 style={{ marginTop: 0, color: "#666" }}>Alpha Release</h2>

      <p style={{ maxWidth: 640 }}>
        FlashSlots is a real-time marketplace for last-minute service openings.
        This alpha release demonstrates the foundational frontend
        infrastructure for the product.
      </p>

      <div
        style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid #ddd",
          borderRadius: 12,
          maxWidth: 420,
        }}
      >
        <h3 style={{ marginTop: 0 }}>System Status</h3>
        <p>Frontend: Running ✅</p>
        <p>Backend: Not connected (coming soon)</p>
      </div>
    </div>
  );
}

export default App;
