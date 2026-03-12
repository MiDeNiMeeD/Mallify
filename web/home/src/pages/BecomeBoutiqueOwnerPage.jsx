import React, { useState } from "react";
import {
  Store,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Upload,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./BecomeBoutiqueOwnerPage.css";
import homeApiClient from "../api/homeApiClient";
import logo from "../assets/icons/logo.png";

const BecomeBoutiqueOwnerPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [formData, setFormData] = useState({
    boutiqueName: "",
    ownerName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    city: "",
    description: "",
    category: "",
    cinFile: null,
  });

  const steps = [
    { number: 1, title: "Business " },
    { number: 2, title: "Owner " },
    { number: 3, title: "Location" },
    { number: 4, title: "Documents" },
  ];

  const categories = [
    "Fashion & Apparel",
    "Electronics",
    "Home & Garden",
    "Beauty & Cosmetics",
    "Sports & Outdoors",
    "Toys & Games",
    "Books & Media",
    "Food & Beverages",
    "Health & Wellness",
    "Jewelry & Accessories",
    "Other",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.files[0],
    });
  };

  const showToast = (message, type = "error") => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const sendOtpEmail = async () => {
    console.log("sendOtpEmail called with email:", formData.email);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    try {
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(otp);
      
      // Call API to send the email
      console.log("Calling API to send OTP:", otp);
      const response = await homeApiClient.sendOTP(formData.email, otp);
      
      if (response.success) {
        showToast(`Verification code sent to ${formData.email}`, "success");
        console.log("Setting showOtpModal to true");
        setShowOtpModal(true);
      } else {
        showToast("Failed to send verification code. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      showToast("Failed to send verification code. Please try again.", "error");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = () => {
    if (otpCode === generatedOtp) {
      setEmailVerified(true);
      setShowOtpModal(false);
      showToast("Email verified successfully!", "success");
      setOtpCode("");
    } else {
      showToast("Invalid verification code. Please try again.", "error");
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.boutiqueName || !formData.category || !formData.description) {
        showToast("Please fill in all required fields before proceeding.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.ownerName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
        showToast("Please fill in all required fields before proceeding.");
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        showToast("Please enter a valid email address.");
        return false;
      }
      if (!emailVerified) {
        showToast("Please verify your email address before proceeding.");
        return false;
      }
      if (formData.password.length < 8) {
        showToast("Password must be at least 8 characters long.");
        return false;
      }
      // Password complexity validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(formData.password)) {
        showToast("Password must contain at least one uppercase letter, one lowercase letter, and one number.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        showToast("Passwords do not match.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.address || !formData.city) {
        showToast("Please fill in all required fields before proceeding.");
        return false;
      }
    } else if (currentStep === 4) {
      if (!formData.cinFile) {
        showToast("Please upload your CIN document before proceeding.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep()) {
      return;
    }

    setLoading(true);

    try {
      const response = await homeApiClient.submitBoutiqueApplication(formData);
      showToast("Application submitted successfully!", "success");
      setSubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting application:", error);
      showToast(
        error.response?.data?.message || "Failed to submit application. Please try again.",
        "error"
      );
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="driver-page">
        <header className="page-header">
          <div className="header-content">
            <div className="logo-header" onClick={() => navigate("/")}>
              <img src={logo} alt="Mallify Logo" className="logo" />
              <span className="logo-text">Mallify</span>
            </div>
          </div>
        </header>

        <div className="page-container">
          <div className="success-container">
            <div className="success-icon">
              <CheckCircle size={48} />
            </div>
            <h2>Account Created Successfully!</h2>
            <p>
              Your boutique owner account has been created successfully. 
              You can now log in to the manager dashboard using your email and password.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => window.location.href = "http://192.168.56.1:3335"}>
                Login <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <footer className="page-footer">
          <div className="footer-content">
            <p className="footer-text">© 2026 Mallify. All rights reserved.</p>
            <div className="social-links">
              <a href="#" className="social-icon">
                <Facebook size={18} />
              </a>
              <a href="#" className="social-icon">
                <Twitter size={18} />
              </a>
              <a href="#" className="social-icon">
                <Instagram size={18} />
              </a>
              <a href="#" className="social-icon">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </footer>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="driver-page">
      <header className="page-header">
        <div className="header-content">
          <div className="logo-header" onClick={() => navigate("/")}>
            <img src={logo} alt="Mallify Logo" className="logo" />
            <span className="logo-text">Mallify</span>
          </div>
          <button className="btn-back" onClick={() => navigate("/")}>
            <ArrowLeft size={18} />
            Back to home
          </button>
        </div>
      </header>

      <div className="page-container">
        <div className="page-hero">
          <h1>Start your boutique</h1>
          <p>
            Launch your online store and reach thousands of customers. Complete
            the application below to get started.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="step-progress">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div
                className={`step ${
                  currentStep === step.number
                    ? "active"
                    : currentStep > step.number
                    ? "completed"
                    : ""
                }`}
              >
                <div className="step-circle">{step.number}</div>
                <span className="step-label">{step.title}</span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`step-divider ${
                    currentStep > step.number ? "completed" : ""
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-container">
            {/* Step 1: Business Info */}
            {currentStep === 1 && (
              <>
                <h3 className="form-section-title">Business Information</h3>
                
                <div className="form-group">
                  <label htmlFor="boutiqueName">Boutique name</label>
                  <input
                    type="text"
                    id="boutiqueName"
                    name="boutiqueName"
                    value={formData.boutiqueName}
                    onChange={handleChange}
                    placeholder="Enter your boutique name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Business description</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your products and business..."
                    required
                  />
                </div>
              </>
            )}

            {/* Step 2: Owner Info */}
            {currentStep === 2 && (
              <>
                <h3 className="form-section-title">Owner Information</h3>
                
                <div className="form-group">
                  <label htmlFor="ownerName">Owner name</label>
                  <input
                    type="text"
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleChange}
                    placeholder="Enter owner's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      required
                      disabled={emailVerified}
                      style={{ flex: 1 }}
                    />
                    {!emailVerified ? (
                      <button
                        type="button"
                        onClick={sendOtpEmail}
                        disabled={sendingOtp || !formData.email}
                        className="btn-secondary"
                        style={{ whiteSpace: 'nowrap', padding: '12px 24px' }}
                      >
                        {sendingOtp ? "Sending..." : "Verify Email"}
                      </button>
                    ) : (
                      <span style={{ color: 'var(--shopify-green)', fontWeight: 600, padding: '12px' }}>✓ Verified</span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                  />
                  <small style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 3: Location */}
            {currentStep === 3 && (
              <>
                <h3 className="form-section-title">Location Information</h3>
                
                <div className="form-group">
                  <label htmlFor="address">Business address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your business address"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    required
                  />
                </div>
              </>
            )}

            {/* Step 4: Documents */}
            {currentStep === 4 && (
              <>
                <h3 className="form-section-title">Required Documents</h3>
                
                <div className="form-group">
                  <label>National ID (CIN)</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      id="cinFile"
                      name="cinFile"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                    <label htmlFor="cinFile" className="file-upload-label">
                      <Upload size={32} />
                      <div className="file-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                        <br />
                        <span style={{ fontSize: '13px', color: '#8c9196' }}>
                          PDF, JPG or PNG (max. 10MB)
                        </span>
                      </div>
                    </label>
                    {formData.cinFile && (
                      <div className="file-name">✓ {formData.cinFile.name}</div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              {currentStep > 1 && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrevious}
                >
                  <ArrowLeft size={18} />
                  Previous
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleNext}
                >
                  Next
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      <footer className="page-footer">
        <div className="footer-content">
          <p className="footer-text">© 2026 Mallify. All rights reserved.</p>
          <div className="social-links">
            <a href="#" className="social-icon">
              <Facebook size={18} />
            </a>
            <a href="#" className="social-icon">
              <Twitter size={18} />
            </a>
            <a href="#" className="social-icon">
              <Instagram size={18} />
            </a>
            <a href="#" className="social-icon">
              <Linkedin size={18} />
            </a>
          </div>
        </div>
      </footer>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="modal-overlay" onClick={() => setShowOtpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Verify Your Email</h3>
            <p>We've sent a verification code to <strong>{formData.email}</strong></p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Enter the 6-digit code below:</p>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              maxLength="6"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '24px',
                textAlign: 'center',
                letterSpacing: '8px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                marginBottom: '20px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtp}
                disabled={otpCode.length !== 6}
                className="btn-primary"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default BecomeBoutiqueOwnerPage;
