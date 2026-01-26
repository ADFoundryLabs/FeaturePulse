import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="logo">
          <span className="logo-icon">🤖</span>
          FeaturePulse
        </h1>
        <p className="tagline">AI-Powered Pull Request Intent Analysis</p>
      </div>
    </header>
  )
}

export default Header
