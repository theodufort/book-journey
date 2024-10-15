"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import EmailForm from "@/components/EmailForm";
import React from "react";
import { InlineWidget } from "react-calendly";

const SupportPage: React.FC = () => {
  return (
    <main className="min-h-screen p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="z-50">
          <HeaderDashboard />
        </div>
        <div className="p-8 bg-base-200 shadow-md rounded-lg overflow-hidden m-auto w-auto">
          <h1 className="text-3xl font-bold mb-6">Support</h1>
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <p>
                If you need assistance, please fill out the form below:
              </p>
              <EmailForm
                onSuccess={() => alert("Email sent successfully!")}
                onError={(error) => alert(`Error sending email: ${error}`)}
              />
            </div>
            <div className="h-[600px] md:h-[700px] lg:h-[600px]">
              <InlineWidget
                url="https://calendly.com/expoweb/15-minutes-onboarding?hide_event_type_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=737eff"
                styles={{ height: '100%', width: '100%' }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SupportPage;
