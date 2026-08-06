import React from "react";
import "./Contact.css";
import { useForm, ValidationError } from "@formspree/react";
import {
  FaPhone,
  FaComment,
  FaTelegramPlane,
  FaFacebook,
  FaInstagram,
} from "react-icons/fa";

function Contact() {
  const [state, handleSubmit] = useForm("mldnrbnl"); // Replace with your Formspree ID

  return (
    <section className="contact-section py-5">
      <div className="container">
        <h2 className="text-center mb-4" data-aos="fade-up">
          CONTACT <span className="highlight">US</span>
        </h2>
        <hr className="underline mb-5" />

        <div className="row">
          {/* LEFT - Info */}
          <div className="col-md-6 mb-4" data-aos="fade-right" data-aos-delay="100">
            <p>
              If you are interested in our products and want to contact us,
              click on the links below.
            </p>
            <div className="contact-icons mt-3">
              <div>
                <FaPhone /> <a href="tel:+251911422570">+251911422570</a>
              </div>
              <div>
                <FaComment />{" "}
                <a href="sms:+251911422570?body=Hello%20Kabba">
                  +251 911422570
                </a>
              </div>
              <div>
                <FaTelegramPlane />{" "}
                <a
                  href="https://t.me/KabbaDesign"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @KabbaDesign
                </a>
              </div>
              <div>
                <FaFacebook />{" "}
                <a
                  href="https://facebook.com/KabbaDesign"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @KabbaDesign
                </a>
              </div>
              <div>
                <FaInstagram />{" "}
                <a
                  href="https://instagram.com/KabbaDesign"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  @KabbaDesign
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT - Form */}
          <div className="col-md-6" data-aos="fade-left" data-aos-delay="200">
            {state.succeeded ? (
              <p className="alert alert-success">
                Thanks for reaching out! We’ll respond shortly.
              </p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control"
                    required
                  />
                  <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    rows="4"
                    required
                  />
                  <ValidationError
                    prefix="Message"
                    field="message"
                    errors={state.errors}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state.submitting}
                  className="btn btn-warning"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;
