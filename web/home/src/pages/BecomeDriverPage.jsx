import React, { useState } from "react";
import {
  Truck,
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
import "./BecomeDriverPage.css";
import homeApiClient from "../api/homeApiClient";
import logo from "../assets/icons/logo.png";

const BecomeDriverPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    cinFile: null,
    permisFile: null,
  });

  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Address" },
    { number: 3, title: "Documents" },
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

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.email || !formData.fullName || !formData.phone) {
        showToast("Please fill in all required fields before proceeding.");
        return false;
      }
    } else if (currentStep === 2) {
      if (!formData.address || !formData.city) {
        showToast("Please fill in all required fields before proceeding.");
        return false;
      }
    } else if (currentStep === 3) {
      if (!formData.cinFile || !formData.permisFile) {
        showToast("Please upload all required documents before proceeding.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }
    if (currentStep < 3) {
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
      const response = await homeApiClient.submitDriverApplication(formData);
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
            <h2>Application Submitted!</h2>
            <p>
              Thank you for applying to become a Mallify driver. We'll review
              your application and get back to you within 2-3 business days.
            </p>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Return to Home <ArrowRight size={18} />
            </button>
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
          <h1>Become a driver</h1>
          <p>
            Join our delivery network and start earning on your own schedule.
            Complete the application below to get started.
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
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <>
                <h3 className="form-section-title">Personal Information</h3>
                
                <div className="form-group">
                  <label htmlFor="fullName">Full name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
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

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <>
                <h3 className="form-section-title">Address Information</h3>
                
                <div className="form-group">
                  <label htmlFor="address">Street address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your street address"
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

            {/* Step 3: Documents */}
            {currentStep === 3 && (
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

                <div className="form-group">
                  <label>Driver's License (Permis)</label>
                  <div className="file-upload">
                    <input
                      type="file"
                      id="permisFile"
                      name="permisFile"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.pdf"
                      required
                    />
                    <label htmlFor="permisFile" className="file-upload-label">
                      <Upload size={32} />
                      <div className="file-upload-text">
                        <strong>Click to upload</strong> or drag and drop
                        <br />
                        <span style={{ fontSize: '13px', color: '#8c9196' }}>
                          PDF, JPG or PNG (max. 10MB)
                        </span>
                      </div>
                    </label>
                    {formData.permisFile && (
                      <div className="file-name">✓ {formData.permisFile.name}</div>
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
              
              {currentStep < 3 ? (
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

      <ToastContainer />
    </div>
  );
};

export default BecomeDriverPage;
