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
        <div className="p-8 bg-base-200 shadow-md rounded-lg overflow-hidden m-auto h-full w-auto">
          <h1 className="text-3xl font-bold mb-6">Support</h1>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="mb-6">
                If you need assistance, please fill out the form below:
              </p>
              <EmailForm
                onSuccess={() => alert("Email sent successfully!")}
                onError={(error) => alert(`Error sending email: ${error}`)}
              />
            </div>
            <div className="h-auto">
              <InlineWidget url="https://calendly.com/expoweb/15-minutes-onboarding?hide_event_type_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=737eff" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SupportPage;
