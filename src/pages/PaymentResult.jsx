import React, { useState, useEffect } from "react";
import { Check, X, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, updateUser, token, logout } = useAuth();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your payment...");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (orderId) {
      verifyPayment();
    } else {
      setStatus("error");
      setMessage("No order ID found in URL");
    }
  }, [orderId]);

  const verifyPayment = async () => {
    if (!orderId) {
      setStatus("error");
      setMessage("No order ID found");
      return;
    }

    if (!token) {
      setStatus("error");
      setMessage("Please login to verify payment");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await fetch(`${API_URL}/api/payments/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      console.log("Payment verification response:", data);

      if (!response.ok) {
        if (response.status === 401) {
          setStatus("error");
          setMessage("Session expired. Please login again.");
          logout();
          return;
        }
        console.warn("Payment verification API error:", data);
        setStatus("pending");
        setMessage("Payment verification in progress... Please wait.");
        
        // Retry after delay
        setTimeout(() => {
          verifyPayment();
        }, 3000);
        return;
      }

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "Payment completed successfully! Your plan has been upgraded.");
        setPaymentDetails(data);

        // Update user context with new plan if user data is returned
        if (data.user && updateUser) {
          console.log("Updating user context with:", data.user);
          
          // Force update the user context with new plan data
          updateUser({
            ...user,
            plan: data.user.plan || user.plan,
            planId: data.user.planId || user.planId,
            subscriptionStatus: data.user.subscriptionStatus || user.subscriptionStatus,
            isPremium: data.user.isPremium || user.isPremium,
            planExpiryDate: data.user.planExpiryDate || user.planExpiryDate
          });
        }

        // If plan is still showing as Free, try to fetch user data directly
        if (data.user?.plan === "Free" || !data.user?.plan) {
          console.warn("Plan still showing as Free after payment, fetching user data...");
          fetchUserPlan();
        }
      } else {
        // Check if payment might be successful in database despite verification error
        console.log("Payment verification returned false, checking status:", data);
        
        if (data.orderStatus === "PENDING" || data.orderStatus === "ACTIVE") {
          setStatus("pending");
          setMessage("Payment is being processed... Please wait a moment.");
          
          // Retry after delay
          setTimeout(() => {
            verifyPayment();
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Payment verification failed. Please contact support.");
        }
      }
    } catch (error) {
      console.error("Payment verification error:", error);
      
      // If network error, retry
      if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
        setStatus("pending");
        setMessage("Network error. Retrying...");
        
        setTimeout(() => {
          verifyPayment();
        }, 3000);
      } else {
        setStatus("pending");
        setMessage("Finalizing payment... Please wait.");
        
        // Retry on error
        setTimeout(verifyPayment, 3000);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to fetch user plan directly
  const fetchUserPlan = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/users/current-plan`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && updateUser) {
          console.log("Fetched user plan:", data);
          updateUser({
            ...user,
            plan: data.plan || user.plan,
            planId: data.planId || user.planId,
            subscriptionStatus: data.subscriptionStatus || user.subscriptionStatus,
            isPremium: data.isPremium || user.isPremium,
            planExpiryDate: data.planExpiryDate || user.planExpiryDate
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user plan:", error);
    }
  };

  const getIcon = () => {
    switch (status) {
      case "success":
        return <Check className="h-16 w-16 text-green-500" />;
      case "error":
        return <X className="h-16 w-16 text-red-500" />;
      default:
        return <Clock className="h-16 w-16 text-blue-500 animate-spin" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "success":
        return "Payment Successful!";
      case "error":
        return "Payment Failed";
      default:
        return "Processing Payment";
    }
  };

  const getPlanDetails = () => {
    if (status === "success" && paymentDetails) {
      return (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-green-800 font-semibold">
            Plan: {paymentDetails.planName || paymentDetails.user?.plan || "Pro"}
          </p>
          <p className="text-green-600 text-sm">
            Billing Cycle: {paymentDetails.billingCycle === "annual" ? "Annual" : "Monthly"}
          </p>
          <p className="text-green-600 text-sm">
            Amount: {paymentDetails.orderCurrency} {paymentDetails.orderAmount}
          </p>
          <p className="text-green-600 text-sm mt-2">
            ✓ Your plan has been upgraded successfully!
          </p>
          {paymentDetails.user?.plan === "Free" && (
            <p className="text-yellow-600 text-sm mt-2">
              Note: If you still see "Free" plan, please refresh the page or navigate to Dashboard.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handleDashboardClick = () => {
    // Force refresh user data before navigating
    if (token) {
      fetchUserPlan();
    }
    setTimeout(() => {
      navigate("/dashboard");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full mx-auto px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm border text-center">
          <div className="flex justify-center mb-6">{getIcon()}</div>

          <h1 className="text-2xl font-bold mb-4">{getTitle()}</h1>
          <p className="text-gray-600 mb-6">{message}</p>

          {getPlanDetails()}

          <div className="space-y-3 mt-6">
            <Button
              onClick={handleDashboardClick}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              ) : (
                "Go to Dashboard"
              )}
            </Button>

            {status === "success" && (
              <>
                <Button
                  onClick={() => navigate("/tools")}
                  variant="outline"
                  className="w-full"
                  disabled={isUpdating}
                >
                  Start Using Tools
                </Button>
                <Button
                  onClick={() => {
                    fetchUserPlan();
                    navigate("/pricing");
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={isUpdating}
                >
                  <div className="flex items-center justify-center gap-2">
                    View Your Plan
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </Button>
              </>
            )}

            {status === "error" && (
              <Button
                onClick={() => navigate("/pricing")}
                variant="outline"
                className="w-full"
              >
                Back to Pricing
              </Button>
            )}

            {status === "pending" && (
              <Button
                onClick={() => verifyPayment()}
                variant="outline"
                className="w-full"
                disabled={isUpdating}
              >
                {isUpdating ? "Checking..." : "Check Status Again"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;