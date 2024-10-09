"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import EmailForm from "@/components/EmailForm";
import React from "react";

const SupportPage: React.FC = () => {
  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="z-50">
          <HeaderDashboard />
        </div>
        <h1 className="text-2xl font-bold mb-4">Support</h1>
        <p className="mb-4">
          If you need assistance, please fill out the form below:
        </p>
        <EmailForm
          onSuccess={() => alert("Email sent successfully!")}
          onError={(error) => alert(`Error sending email: ${error}`)}
        />
      </section>
    </main>
  );
};

export default SupportPage;
