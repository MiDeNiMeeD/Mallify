import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import BecomeDriverPage from "./pages/BecomeDriverPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/become-driver" element={<BecomeDriverPage />} />
      </Routes>
    </Router>
  );
}

export default App;
