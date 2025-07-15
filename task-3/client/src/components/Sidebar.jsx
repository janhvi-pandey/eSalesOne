import React from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard, MdProductionQuantityLimits, MdPeople, MdSettings } from "react-icons/md";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo">eSalesOne</h2>
      <ul className="sidebar-nav">
        <li>
          <NavLink to="/dashboard" className="nav-link">
            <MdDashboard className="nav-icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/products" className="nav-link">
            <MdProductionQuantityLimits className="nav-icon" />
            <span>Products</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/customers" className="nav-link">
            <MdPeople className="nav-icon" />
            <span>Customers</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className="nav-link">
            <MdSettings className="nav-icon" />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
