import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Store,
  Truck,
  Shield,
  Zap,
  Users,
  TrendingUp,
  Heart,
  Star,
  ArrowRight,
  Menu,
  X,
  Search,
  Tag,
  Clock,
  Award,
  ChevronRight,
  Sparkles,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import "./HomePage.css";
import mallifyLogo from "../assets/icons/mallify.png";

const HomePage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Store size={32} />,
      title: "Multi-Vendor Marketplace",
      description:
        "Discover thousands of boutiques and brands all in one place",
    },
    {
      icon: <Truck size={32} />,
      title: "Fast Delivery",
      description: "Real-time tracking with our fleet of dedicated drivers",
    },
    {
      icon: <Shield size={32} />,
      title: "Secure Payments",
      description: "Multiple payment options with bank-level security",
    },
    {
      icon: <Zap size={32} />,
      title: "Flash Sales",
      description: "Daily deals and exclusive promotions just for you",
    },
    {
      icon: <Users size={32} />,
      title: "Community Reviews",
      description: "Real reviews from verified customers",
    },
    {
      icon: <Award size={32} />,
      title: "Loyalty Rewards",
      description: "Earn points on every purchase and unlock benefits",
    },
  ];

  const stats = [
    { number: "10K+", label: "Active Boutiques" },
    { number: "500K+", label: "Happy Customers" },
    { number: "1M+", label: "Products Available" },
    { number: "4.8★", label: "Average Rating" },
  ];

  const userTypes = [
    {
      title: "For Boutique Owners",
      description: "Grow your business and reach thousands of customers",
      features: [
        "Easy store management",
        "Analytics dashboard",
        "Marketing tools",
      ],
      cta: "Open Your Store",
      icon: <Store size={48} />,
      color: "var(--secondary-green)",
      image:
        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop",
    },
    {
      title: "For Drivers",
      description: "Earn money on your schedule with flexible delivery options",
      features: ["Flexible hours", "Real-time earnings", "Route optimization"],
      cta: "Become a Driver",
      icon: <Truck size={48} />,
      color: "var(--accent-purple)",
      image:
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&auto=format&fit=crop",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Verified Shopper",
      image: "https://i.pravatar.cc/150?img=1",
      rating: 5,
      text: "Amazing platform! I found everything I needed in one place. The delivery was super fast and the quality is outstanding.",
    },
    {
      name: "Michael Chen",
      role: "Boutique Owner",
      image: "https://i.pravatar.cc/150?img=13",
      rating: 5,
      text: "Mallify transformed my business. The analytics tools are incredible and I've reached so many new customers!",
    },
    {
      name: "David Martinez",
      role: "Delivery Driver",
      image: "https://i.pravatar.cc/150?img=12",
      rating: 5,
      text: "Best side hustle ever! Flexible hours, great earnings, and the app makes everything so easy to manage.",
    },
  ];

  return (
    <div className="homepage">
      {/* Navigation */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="container">
          <div className="nav-content">
            <div className="logo">
              <img
                src={mallifyLogo}
                alt="Mallify Logo"
                className="logo-image"
              />
              <span className="logo-text">Mallify</span>
            </div>

            <div className={`nav-links ${mobileMenuOpen ? "active" : ""}`}>
              <button
                className="btn-primary"
                onClick={() => {
                  document
                    .getElementById("for-you")
                    ?.scrollIntoView({ behavior: "smooth" });
                  setMobileMenuOpen(false);
                }}
              >
                Get Started
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

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge">
                <Sparkles size={16} />
                <span>Special Launch Offer - 30% Off First Order</span>
                <div className="badge-glow"></div>
              </div>
              <h1>
                Your Ultimate
                <span className="gradient-text"> Shopping Destination</span>
              </h1>
              <p>
                Discover thousands of boutiques, millions of products, and
                lightning-fast delivery. Shop smarter with Mallify - where every
                store comes to you.
              </p>
              <div className="hero-cta">
                <button className="btn-primary btn-large btn-glow">
                  <Sparkles size={20} />
                  Explore Stores
                  <ArrowRight size={20} />
                </button>
                <button className="btn-outline btn-large">
                  <Search size={20} />
                  Browse Products
                </button>
              </div>
              <div className="hero-stats">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-main-image">
                <img
                  src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop"
                  alt="Shopping Experience"
                />
                <div className="image-overlay"></div>
              </div>
              <div className="floating-card card-1">
                <div
                  className="card-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <Package size={24} />
                </div>
                <div className="card-content">
                  <div className="card-title">Fast Shipping</div>
                  <div className="card-value">2-Day Delivery</div>
                </div>
              </div>
              <div className="floating-card card-2">
                <div
                  className="card-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                  }}
                >
                  <Heart size={24} />
                </div>
                <div className="card-content">
                  <div className="card-title">Customer Love</div>
                  <div className="card-value">98% Satisfied</div>
                </div>
              </div>
              <div className="floating-card card-3">
                <div
                  className="card-icon"
                  style={{
                    background:
                      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                  }}
                >
                  <Star size={24} />
                </div>
                <div className="card-content">
                  <div className="card-title">Top Rated</div>
                  <div className="card-value">4.9/5.0</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Virtual Mall?</h2>
            <p>Experience the future of online shopping</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section id="for-you" className="user-types-section">
        <div className="container">
          <div className="section-header">
            <h2>Built For Everyone</h2>
            <p>
              Whether you're shopping, selling, or delivering - we've got you
              covered
            </p>
          </div>
          <div className="user-types-grid">
            {userTypes.map((type, index) => (
              <div key={index} className="user-type-card">
                <div className="user-type-image">
                  <img src={type.image} alt={type.title} />
                  <div
                    className="image-gradient"
                    style={{
                      background: `linear-gradient(135deg, ${type.color}00, ${type.color})`,
                    }}
                  ></div>
                </div>
                <div className="user-type-content">
                  <div className="user-type-icon" style={{ color: type.color }}>
                    {type.icon}
                  </div>
                  <h3>{type.title}</h3>
                  <p>{type.description}</p>
                  <ul className="user-type-features">
                    {type.features.map((feature, idx) => (
                      <li key={idx}>
                        <Star size={16} fill={type.color} color={type.color} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="btn-primary btn-hover-lift"
                    style={{ backgroundColor: type.color }}
                    onClick={() =>
                      type.cta === "Become a Driver"
                        ? navigate("/become-driver")
                        : null
                    }
                  >
                    {type.cta} <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-header">
            <h2>What Our Community Says</h2>
            <p>Real stories from real people</p>
          </div>
          <div className="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`testimonial-card ${
                  index === activeTestimonial ? "active" : ""
                }`}
              >
                <div className="testimonial-content">
                  <div className="quote-icon">"</div>
                  <p>{testimonial.text}</p>
                  <div className="testimonial-rating">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} fill="#FFA500" color="#FFA500" />
                    ))}
                  </div>
                </div>
                <div className="testimonial-author">
                  <img src={testimonial.image} alt={testimonial.name} />
                  <div>
                    <div className="author-name">{testimonial.name}</div>
                    <div className="author-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`dot ${index === activeTestimonial ? "active" : ""}`}
                onClick={() => setActiveTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <div className="cta-text">
              <h2>Ready to Start Your Journey?</h2>
              <p>
                Join millions of satisfied customers and experience the future
                of shopping
              </p>
            </div>
            <div className="cta-buttons">
              <button className="btn-primary btn-large">
                Create Free Account <ArrowRight size={20} />
              </button>
              <button className="btn-outline btn-large">Contact Sales</button>
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
                <img
                  src={mallifyLogo}
                  alt="Mallify Logo"
                  className="footer-logo-image"
                />
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
              <h4>For Shoppers</h4>
              <ul>
                <li>
                  <a href="#">Browse Products</a>
                </li>
                <li>
                  <a href="#">Track Orders</a>
                </li>
                <li>
                  <a href="#">Wishlist</a>
                </li>
                <li>
                  <a href="#">Customer Support</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>For Sellers</h4>
              <ul>
                <li>
                  <a href="#">Seller Dashboard</a>
                </li>
                <li>
                  <a href="#">Start Selling</a>
                </li>
                <li>
                  <a href="#">Pricing Plans</a>
                </li>
                <li>
                  <a href="#">Seller Resources</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>For Drivers</h4>
              <ul>
                <li>
                  <a href="#">Become a Driver</a>
                </li>
                <li>
                  <a href="#">Driver App</a>
                </li>
                <li>
                  <a href="#">Earnings</a>
                </li>
                <li>
                  <a href="#">Requirements</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
                <li>
                  <a href="#">Contact</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Mallify. All rights reserved.</p>
            <div className="footer-links">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
