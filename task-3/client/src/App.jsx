import React from "react";
import Dashboard from "./components/Dashboard";
import "../src/index.css";
import Sidebar from "./components/Sidebar";

function App() {
  return (
    <div className="app-container">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
