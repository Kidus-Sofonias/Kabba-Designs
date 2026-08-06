import React from "react";
import { Link } from "react-router-dom";
import {
  FaPhone,
  FaComment,
  FaTelegramPlane,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";
import logo from "../../assets/images/icons/logo.png";
import "./Footer.css";

const SHOP_LINKS = [
  { label: "Women", to: "/women" },
  { label: "Men", to: "/men" },
  { label: "Children", to: "/children" },
  { label: "Jewelry", to: "/jewelry" },
];

const COMPANY_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Products", to: "/products" },
  { label: "Events", to: "/events" },
  { label: "Contact", to: "/contact" },
];

const SOCIALS = [
  {
    label: "Telegram",
    href: "https://t.me/KabbaDesign",
    Icon: FaTelegramPlane,
  },
  {
    label: "Facebook",
    href: "https://facebook.com/KabbaDesign",
    Icon: FaFacebook,
  },
  {
    label: "Instagram",
    href: "https://instagram.com/KabbaDesign",
    Icon: FaInstagram,
  },
];

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container py-5">
        <div className="row g-4">
          {/* Brand */}
          <div className="col-lg-4 mb-4 mb-lg-0">
            <img src={logo} alt="KABBA Logo" className="footer-logo mb-3" />
            <p className="footer-blurb">
              Authentic African fashion since 2019. Ethiopian traditional wear,
              modern workwear, handmade jewelry and children's clothing —
              crafted with heritage and pride.
            </p>
            <div className="footer-socials">
              {SOCIALS.map((social) => {
                const Icon = social.Icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    title={social.label}
                  >
                    <Icon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Shop */}
          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Shop</h6>
            <ul className="footer-list">
              {SHOP_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="col-6 col-lg-2">
            <h6 className="footer-heading">Company</h6>
            <ul className="footer-list">
              {COMPANY_LINKS.map((link) => (
                <li key={link.to}>
                  <Link to={link.to}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-lg-4">
            <h6 className="footer-heading">Get in Touch</h6>
            <ul className="footer-contact">
              <li>
                <FaPhone />{" "}
                <a href="tel:+251911422570">+251 911 422 570</a>
              </li>
              <li>
                <FaComment />{" "}
                <a href="sms:+251911422570?body=Hello%20Kabba">Send us an SMS</a>
              </li>
              <li>
                <FaTelegramPlane />{" "}
                <a
                  href="https://t.me/KabbaDesign"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @KabbaDesign
                </a>
              </li>
              <li>Addis Ababa, Ethiopia</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container text-center">
          © {year} KABBA. All rights reserved. | Site by{" "}
          <a href="https://www.kidussofonias.com.et">Kidus Sofonias</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
