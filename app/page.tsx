"use client";

import React, { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function MarketingLandingPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Navbar drop-in
    gsap.from(".landing-nav", {
      y: -30,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out"
    });

    // Hero content slide up and fade
    gsap.from(".hero-content-item", {
      y: 40,
      opacity: 0,
      duration: 1,
      stagger: 0.15,
      ease: "power3.out",
      delay: 0.2
    });

    // Visual cards pop-in
    gsap.from(".visual-card", {
      scale: 0.8,
      opacity: 0,
      y: 30,
      duration: 1,
      stagger: 0.15,
      ease: "back.out(1.5)",
      delay: 0.6
    });

    // Parallax effect on scroll for hero cards
    gsap.to(".visual-card-1", {
      scrollTrigger: { trigger: ".landing-hero", start: "top top", end: "bottom top", scrub: 1 },
      y: -80
    });
    gsap.to(".visual-card-2", {
      scrollTrigger: { trigger: ".landing-hero", start: "top top", end: "bottom top", scrub: 1 },
      y: -120
    });
    gsap.to(".visual-card-3", {
      scrollTrigger: { trigger: ".landing-hero", start: "top top", end: "bottom top", scrub: 1 },
      y: -50
    });

    // Features Section Title
    gsap.from(".features-header", {
      scrollTrigger: {
        trigger: ".features-header",
        start: "top 85%",
      },
      y: 40,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // Feature items stagger
    gsap.from(".feature-item", {
      scrollTrigger: {
        trigger: ".feature-grid",
        start: "top 85%",
      },
      y: 40,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: "power3.out"
    });
  }, { scope: container });

  return (
    <div className="landing-wrapper" ref={container}>
      <style dangerouslySetInnerHTML={{ __html: `
        .landing-wrapper {
          min-height: 100vh;
          background: #f8f7f1;
          font-family: "DM Sans", sans-serif;
          color: #25392d;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        /* Navigation */
        .landing-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 5%;
          background: transparent;
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 10;
        }
        .landing-logo-img {
          height: 36px;
          width: auto;
          filter: brightness(0) invert(1);
        }
        .landing-nav-links {
          display: flex;
          gap: 16px;
          align-items: center;
        }
        .landing-login-btn {
          padding: 10px 24px;
          border-radius: 8px;
          background: #ffffff;
          color: #25392d;
          font-weight: 500;
          font-size: 13px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .landing-login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        /* Hero Section */
        .landing-hero {
          position: relative;
          padding: 180px 5% 120px;
          background: radial-gradient(circle at 76% 18%, #31513d 0, #25392d 42%, #203328 100%);
          color: #f8f7f1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: hidden;
          min-height: 90vh;
        }
        .hero-content {
          max-width: 600px;
          z-index: 2;
        }
        .hero-content h1 {
          font-family: "Fraunces", serif;
          font-size: clamp(54px, 6.2vw, 92px);
          line-height: 0.95;
          letter-spacing: -3px;
          margin: 0 0 24px;
          color: #f6e8c6;
        }
        .hero-content p {
          font-size: 16px;
          line-height: 1.6;
          color: #c3d0c0;
          max-width: 480px;
          margin-bottom: 40px;
        }
        .hero-cta {
          display: flex;
          gap: 16px;
        }
        .btn-primary {
          padding: 16px 32px;
          border-radius: 8px;
          background: #e28d68;
          color: #fff;
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
          transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .btn-primary:hover {
          background: #cf7c58;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(226,141,104,0.3);
        }
        .btn-secondary {
          padding: 16px 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #fff;
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
          transition: background 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        /* Hero Visuals */
        .hero-visual {
          position: relative;
          z-index: 2;
          width: 450px;
          height: 450px;
        }
        .visual-card {
          position: absolute;
          background: #ffffff;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.2);
          width: 280px;
        }
        /* Continuous float animation combined with gsap positioning */
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .visual-card-content-wrapper {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
        }
        .visual-card-1 {
          top: 10%;
          right: 20%;
        }
        .visual-card-1 .visual-card-content-wrapper { animation: float-subtle 4s ease-in-out infinite 0s; }
        .visual-card-2 {
          top: 45%;
          left: 0;
        }
        .visual-card-2 .visual-card-content-wrapper { animation: float-subtle 5s ease-in-out infinite -1s; }
        .visual-card-3 {
          bottom: 10%;
          right: 10%;
        }
        .visual-card-3 .visual-card-content-wrapper { animation: float-subtle 4.5s ease-in-out infinite -2s; }
        
        .visual-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 24px;
        }
        .card-1-icon { background: #e3dff2; color: #695e96; }
        .card-2-icon { background: #dcefe1; color: #4b7454; }
        .card-3-icon { background: #faebd3; color: #9c7b41; }
        
        .visual-text strong {
          display: block;
          color: #25392d;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .visual-text small {
          color: #71806f;
          font-family: "DM Mono", monospace;
          font-size: 10px;
        }

        /* Background art */
        .hero-art-bg {
          position: absolute;
          bottom: -50px;
          right: -50px;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(226,141,104,0.15) 0%, rgba(226,141,104,0) 70%);
          z-index: 1;
          pointer-events: none;
        }

        /* Features Section */
        .landing-features {
          padding: 100px 5%;
          background: #f8f7f1;
        }
        .features-header {
          text-align: center;
          margin-bottom: 72px;
        }
        .features-header h2 {
          font-family: "Fraunces", serif;
          font-size: 42px;
          color: #25392d;
          letter-spacing: -1px;
          margin-bottom: 16px;
        }
        .features-header p {
          color: #71806f;
          font-size: 16px;
          max-width: 500px;
          margin: 0 auto;
        }
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .feature-item {
          background: #ffffff;
          padding: 40px;
          border-radius: 16px;
          border: 1px solid #e4e6dc;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .feature-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
        }
        .feature-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-size: 24px;
          margin-bottom: 24px;
        }
        .icon-mint { background: #dcefe1; color: #4b7454; }
        .icon-yellow { background: #faebd3; color: #9c7b41; }
        .icon-lilac { background: #e3dff2; color: #695e96; }
        
        .feature-item h3 {
          font-size: 20px;
          color: #25392d;
          margin-bottom: 12px;
        }
        .feature-item p {
          color: #71806f;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Footer */
        .landing-footer {
          background: #203328;
          padding: 40px 5%;
          text-align: center;
          color: #c3d0c0;
        }
        .footer-logo {
          height: 28px;
          filter: brightness(0) invert(1);
          opacity: 0.7;
          margin-bottom: 20px;
        }
        .footer-content p {
          font-size: 12px;
          font-family: "DM Mono", monospace;
        }

        @media (max-width: 960px) {
          .landing-hero {
            flex-direction: column;
            padding-top: 140px;
            text-align: center;
          }
          .hero-content {
            margin-bottom: 60px;
          }
          .hero-content p {
            margin: 0 auto 30px;
          }
          .hero-cta {
            justify-content: center;
          }
          .hero-visual {
            width: 100%;
            height: 350px;
          }
          .visual-card {
            width: 240px;
          }
          .visual-card-1 { top: 0; right: 10%; }
          .visual-card-2 { top: 40%; left: 10%; }
          .visual-card-3 { bottom: 0; right: 20%; }
        }
      `}} />

      <nav className="landing-nav">
        <div className="landing-brand">
          <img src="/brand-logo.png" alt="Campus Commons" className="landing-logo-img" />
        </div>
        <div className="landing-nav-links">
          <Link href="/login" className="landing-login-btn">Sign In</Link>
        </div>
      </nav>
      
      <main className="landing-hero">
        <div className="hero-art-bg"></div>
        <div className="hero-content">
          <h1 className="hero-content-item">Your Campus,<br/>All in One Place.</h1>
          <p className="hero-content-item">
            Connect with clubs, discover events, buy & sell items, and manage your campus life effortlessly. 
            Designed for students who want to make the most of their college experience.
          </p>
          <div className="hero-cta hero-content-item">
            <Link href="/login" className="btn-primary">Get Started Now</Link>
            <a href="#features" className="btn-secondary">Explore Features</a>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="visual-card visual-card-1">
            <div className="visual-card-content-wrapper">
              <span className="visual-icon card-1-icon">🎨</span>
              <div className="visual-text">
                <strong>Design Society</strong>
                <small>Poster Jam · Fri, 4:30 PM</small>
              </div>
            </div>
          </div>
          <div className="visual-card visual-card-2">
            <div className="visual-card-content-wrapper">
              <span className="visual-icon card-2-icon">📌</span>
              <div className="visual-text">
                <strong>Campus Market</strong>
                <small>Hand-printed campus tote</small>
              </div>
            </div>
          </div>
          <div className="visual-card visual-card-3">
            <div className="visual-card-content-wrapper">
              <span className="visual-icon card-3-icon">✦</span>
              <div className="visual-text">
                <strong>Student Council</strong>
                <small>Elections ending soon</small>
              </div>
            </div>
          </div>
        </div>
      </main>

      <section id="features" className="landing-features">
        <div className="features-header">
          <h2>Everything you need</h2>
          <p>One platform to bring the entire campus community together.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-item">
            <div className="feature-icon-wrapper icon-mint">◈</div>
            <h3>Clubs & Communities</h3>
            <p>Join organizations, track your memberships, and stay updated with your favorite communities.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper icon-yellow">●</div>
            <h3>Events & Ticketing</h3>
            <p>Discover what's happening around campus, RSVP to events, and get your tickets seamlessly.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-wrapper icon-lilac">📌</div>
            <h3>Marketplace</h3>
            <p>Buy, sell, and trade items with other students in a secure, campus-exclusive marketplace.</p>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-content">
          <img src="/brand-logo.png" alt="Logo" className="footer-logo" />
          <p>© 2026 Campus Commons. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
