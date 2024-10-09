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
        <div className="p-8 bg-base-200 shadow-md rounded-lg overflow-hidden md:w-1/2 m-auto">
          <h1 className="text-3xl font-bold mb-6">Support</h1>
          <p className="mb-6">
            If you need assistance, please fill out the form below:
          </p>
          <EmailForm
            onSuccess={() => alert("Email sent successfully!")}
            onError={(error) => alert(`Error sending email: ${error}`)}
          />
        </div>
      </section>
    </main>
  );
};

export default SupportPage;
