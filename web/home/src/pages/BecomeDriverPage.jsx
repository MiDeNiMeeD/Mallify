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
  User,
  MapPin,
  Car,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./BecomeDriverPage.css";
import mallifyLogo from "../assets/images/mallifyW.png";

const BecomeDriverPage = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
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
    { number: 1, title: "Personal Info", icon: <User size={20} /> },
    { number: 2, title: "Address", icon: <MapPin size={20} /> },
    { number: 3, title: "Documents", icon: <Car size={20} /> },
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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Driver Application:", formData);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="driver-page">
        <div className="split-layout">
          <div className="left-panel">
            <div className="left-content">
              <div className="logo-header" onClick={() => navigate("/")}>
                <img src={mallifyLogo} alt="Mallify" className="logo" />
                <span className="logo-text">Mallify</span>
              </div>
              <div className="success-illustration">
                <CheckCircle size={120} color="#ffffff" strokeWidth={2} />
              </div>
              <h1>Application Submitted!</h1>
              <p>
                Your journey with Mallify starts here. We'll review your
                application and get back to you soon.
              </p>
            </div>
          </div>
          <div className="right-panel">
            <div className="success-message">
              <div className="success-icon-small">
                <CheckCircle size={48} color="#10b981" />
              </div>
              <h2>Thank You!</h2>
              <p>
                We've received your driver application and our team will review
                it carefully.
              </p>
              <p className="info-text">
                You should receive an email within 2-3 business days with the
                next steps in the process.
              </p>
              <button
                className="btn-primary btn-large"
                onClick={() => navigate("/")}
              >
                <ArrowLeft size={20} />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="driver-page">
      <div className="split-layout">
        {/* Left Panel */}
        <div className="left-panel">
          <div className="logo-header" onClick={() => navigate("/")}>
            <img src={mallifyLogo} alt="Mallify" className="logo" />
            <span className="logo-text">Mallify</span>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="right-panel">
          <div className="form-wrapper">
            <div className="form-header">
              <h2>Driver Application</h2>
              <p>Fill in your details to get started</p>
            </div>

            {/* Stepper */}
            <div className="stepper">
              {steps.map((step, index) => (
                <div key={step.number} className="step-container">
                  <div
                    className={`step ${
                      currentStep === step.number ? "active" : ""
                    } ${currentStep > step.number ? "completed" : ""}`}
                  >
                    <div className="step-number">
                      {currentStep > step.number ? (
                        <CheckCircle size={20} />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <div className="step-info">
                      <div className="step-title">{step.title}</div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`step-line ${
                        currentStep > step.number ? "completed" : ""
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="driver-form">
              {/* Step 1: Personal Info */}
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="fullName">Full Name</label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="phone">Phone Number</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Address */}
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="address">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      placeholder="Enter your address"
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
                      required
                      placeholder="Enter your city"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Documents */}
              {currentStep === 3 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="cinFile">
                      CIN (Carte d'Identité Nationale)
                    </label>
                    <input
                      type="file"
                      id="cinFile"
                      name="cinFile"
                      onChange={handleFileChange}
                      required
                      accept="image/*,.pdf"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="permisFile">
                      Permis de Conduire (Driver's License)
                    </label>
                    <input
                      type="file"
                      id="permisFile"
                      name="permisFile"
                      onChange={handleFileChange}
                      required
                      accept="image/*,.pdf"
                    />
                  </div>

                  <div className="terms-check">
                    <input type="checkbox" id="terms" required />
                    <label htmlFor="terms">
                      I agree to the <a href="#">terms of service</a> and{" "}
                      <a href="#">privacy policy</a>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="btn-secondary"
                  >
                    <ArrowLeft size={20} />
                    Previous
                  </button>
                )}

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-next"
                  >
                    Next
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button type="submit" className="btn-submit">
                    Submit Application
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <ToastContainer />
    </div>
  );
};

export default BecomeDriverPage;
