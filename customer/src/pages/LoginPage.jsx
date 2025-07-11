import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyCardLast4 } from "../api";
import {
  FaTshirt,
  FaShoePrints,
  FaShoppingBag,
  FaRobot,
  FaLaptop,
  FaUserCheck,
} from "react-icons/fa";
import { SlEarphones } from "react-icons/sl";
import { PiPantsFill } from "react-icons/pi";
import { GiSonicShoes } from "react-icons/gi";
import "../index.css";

const FloatingIcon = ({ Icon, className, style }) => (
  <Icon className={`floating-icon ${className}`} style={style} />
);

const iconStyles = [
  { Icon: FaTshirt, top: "10%", left: "8%", size: "3.5rem", delay: 0 },
  { Icon: SlEarphones, top: "30%", left: "65%", size: "3rem", delay: 1 },
  { Icon: PiPantsFill, top: "75%", left: "10%", size: "3.5rem", delay: 2 },
  { Icon: FaRobot, top: "15%", left: "50%", size: "4rem", delay: 0 },
  { Icon: FaLaptop, top: "8%", right: "8%", size: "4rem", delay: 1 },
  { Icon: GiSonicShoes, bottom: "10%", left: "50%", size: "4rem", delay: 2 },
  { Icon: FaShoppingBag, top: "50%", left: "5%", size: "3.5rem", delay: 0 },
  { Icon: FaShoePrints, bottom: "2%", right: "5%", size: "3.5rem", delay: 1 },
];

export default function LoginPage() {
  const [orderId, setOrderId] = useState("");
  const [last4, setLast4] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const { isMatch, customerId } = await verifyCardLast4(orderId, last4);
      if (isMatch && customerId) {
        navigate(`/dashboard?customer_id=${customerId}`);
      } else {
        setError("Invalid Order ID or last 4 digits.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="landing-new-container">
      {/* Floating Icons */}
      {iconStyles.map(({ Icon, delay, ...style }, i) => (
        <FloatingIcon
          key={i}
          Icon={Icon}
          className={`float${delay}`}
          style={{ ...style, fontSize: style.size }}
        />
      ))}

      {/* Login Form */}
      <form className="login-box" onSubmit={handleLogin}>
        <h2>Login to QuickCart</h2>

        <input
          type="text"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Last 4 digits of card"
          value={last4}
          onChange={(e) => setLast4(e.target.value)}
          maxLength={4}
          required
        />

        <button type="submit">
          <FaUserCheck style={{ marginRight: "8px" }} />
          Login
        </button>

        {error && <p className="error-msg">{error}</p>}
      </form>
    </div>
  );
}
