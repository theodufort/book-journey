"use client";
import HeaderDashboard from "@/components/DashboardHeader";
import EmailForm from "@/components/EmailForm";
import React from "react";
import { InlineWidget } from "react-calendly";
import toast from "react-hot-toast";

const SupportPage: React.FC = () => {
  return (
    <main className="min-h-screen p-4 sm:p-8 pb-24">
      <section className="max-w-6xl mx-auto space-y-8">
        <div className="sticky top-0 z-50 bg-base-100">
          <HeaderDashboard />
        </div>
        <div className="p-4 sm:p-8 bg-base-200 shadow-md rounded-lg m-auto w-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Support</h1>
          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
            <div className="space-y-6">
              <p className="text-sm sm:text-base">
                If you need assistance, please fill out the form below:
              </p>
              <EmailForm
                onSuccess={() => toast.success("Email sent successfully!")}
                onError={(error) =>
                  toast.error(`Error sending email: ${error}`)
                }
              />
            </div>
            <div className="h-[500px] sm:h-[600px] md:h-[700px] lg:h-[600px]">
              <InlineWidget
                url="https://calendly.com/theointechs/15-minutes-onboarding?hide_event_type_details=1&hide_gdpr_banner=1&background_color=1a1a1a&text_color=ffffff&primary_color=737eff"
                styles={{ height: "100%", width: "100%" }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SupportPage;
