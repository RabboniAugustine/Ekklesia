import { useState } from "react";
import { Shield } from "lucide-react";
import { signInWithEmailPassword } from "../services/authService";

type SignInPageProps = {
  onBack: () => void;
  onSignedIn: () => void;
};

export function SignInPage({ onBack, onSignedIn }: SignInPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailPassword(email, password);
      onSignedIn();
    } catch (error) {
      console.error(error);
      setErrorMessage("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="w-11 h-11 bg-primary rounded-xl flex items-center justify-center mb-5">
          <Shield size={22} className="text-white" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Sign in</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Access your church management dashboard.
        </p>

        {errorMessage && (
          <div className="mt-4 border border-rose-200 bg-rose-50 text-rose-700 rounded-lg p-3 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="admin@yourchurch.org"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full border border-border bg-background rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={onBack}
          className="mt-4 text-sm text-muted-foreground hover:text-foreground"
        >
          Back to welcome page
        </button>
      </div>
    </div>
  );
}