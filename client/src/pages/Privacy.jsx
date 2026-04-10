import React from 'react';
import { Link } from 'react-router-dom';

function Privacy() {
  return (
    <div className="legal-page" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <Link to="/login" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }}>← Back</Link>
      <h1 className="heading-italic" style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-navy)' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>Last updated: March 2026</p>
      
      <div className="legal-content" style={{ lineHeight: '1.6', color: '#4A5568' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>1. Information We Collect</h2>
        <p style={{ marginBottom: '15px' }}>We collect information you provide directly to us, including your name, email address, password, style preferences, and images of your clothing items.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>2. How We Use Your Information</h2>
        <p style={{ marginBottom: '15px' }}>We use the information we collect to provide, maintain, and improve our services. Specifically, your wardrobe data and style preferences are processed by AI models to generate personalized outfit suggestions.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>3. Data Storage and Security</h2>
        <p style={{ marginBottom: '15px' }}>Your images are securely stored using Cloudinary. We implement industry-standard security measures to protect your personal information and passwords.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>4. Data Deletion</h2>
        <p style={{ marginBottom: '15px' }}>You have the right to request the deletion of your personal data at any time. Using the "Delete Account" feature in your Profile will permanently erase your account, items, and outfit history from our servers.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>5. Contact Us</h2>
        <p style={{ marginBottom: '15px' }}>If you have any questions about this Privacy Policy, please contact us at privacy@styledna.com.</p>
      </div>
    </div>
  );
}

export default Privacy;
