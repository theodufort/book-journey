// components/SubscriberCard.js
import { useState } from "react";

export default function SubscriberCardQuotes() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/email/contact/quotes/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Subscription successful!");
        setEmail("");
      } else {
        setMessage(data.error || "Subscription failed.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full bg-base-200 shadow-xl max-w-2xl mx-auto">
      <div className="card-body">
        <h2 className="card-title">Get one quote a day every day!</h2>
        <p>Get a different quote everyday and unsubscribe anytime.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label" htmlFor="email">
              <span className="label-text">Enter your email</span>
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input input-bordered w-full"
              placeholder="your-email@example.com"
            />
          </div>
          <div className="form-control mt-4">
            <button
              type="submit"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              Subscribe
            </button>
          </div>
        </form>
        {message && <p className="text-center mt-4">{message}</p>}
      </div>
    </div>
  );
}
