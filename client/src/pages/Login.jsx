import React, { useState } from "react";
import api from "../services/api";

export default function Login({ onNavigate, onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await api.post("/auth/login", { email, password });

            if (res.data.success) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));
                api.setToken(res.data.token);

                if (onLogin) onLogin(res.data.user);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    }

    function handleGoogleLogin() {
        window.location.href = `${import.meta.env.VITE_API_URL || "https://mindgrid-2.onrender.com"
            }/auth/google`;
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Welcome Back</h2>

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {error && <div className="form-error">{error}</div>}

                    <button type="submit" disabled={loading}>
                        {loading ? "Logging in..." : "Sign In"}
                    </button>
                </form>

                <div className="divider">OR</div>

                <button className="google" onClick={handleGoogleLogin}>
                    <span>🔵</span>
                    <span>Continue with Google</span>
                </button>

                <div className="auth-footer">
                    Don't have an account?
                    <a onClick={() => onNavigate("signup")}> Sign up here</a>
                </div>
            </div>
        </div>
    );
}
