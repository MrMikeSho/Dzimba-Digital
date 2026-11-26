import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import CashFlowPanel from "@/components/CashFlowPanel";

export default function CashFlow() {
  const { isAuthenticated, isBroker } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <div className="pt-28 md:pt-32 pb-24 px-[4%] md:px-[2%] max-w-[800px] mx-auto">
      <h1 className="font-display text-display-md font-light mb-2">Cash flow</h1>
      {isBroker && (
        <Link to="/broker" className="text-sm text-primary hover:underline">← Broker panel</Link>
      )}
      <div className="mt-8">
        <CashFlowPanel canEdit={isBroker} />
      </div>
    </div>
  );
}
