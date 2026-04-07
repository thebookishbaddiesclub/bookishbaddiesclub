"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FadeIn from "@/components/FadeIn";
import { Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(data.error || "Identifiants incorrects");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <FadeIn className="bg-bb-cream border border-bb-beige p-10 md:p-16 rounded-[3rem] shadow-2xl w-full max-w-md text-center bg-white/40 backdrop-blur-xl">
        <div className="bg-bb-rose/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
          <Lock className="w-8 h-8 text-bb-rose" />
        </div>
        
        <h1 className="text-4xl font-serif mb-2 text-bb-ink italic">Bienvenue</h1>
        <p className="text-bb-ink/40 text-xs font-black uppercase tracking-[.3em] mb-12">Accès Réservé Admin</p>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <input 
              type="text" 
              placeholder="Utilisateur" 
              className="w-full bg-white border border-bb-beige px-8 py-5 rounded-full outline-none focus:border-bb-rose/50 transition-all text-center font-bold text-bb-ink text-sm shadow-sm"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              className="w-full bg-white border border-bb-beige px-8 py-5 rounded-full outline-none focus:border-bb-rose/50 transition-all text-center font-bold text-bb-ink text-sm shadow-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-500 text-xs font-bold uppercase tracking-wider animate-shake">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-bb-ink text-bb-cream py-5 rounded-full font-black uppercase tracking-[.4em] text-[10px] hover:bg-bb-rose transition-all shadow-xl hover:shadow-bb-rose/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "S'identifier"}
          </button>
        </form>
      </FadeIn>
    </div>
  );
}
