import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Store,
  Truck,
  TrendingUp,
  ArrowRight,
  Menu,
  X,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import "./HomePage.css";
import logo from "../assets/icons/logo.png";
import heroImage from "../assets/images/1.jpg";
import feature1Image from "../assets/images/2.jpg";
import feature2Image from "../assets/images/3.jpg";
import feature3Image from "../assets/images/4.jpg";

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [feature1Loaded, setFeature1Loaded] = useState(false);
  const [feature2Loaded, setFeature2Loaded] = useState(false);
  const [feature3Loaded, setFeature3Loaded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userTypes = [
    {
      title: "Become a seller",
      description: "Launch your online boutique and reach thousands of customers across the platform",
      icon: <Store size={40} strokeWidth={1.5} />,
      features: [
        "Easy store setup & management",
        "Low commission rates",
        "Marketing & analytics tools",
        "Secure payment processing",
      ],
      route: "/become-boutique",
      cta: "Start selling",
    },
    {
      title: "Become a driver",
      description: "Join our delivery network and earn money on your own schedule with flexible opportunities",
      icon: <Truck size={40} strokeWidth={1.5} />,
      features: [
        "Flexible working hours",
        "Competitive earnings",
        "Weekly payouts",
        "Insurance coverage",
      ],
      route: "/become-driver",
      cta: "Start driving",
    },
  ];

  return (
    <div className="homepage">
      {/* Shopify-style Navigation */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container">
          <div className="nav-content">
            <div className="logo" onClick={() => navigate("/")}>
              <img src={logo} alt="Mallify Logo" className="logo-image" />
              <span className="logo-text">Mallify</span>
            </div>
            <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
              <a href="#features">Solutions</a>
              <a href="#pricing">Pricing</a>
              <a href="#resources">Resources</a>
              <button className="btn-secondary" onClick={() => window.location.href = 'http://192.168.56.1:3001/StoreOwner-SignIn'}>
                Log in
              </button>
              <button className="btn-primary" onClick={() => window.location.href = 'http://192.168.56.1:3001/StoreOwner-SignIn'}>
                Start for free 
              </button>
            </div>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Shopify-style Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text-center">
              <h1 className="hero-title">
                The platform built for commerce—from side hustle to global brand
              </h1>
              <p className="hero-description">
                Start, run, and grow your business with the leading all-in-one marketplace platform. Join thousands of entrepreneurs building their future.
              </p>
              <div className="hero-cta">
                <div className="cta-input-group">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="email-input"
                  />
                  <button className="btn-primary btn-large">
                    Start free trial
                  </button>
                </div>
                <p className="cta-subtext">
                  Try Mallify free for 14 days, no credit card required.
                </p>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="hero-image-container">
              {!imageLoaded && (
                <div className="hero-image-skeleton">
                  <div className="skeleton-shimmer"></div>
                </div>
              )}
              <img 
                src={heroImage} 
                alt="Shopping experience" 
                className={`hero-image ${imageLoaded ? 'loaded' : 'loading'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
                loading="lazy"
              />
            </div>
          </div>
          
          {/* Trust Bar */}
          <div className="trust-bar">
            <p className="trust-text">Trusted by ambitious vendors worldwide</p>
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-number">10,000+</div>
                <div className="stat-label">Active stores</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">500K+</div>
                <div className="stat-label">Happy customers</div>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <div className="stat-number">1M+</div>
                <div className="stat-label">Products sold</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopify-style Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header-centered">
            <h2>Everything you need to sell everywhere</h2>
            <p>All the sales channels, marketing tools, and analytics you need—in one platform.</p>
          </div>
          
          <div className="features-showcase">
            {/* Feature 1 - Split Layout */}
            <div className="feature-row">
              <div className="feature-content">
                <div className="feature-label">SELL</div>
                <h3>Reach millions of shoppers and boost sales</h3>
                <p>Set up your online store in minutes. Accept payments online, manage inventory, and fulfill orders—all from a single dashboard.</p>
                <ul className="feature-list">
                  <li><span className="check-icon">✓</span> Multi-vendor marketplace</li>
                  <li><span className="check-icon">✓</span> Secure payment processing</li>
                  <li><span className="check-icon">✓</span> Inventory management</li>
                  <li><span className="check-icon">✓</span> Real-time analytics</li>
                </ul>
                <button className="btn-link">
                  Explore selling tools <ArrowRight size={18} />
                </button>
              </div>
              <div className="feature-visual">
                {!feature1Loaded && (
                  <div className="feature-image-skeleton">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img 
                  src={feature1Image} 
                  alt="Online store dashboard" 
                  className={`feature-image ${feature1Loaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setFeature1Loaded(true)}
                  onError={() => setFeature1Loaded(true)}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 2 - Split Layout Reversed */}
            <div className="feature-row feature-row-reverse">
              <div className="feature-content">
                <div className="feature-label">DELIVER</div>
                <h3>Fast, reliable delivery powered by our network</h3>
                <p>Connect with verified drivers and provide your customers with tracking, fast shipping, and exceptional service.</p>
                <ul className="feature-list">
                  <li><span className="check-icon">✓</span> Real-time tracking</li>
                  <li><span className="check-icon">✓</span> Flexible delivery options</li>
                  <li><span className="check-icon">✓</span> Professional drivers</li>
                  <li><span className="check-icon">✓</span> Automated notifications</li>
                </ul>
                <button className="btn-link">
                  Learn about delivery <ArrowRight size={18} />
                </button>
              </div>
              <div className="feature-visual">
                {!feature2Loaded && (
                  <div className="feature-image-skeleton">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img 
                  src={feature2Image} 
                  alt="Delivery truck" 
                  className={`feature-image ${feature2Loaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setFeature2Loaded(true)}
                  onError={() => setFeature2Loaded(true)}
                  loading="lazy"
                />
              </div>
            </div>

            {/* Feature 3 - Split Layout */}
            <div className="feature-row">
              <div className="feature-content">
                <div className="feature-label">GROW</div>
                <h3>Marketing tools that work as hard as you do</h3>
                <p>Build your brand with built-in SEO, email marketing, and social media integration. Track what's working with detailed analytics.</p>
                <ul className="feature-list">
                  <li><span className="check-icon">✓</span> Customer insights</li>
                  <li><span className="check-icon">✓</span> Automated marketing</li>
                  <li><span className="check-icon">✓</span> Review management</li>
                  <li><span className="check-icon">✓</span> Promotional campaigns</li>
                </ul>
                <button className="btn-link">
                  Discover marketing tools <ArrowRight size={18} />
                </button>
              </div>
              <div className="feature-visual">
                {!feature3Loaded && (
                  <div className="feature-image-skeleton">
                    <div className="skeleton-shimmer"></div>
                  </div>
                )}
                <img 
                  src={feature3Image} 
                  alt="Analytics dashboard" 
                  className={`feature-image ${feature3Loaded ? 'loaded' : 'loading'}`}
                  onLoad={() => setFeature3Loaded(true)}
                  onError={() => setFeature3Loaded(true)}
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopify-style Join Section */}
      <section id="join" className="join-section">
        <div className="container">
          <div className="section-header-centered">
            <h2>Start selling today</h2>
            <p>Whether you're launching a brand or earning extra income—we've got you covered</p>
          </div>
          <div className="user-types-grid">
            {userTypes.map((type, index) => (
              <div key={index} className="user-type-card">
                <div className="user-type-icon-wrapper">
                  <div className="user-type-icon">
                    {type.icon}
                  </div>
                </div>
                <h3>{type.title}</h3>
                <p>{type.description}</p>
                <ul className="benefits-list">
                  {type.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
                <button
                  className="btn-primary"
                  onClick={() => navigate(type.route)}
                >
                  {type.cta} <ArrowRight size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Ready to make your first sale?</h2>
              <p>
                Try Mallify free for 14 days, explore all the tools and services you need to start, run, and grow your business.
              </p>
            </div>
            <div className="cta-buttons">
              <button className="btn-primary btn-large" onClick={() => window.location.href = 'http://192.168.56.1:3001/StoreOwner-SignIn'}>
                Start free trial <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <div className="footer-logo">
                <span className="logo-text">Mallify</span>
              </div>
              <p>
                Your ultimate shopping destination. Connecting buyers, sellers,
                and drivers in one seamless platform.
              </p>
              <div className="social-links">
                <a href="#" className="social-icon">
                  <Facebook size={20} />
                </a>
                <a href="#" className="social-icon">
                  <Twitter size={20} />
                </a>
                <a href="#" className="social-icon">
                  <Instagram size={20} />
                </a>
                <a href="#" className="social-icon">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h4>PRODUCTS</h4>
              <ul className="footer-links">
                <li><a href="#">Start selling</a></li>
                <li><a href="#">Online store</a></li>
                <li><a href="#">Mobile app</a></li>
                <li><a href="#">Delivery network</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>COMPANY</h4>
              <ul className="footer-links">
                <li><a href="#">About</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press & Media</a></li>
                <li><a href="#">Partners</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>SUPPORT</h4>
              <ul className="footer-links">
                <li><a href="#">Help center</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Mallify. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
