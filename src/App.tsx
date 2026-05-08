import { ExternalLink, HeartHandshake, ShieldCheck, Star } from 'lucide-react'

function App() {
  return (
    <main className="app-shell">
      <nav className="topbar" aria-label="Project links">
        <a className="brand" href="/pdf-workbench/" aria-label="PDF Workbench home">
          <ShieldCheck aria-hidden="true" />
          <span>PDF Workbench</span>
        </a>
        <div className="topbar-actions">
          <a href={__REPO_URL__} target="_blank" rel="noreferrer">
            <Star aria-hidden="true" />
            <span>Star on GitHub</span>
            <ExternalLink aria-hidden="true" />
          </a>
          <a href={__PAYPAL_URL__} target="_blank" rel="noreferrer">
            <HeartHandshake aria-hidden="true" />
            <span>Support</span>
            <ExternalLink aria-hidden="true" />
          </a>
        </div>
      </nav>

      <section className="launch-panel" aria-labelledby="launch-title">
        <div>
          <p className="eyebrow">Mode A · pure GitHub Pages · local-first</p>
          <h1 id="launch-title">Acrobat’s daily chores, without the subscription.</h1>
          <p className="lede">
            A browser workbench for PDF editing, OCR, forms, conversion, and local signing. No accounts,
            no document uploads, no runtime backend.
          </p>
        </div>
        <div className="status-panel" aria-label="Build metadata">
          <dl>
            <div>
              <dt>Version</dt>
              <dd>{__APP_VERSION__}</dd>
            </div>
            <div>
              <dt>Build commit</dt>
              <dd>{__COMMIT_SHA__}</dd>
            </div>
            <div>
              <dt>Repository</dt>
              <dd>
                <a href={__REPO_URL__} target="_blank" rel="noreferrer">
                  github.com/baditaflorin/pdf-workbench
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  )
}

export default App
