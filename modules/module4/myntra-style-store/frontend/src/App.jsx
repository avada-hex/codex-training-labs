import { useEffect, useMemo, useState } from "react";
import "./App.css";

const navLinks = [
  { label: "Collections", href: "#collections" },
  { label: "Architecture", href: "#architecture" },
  { label: "Product Stories", href: "#stories" },
  { label: "Docs", href: "#docs" },
];

const architecturePillars = [
  {
    title: "React + Vite",
    detail: "Client-side rendering, CSS modules, and fast HMR for iterative styling.",
  },
  {
    title: "Express API",
    detail: "Lightweight catalog service with curated responses, price formatting, and CORS-safe headers.",
  },
  {
    title: "Performance",
    detail: "Static assets served via Vite dev server or production build with gzip-friendly bundles.",
  },
];

function ProductCard({ product }) {
  return (
    <article className="product-card">
      <div className="product-badge">{product.badge}</div>
      <div className="product-image" aria-hidden="true"></div>
      <div className="product-body">
        <div className="product-heading">
          <h3>{product.name}</h3>
          <span className="product-price">{product.priceFormatted}</span>
        </div>
        <p>{product.description}</p>
        <div className="product-meta">
          <span className="chip">{product.category}</span>
          <span className="chip subtle">{product.delivery}</span>
        </div>
      </div>
    </article>
  );
}

function App() {
  const [products, setProducts] = useState([]);
  const [banner, setBanner] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("http://localhost:5174/api/products");
        if (!res.ok) throw new Error("Catalog service unavailable");
        const data = await res.json();
        setBanner(data.banner);
        setProducts(data.curated);
        setStatus("ready");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    }
    fetchCatalog();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).slice(0, 4),
    [products],
  );

  return (
    <div className="app-shell">
      <header className="main-header">
        <div className="logo">Bazaar India</div>
        <nav>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <button className="primary-btn">Login · Explore</button>
      </header>

      <main>
        <section className="hero" id="collections">
          <div className="hero-content">
            <p className="eyebrow">Inspired by Myntra · Built for India</p>
            <h1>
              Curated festival drops, local craftsmanship, and fast delivery
              signals for every city.
            </h1>
            <p className="hero-description">
              React components fetch the catalog from a Node/Express API, apply
              formatting logic server-side, and render generous cards built with
              responsive grids and accessible buttons.
            </p>
            <div className="hero-actions">
              <button className="primary-btn">View Festive Drop</button>
              <button className="ghost-btn">Inspect Architecture</button>
            </div>
            <div className="hero-highlights">
              <span>{banner}</span>
              <span>Cash on Delivery | Metro same-day</span>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-card">
              <p className="small">Status</p>
              <strong>
                {status === "loading"
                  ? "Loading catalog..."
                  : status === "error"
                  ? "Catalog unreachable"
                  : `${products.length} curated picks`}
              </strong>
              <p className="small">
                Fetches from http://localhost:5174/api/products
              </p>
            </div>
          </div>
        </section>

        <section className="category-panel">
          <h2>Live categories</h2>
          <div className="category-grid">
            {(categories.length ? categories : ["Ethnic", "Western", "Gadgets", "Beauty"]).map(
              (category) => (
                <article key={category}>
                  <h3>{category}</h3>
                  <p>Rich, curated feeds with server-groomed pricing.</p>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="products-section">
          <div className="products-header">
            <div>
              <h2>Product spotlight</h2>
              <p>Backend returns formatted prices and delivery commitments.</p>
            </div>
            <div className="status-pill">
              {status === "ready"
                ? `Serving ${products.length} unique SKUs`
                : "Waiting for catalog"}
            </div>
          </div>
          {status === "error" && (
            <p className="status-text">Please start the backend (`npm start`).</p>
          )}
          <div className="product-grid" id="stories">
            {status === "loading" && <div className="status-text">Loading products…</div>}
            {status === "ready" && products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="tech-section" id="architecture">
          <h2>System map & telemetry</h2>
          <p className="hero-description">
            Leverage this layout to document front-end hierarchy, backend APIs,
            and how they integrate with observability pipelines in larger
            repositories.
          </p>
          <div className="tech-grid">
            {architecturePillars.map((pillar) => (
              <article key={pillar.title}>
                <h3>{pillar.title}</h3>
                <p>{pillar.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="main-footer" id="docs">
        <div>
          <h4>Docs</h4>
          <p>Check `/frontend/src/App.jsx`, `/backend/index.js`, and this folder&apos;s README.</p>
        </div>
        <div>
          <h4>Next steps</h4>
          <p>Run `npm run dev` (frontend) while `npm start` powers the API, then load `http://localhost:5173`.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <p>Mentor notes live under `modules/module4/top-up-ideas/docs`.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
