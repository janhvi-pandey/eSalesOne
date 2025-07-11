import { useNavigate } from "react-router-dom";
import {
  FaTshirt,
  FaShoePrints,
  FaShoppingBag,
  FaRobot,
  FaUserPlus,
  FaLaptop,
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

const LandingPage = () => {
  const navigate = useNavigate();

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

      {/* Main Content */}
      <div className="landing-content">
        <h1 className="landing-main-title">
          Shop Smart. Style Quick. Live <span>Bold.</span>
        </h1>
        <p className="landing-main-subtitle">
          <strong>Welcome to QuickCart</strong> — your go-to-place for fast, trendy, and reliable shopping.
        </p>
        <button className="landing-main-button" onClick={() => navigate("/login")}>
          <FaUserPlus className="button-icon" />
          Start Shopping
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
