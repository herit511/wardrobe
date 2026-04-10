import React from 'react';
import { Link } from 'react-router-dom';

function Terms() {
  return (
    <div className="legal-page" style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <Link to="/login" style={{ display: 'inline-block', marginBottom: '20px', color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }}>← Back</Link>
      <h1 className="heading-italic" style={{ fontSize: '2.5rem', marginBottom: '20px', color: 'var(--color-navy)' }}>Terms of Service</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '30px' }}>Last updated: March 2026</p>
      
      <div className="legal-content" style={{ lineHeight: '1.6', color: '#4A5568' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
        <p style={{ marginBottom: '15px' }}>By accessing and using Style DNA ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>2. User Accounts</h2>
        <p style={{ marginBottom: '15px' }}>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must immediately notify us of any unauthorized use of your account.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>3. User Content</h2>
        <p style={{ marginBottom: '15px' }}>You retain all rights to the images and data you upload to the App. By uploading content, you grant us a license to use, store, and display that content solely for the purpose of providing the App's services to you (e.g., outfit generation).</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>4. Prohibited Uses</h2>
        <p style={{ marginBottom: '15px' }}>You agree not to use the App for any unlawful purpose, to upload malicious code, or to attempt to gain unauthorized access to our systems.</p>
        
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-navy)', marginTop: '30px', marginBottom: '15px' }}>5. Termination</h2>
        <p style={{ marginBottom: '15px' }}>We reserve the right to suspend or terminate your account at any time for violations of these Terms. You may also delete your account at any time via the Profile settings.</p>
      </div>
    </div>
  );
}

export default Terms;
