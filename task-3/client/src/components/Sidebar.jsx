import React from "react";
import { MdDashboard, MdProductionQuantityLimits, MdPeople, MdSettings } from "react-icons/md";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-logo"> eSalesOne</h2>
      <ul className="sidebar-nav">
        <li className="active">
          <MdDashboard className="nav-icon" />
          Dashboard
        </li>
        <li>
          <MdProductionQuantityLimits className="nav-icon" />
          Products
        </li>
        <li>
          <MdPeople className="nav-icon" />
          Customers
        </li>
        <li>
          <MdSettings className="nav-icon" />
          Settings
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
