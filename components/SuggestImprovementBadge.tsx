import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";
import { User } from "@supabase/auth-helpers-nextjs";
import { toast } from "react-hot-toast";
import { getUser } from "@/libs/supabase/queries";

const SuggestImprovementBadge = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getUserCall = async () => {
      const user = await getUser(supabase);
      if (user) {
        setUser(user);
      } else {
        console.log("User not authenticated");
      }
    };
    getUserCall();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) {
      toast.error("Please log in to submit a suggestion");
      return;
    }
    setIsSubmitting(true);

    try {
      // Send email
      const response = await fetch("/api/email/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          name: "",
          content: message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      // Reset form
      setMessage("");
      setIsOpen(false);
      toast.success(
        "Thank you for your suggestion! We will repond in the 48h!"
      );
    } catch (error) {
      toast.error("Error submitting suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-sm fixed bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full shadow-lg hover:bg-primary-focus transition-colors duration-200 z-50"
      >
        💡 Suggest Improvement
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Suggest an Improvement</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Suggestion
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="textarea textarea-bordered textarea-primary w-full h-32"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SuggestImprovementBadge;
