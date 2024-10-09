import React from 'react';
import EmailForm from '@/components/EmailForm';

const SupportPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Support</h1>
      <p className="mb-4">If you need assistance, please fill out the form below:</p>
      <EmailForm 
        onSuccess={() => alert('Email sent successfully!')}
        onError={(error) => alert(`Error sending email: ${error}`)}
      />
    </div>
  );
};

export default SupportPage;
