"use client";

import React, { useState, FormEvent } from "react";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // For now just simulate login – later you can call your API here
    setTimeout(() => {
      alert(
        `Logged in as:\nEmail: ${form.email}\n(Password not shown)`
      );
      setLoading(false);
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#050816",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#111827",
          borderRadius: "16px",
          padding: "2rem",
          boxShadow: "0 18px 40px rgba(0,0,0,0.6)",
          color: "#f9fafb",
        }}
      >
        <h1
          style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            textAlign: "center",
            marginBottom: "0.25rem",
          }}
        >
          CineRate
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            textAlign: "center",
            color: "#9ca3af",
            marginBottom: "1.5rem",
          }}
        >
          Log in to rate and review your favourite movies
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#020617",
              color: "#f9fafb",
              outline: "none",
              marginBottom: "0.9rem",
            }}
          />

          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              marginBottom: "0.25rem",
            }}
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "0.6rem 0.75rem",
              borderRadius: "8px",
              border: "1px solid #374151",
              background: "#020617",
              color: "#f9fafb",
              outline: "none",
              marginBottom: "1.2rem",
            }}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.65rem",
              borderRadius: "999px",
              border: "none",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? "#4b5563" : "#eab308",
              color: "#020617",
              marginBottom: "0.8rem",
            }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p
          style={{
            fontSize: "0.8rem",
            textAlign: "center",
            color: "#9ca3af",
            marginBottom: "0.4rem",
          }}
        >
          New to CineRate? <strong>Sign up</strong> to start rating.
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
