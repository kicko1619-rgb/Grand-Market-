import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRs-e_X_QJEeZ9o2Uy4ofj5ZrllhmW-iMr2Kile4GxRHo7jFeKAjCAKY6jgthjMrkYAR0WgF615EI89/pub?output=csv";

/* ---------------------------------------------------------
   CSV parser
--------------------------------------------------------- */

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"' && line[i + 1] === '"') {
      current += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());

  return result;
}

/* ---------------------------------------------------------
   APP
--------------------------------------------------------- */

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [screen, setScreen] = useState("home");

  const [form, setForm] = useState({
    name: "",
    price: "",
    image: "",
    description: "",
  });

  const [isAdmin, setIsAdmin] = useState(false);

  /* -------------------------------------------------------
     Load existing Google Sheet products
  ------------------------------------------------------- */

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const response = await fetch(CSV_URL);

      if (!response.ok) {
        throw new Error("Could not load Google Sheet");
      }

      const csvText = await response.text();

      const lines = csvText
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length <= 1) {
        setProducts([]);
        return;
      }

      const items = lines
        .slice(1)
        .map((line) => {
          const cols = parseCSVLine(line);

          return {
            name: cols[0] || "",
            price: cols[1] || "",
            image: cols[2] || "",
            description: cols[3] || "",
          };
        })
        .filter((item) => item.name);

      setProducts(items);
    } catch (error) {
      console.error("Product loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------------------------------
     Form input
  ------------------------------------------------------- */

  function handleInputChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* -------------------------------------------------------
     SUBMIT LISTING
  ------------------------------------------------------- */

  function handleSubmit(event) {
    event.preventDefault();

    /*
      IMPORTANT:

      This currently shows the success screen.

      Firebase will be connected here next.

      Later this will save:

      {
        name: form.name,
        price: form.price,
        image: form.image,
        description: form.description,
        status: "pending"
      }

      Then admin can approve the listing.
    */

    setScreen("success");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* -------------------------------------------------------
     Reset form
  ------------------------------------------------------- */

  function resetForm() {
    setForm({
      name: "",
      price: "",
      image: "",
      description: "",
    });
  }

  /* -------------------------------------------------------
     HOME
  ------------------------------------------------------- */

  function HomeScreen() {
    return (
      <>
        <header>
          <button
            className="logo"
            onClick={() => setScreen("home")}
          >
            🛍️ Grand <span>Market</span>
          </button>

          <nav>
            <button onClick={() => setScreen("home")}>
              Home
            </button>

            <button onClick={() => setScreen("form")}>
              Sell
            </button>
          </nav>

          <button
            className="primary"
            onClick={() => {
              resetForm();
              setScreen("form");
            }}
          >
            + Submit Listing
          </button>
        </header>

        <section className="hero">
          <div>
            <span className="eyebrow">
              YOUR LOCAL MARKETPLACE
            </span>

            <h1>
              Buy.
              <br />
              Sell.
              <br />
              <span>Discover.</span>
            </h1>

            <p>
              Find great products from people around you,
              or list something you no longer need.
            </p>

            <div className="actions">
              <button
                className="primary"
                onClick={() => {
                  resetForm();
                  setScreen("form");
                }}
              >
                + Sell a Product
              </button>

              <button
                className="secondary"
                onClick={() => {
                  document
                    .getElementById("products")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Browse Products
              </button>
            </div>
          </div>

          <div className="hero-card">
            <small>GRAND MARKET</small>

            <b>{products.length}</b>

            <span>Products available</span>

            <i>✦ Buy • Sell • Discover</i>
          </div>
        </section>

        <main
          className="container"
          id="products"
        >
          <div className="head">
            <div>
              <span className="eyebrow">
                EXPLORE
              </span>

              <h2>
                Latest Products
              </h2>
            </div>

            <button
              className="primary small"
              onClick={() => {
                resetForm();
                setScreen("form");
              }}
            >
              + List Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="empty-products">
              <div>✦</div>

              <h3>No products yet</h3>

              <p>
                Be the first person to list a product.
              </p>

              <button
                className="primary"
                onClick={() => {
                  resetForm();
                  setScreen("form");
                }}
              >
                Submit a Listing
              </button>
            </div>
          ) : (
            <div className="grid">
              {products.map((product, index) => (
                <article
                  className="card"
                  key={`${product.name}-${index}`}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-placeholder">
                      ✦
                    </div>
                  )}

                  <div>
                    <h3>{product.name}</h3>

                    <strong>
                      ₹{product.price}
                    </strong>

                    <span>Available</span>

                    <p className="product-description">
                      {product.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        <div className="container">
          <div className="admin-trigger">
            <button
              className="admin-secret"
              aria-label="Admin"
              onClick={() => {
                const count = Number(
                  localStorage.getItem("tapCount") || "0"
                );

                if (count >= 4) {
                  setIsAdmin((value) => !value);
                  localStorage.setItem("tapCount", "0");
                } else {
                  localStorage.setItem(
                    "tapCount",
                    String(count + 1)
                  );
                }
              }}
            >
              •
            </button>
          </div>

          {isAdmin && (
            <div className="admin">
              <div className="admin-head">
                <div>
                  <span className="eyebrow">
                    ADMIN
                  </span>

                  <h1>
                    Product Management
                  </h1>
                </div>
              </div>

              <div className="stats">
                <div>
                  Total Products
                  <b>{products.length}</b>
                </div>

                <div>
                  Pending
                  <b>0</b>
                </div>

                <div>
                  Approved
                  <b>{products.length}</b>
                </div>
              </div>

              <div className="notice">
                <strong>
                  Admin approval system
                </strong>

                <br />

                Firebase approval will be connected here.
                Submitted listings will appear as pending
                listings for admin review.
              </div>

              <a
                href="https://docs.google.com/spreadsheets/d/1-m2Zgl024RLO82TUb0QlqrAS7o7FgtqM9afpzEA31g8/edit"
                target="_blank"
                rel="noopener noreferrer"
                className="primary"
                style={{
                  display: "inline-block",
                  textDecoration: "none",
                  marginTop: "10px",
                }}
              >
                Open Google Sheet
              </a>
            </div>
          )}
        </div>

        <footer>
          <b>🛍️ Grand Market</b>

          <span>
            Buy • Sell • Discover
          </span>

          <button
            onClick={() => {
              resetForm();
              setScreen("form");
            }}
          >
            Submit a Listing
          </button>
        </footer>
      </>
    );
  }

  /* -------------------------------------------------------
     LISTING FORM
  ------------------------------------------------------- */

  function ListingFormScreen() {
    return (
      <div className="listing-form-page">
        <header>
          <button
            className="logo"
            onClick={() => setScreen("home")}
          >
            🛍️ Grand <span>Market</span>
          </button>

          <button
            className="primary"
            onClick={() => setScreen("home")}
          >
            Home
          </button>
        </header>

        <main className="container">
          <section className="form">
            <button
              className="back"
              type="button"
              onClick={() => setScreen("home")}
            >
              ← Back
            </button>

            <span className="eyebrow">
              SELL ON GRAND MARKET
            </span>

            <h1>
              Submit Your
              <br />
              <span style={{ color: "#a78bfa" }}>
                Product.
              </span>
            </h1>

            <p>
              Add your product details below. Your listing
              will be reviewed by an admin before it becomes
              visible on Grand Market.
            </p>

            <form onSubmit={handleSubmit}>
              <label>
                Product Name

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="e.g. iPhone 15 Pro"
                  required
                />
              </label>

              <label>
                Price

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleInputChange}
                  placeholder="45000"
                  min="0"
                  required
                />
              </label>

              <label>
                Product Image URL

                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/product.jpg"
                />
              </label>

              <label>
                Description

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Tell buyers about your product..."
                  rows="6"
                  required
                />
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems: "center",
                  padding: "16px",
                  borderRadius: "13px",
                  border: "1px solid #44346c",
                  background: "#191329",
                }}
              >
                <div
                  style={{
                    minWidth: "36px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#22c55e",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "700",
                  }}
                >
                  ✓
                </div>

                <div>
                  <strong>
                    Admin approval required
                  </strong>

                  <div
                    style={{
                      color: "#9999a8",
                      fontSize: "13px",
                      marginTop: "4px",
                    }}
                  >
                    Your product will be reviewed before
                    becoming visible to other users.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="primary wide submit-listing-button"
                style={{
                  minHeight: "52px",
                  fontSize: "16px",
                }}
              >
                Submit Listing
                <span style={{ marginLeft: "8px" }}>
                  →
                </span>
              </button>
            </form>
          </section>
        </main>
      </div>
    );
  }

  /* -------------------------------------------------------
     SUCCESS SCREEN
  ------------------------------------------------------- */

  function SuccessScreen() {
    return (
      <div className="success-page">
        <header>
          <button
            className="logo"
            onClick={() => setScreen("home")}
          >
            🛍️ Grand <span>Market</span>
          </button>
        </header>

        <main className="container">
          <section className="success-screen modern-success">
            <div className="success-background-glow"></div>

            <div className="animated-success-icon">
              <div className="success-circle">
                <svg
                  viewBox="0 0 52 52"
                  className="success-check"
                >
                  <path
                    d="M14 27 L22 35 L39 17"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="success-pulse pulse-1"></div>
              <div className="success-pulse pulse-2"></div>
            </div>

            <span
              className="eyebrow"
              style={{ color: "#4ade80" }}
            >
              LISTING SUBMITTED
            </span>

            <h1>
              Product Listed
              <br />
              <span
                style={{
                  color: "#a78bfa",
                }}
              >
                Successfully!
              </span>
            </h1>

            <p>
              Your product listing has been submitted
              successfully and is now waiting for admin
              approval.
            </p>

            <div className="success-card">
              <div className="success-status-icon">
                <span></span>
              </div>

              <div>
                <span>
                  STATUS
                </span>

                <b>
                  Waiting for Admin Approval
                </b>

                <small>
                  Your product will appear on Grand Market
                  once the admin approves your listing.
                </small>
              </div>
            </div>

            <div className="success-actions">
              <button
                className="primary"
                onClick={() => {
                  resetForm();
                  setScreen("home");
                }}
              >
                ← Back to Home
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#09090d",
          color: "#f6f6f8",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "15px",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            border: "3px solid #292933",
            borderTopColor: "#8b5cf6",
            borderRadius: "50%",
            animation: "gm-spin .8s linear infinite",
          }}
        />

        <div>
          Loading Grand Market...
        </div>
      </div>
    );
  }

  if (screen === "form") {
    return <ListingFormScreen />;
  }

  if (screen === "success") {
    return <SuccessScreen />;
  }

  return <HomeScreen />;
}

/* ---------------------------------------------------------
   IMPORTANT:
   Your index.html loads main.jsx directly.
   Therefore we MUST render the React application here.
--------------------------------------------------------- */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Grand Market: #root element was not found in index.html."
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
