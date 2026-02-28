import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BecomeDriverPage from "./pages/BecomeDriverPage";
import BecomeBoutiqueOwnerPage from "./pages/BecomeBoutiqueOwnerPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/become-driver" element={<BecomeDriverPage />} />
        <Route path="/become-boutique" element={<BecomeBoutiqueOwnerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
