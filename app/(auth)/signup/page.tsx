"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ICONS } from "@/constants";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const SignupPage = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [plans, setPlans] = useState<any[]>([]);

  // Form Data
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("company");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [error, setError] = useState("");

  const ORG_TYPES = [
    { value: "techpark", label: "Tech Park" },
    { value: "block", label: "Block" },
    { value: "building", label: "Building" },
    { value: "company", label: "Company" },
    { value: "school", label: "School" },
  ];

  useEffect(() => {
    // Fetch plans
    fetch("/api/public/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlans(data.data);
          if (data.data.length > 0) {
            setSelectedPlanId(data.data[0].id);
          }
        }
      });

    // Load Razorpay Script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleNextStep = () => {
    setError("");
    if (!orgName || !adminEmail || !adminPassword || !imageFile) {
      setError("Please fill in all details including the logo.");
      return;
    }
    setStep(2);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) throw new Error("No image selected");

    const formData = new FormData();
    formData.append("coverImage", imageFile);

    const res = await fetch("https://wowfy.in/testusr/upload.php", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.filePath; // Now returns full URL due to our PHP fix
  };

  const handlePaymentAndSignup = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Create Razorpay Order
      const orderRes = await fetch("/api/public/signup/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: selectedPlanId }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.error);

      const options = {
        key: "rzp_test_T0iBBSGAyaK3r3", // Test Key
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: "Knockster",
        description: `Subscription for ${orderData.data.plan.name}`,
        order_id: orderData.data.orderId,
        handler: async function (response: any) {
          try {
            // 2. Upload Image
            const imageUrl = await uploadImage();

            // 3. Verify Payment and Create Org
            const verifyRes = await fetch("/api/public/signup/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                planId: selectedPlanId,
                orgName,
                orgType,
                imageUrl,
                adminEmail,
                adminPassword,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyData.success) throw new Error(verifyData.error);

            // Success! Redirect to login
            router.replace("/login");
          } catch (err: any) {
            setError(err.message || "Failed to finalize signup");
            setLoading(false);
          }
        },
        prefill: {
          email: adminEmail,
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        setError(response.error.description);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#FDFDFE] relative overflow-hidden selection:bg-purple-200">
      {/* Soft Animated Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[0%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-purple-400/20 to-indigo-400/20 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute -bottom-[20%] right-[0%] w-[50%] h-[70%] rounded-full bg-gradient-to-bl from-blue-400/20 to-cyan-300/20 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="w-full max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10 my-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200 ring-4 ring-white">
            <ICONS.ShieldCheck className="text-white w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-900 to-purple-800 tracking-tighter">
              Knockster
            </h1>
            <p className="text-purple-600/80 mt-2 font-bold tracking-widest uppercase text-xs">
              Create your organization account
            </p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-purple-900/5 border border-white">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <ICONS.Failure size={16} />
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Org Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                  />
                </div>

                {/* Org Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    Type
                  </label>
                  <select
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                    className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                  >
                    {ORG_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Admin Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                  />
                </div>

                {/* Admin Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 focus:border-purple-400 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
                  Organization Logo (Required)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-white/50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-100 transition-all text-sm font-medium file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              <button
                onClick={handleNextStep}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2"
              >
                Choose Plan <ICONS.ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-slate-400 hover:text-slate-600 font-medium text-sm"
                >
                  ← Back to Details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer border-2 rounded-3xl p-6 transition-all ${
                      selectedPlanId === plan.id
                        ? "border-purple-500 bg-purple-50 shadow-xl shadow-purple-100 ring-4 ring-purple-500/10"
                        : "border-slate-100 hover:border-purple-200 bg-white/50"
                    }`}
                  >
                    <h3 className="font-bold text-lg text-slate-900">
                      {plan.name}
                    </h3>
                    <p className="text-2xl font-black text-purple-600 mt-2">
                      ₹{plan.price}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600 font-medium">
                      <li>• {plan.maxGuards} Guards allowed</li>
                      <li>• {plan.maxGuestPasses} Passes/month</li>
                      <li>• L1 Security {plan.allowL1 ? "✓" : "✗"}</li>
                      <li>• L2 Security {plan.allowL2 ? "✓" : "✗"}</li>
                      <li>• L3 Security {plan.allowL3 ? "✓" : "✗"}</li>
                      <li>• L4 Security {plan.allowL4 ? "✓" : "✗"}</li>
                    </ul>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePaymentAndSignup}
                disabled={loading || !selectedPlanId}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Pay & Subscribe"
                )}
              </button>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-400 font-medium text-center">
          Already have an account?{" "}
          <a href="/login" className="text-purple-600 font-bold hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
