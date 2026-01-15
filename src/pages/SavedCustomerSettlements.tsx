import { SavedCustomerSettlementsSection } from "@/components/SavedCustomerSettlementsSection";

export const SavedCustomerSettlements = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  return (
    <SavedCustomerSettlementsSection 
      username={username}
      onBack={onBack}
      onLogout={onLogout}
    />
  );
};