import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Truck, Calendar, CreditCard, Printer, Download, Eye, Trash2 } from "lucide-react";
import { SavedSupplierSettlementsCard } from "./SavedSupplierSettlementsCard";
import { getSavedSupplierSettlements, deleteSupplierSettlement } from "@/utils/supplierSettlementUtils";
import { PrintUtils } from "@/utils/printUtils";
import { ExportUtils } from "@/utils/exportUtils";

interface SavedSupplierSettlement {
  id: string;
  supplierName: string;
  supplierId?: string;
  supplierPhone?: string;
  supplierEmail?: string;
  referenceNumber: string;
  settlementAmount: number;
  paymentMethod: string;
  processedBy?: string;
  poNumber?: string;
  previousBalance?: number;
  amountPaid?: number;
  newBalance?: number;
  notes?: string;
  date: string;
  time?: string;
  status?: "completed" | "pending" | "cancelled";
}

interface SavedSupplierSettlementsSectionProps {
  onBack: () => void;
  onLogout: () => void;
  username: string;
}

export const SavedSupplierSettlementsSection = ({ onBack, onLogout, username }: SavedSupplierSettlementsSectionProps) => {
  const [settlements, setSettlements] = useState<SavedSupplierSettlement[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingSettlement, setViewingSettlement] = useState<SavedSupplierSettlement | null>(null);

  // Load saved settlements from database
  useEffect(() => {
    const loadSettlements = async () => {
      try {
        setLoading(true);
        const savedSettlements = await getSavedSupplierSettlements();
        setSettlements(savedSettlements);
      } catch (error) {
        console.error("Error loading settlements:", error);
        setSettlements([]);
      } finally {
        setLoading(false);
      }
    };
      
    loadSettlements();
      
    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'savedSupplierSettlements') {
        loadSettlements();
      }
    };
      
    // Listen for manual refresh events
    const handleRefresh = () => {
      loadSettlements();
    };
      
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('refreshSupplierSettlements', handleRefresh);
      
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('refreshSupplierSettlements', handleRefresh);
    };
  }, []);

  // Filter settlements based on search term
  const filteredSettlements = settlements.filter(settlement => {
    const matchesSearch = 
      settlement.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      settlement.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (settlement.poNumber && settlement.poNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleDeleteSettlement = (settlementId: string) => {
    try {
      deleteSupplierSettlement(settlementId);
      // The state will be updated automatically via the refreshSupplierSettlements event listener
    } catch (error) {
      console.error("Error deleting settlement:", error);
    }
  };

  const handlePrintSettlement = (settlement: SavedSupplierSettlement) => {
    // Create a settlement object for printing
    const settlementToPrint = {
      id: settlement.id,
      referenceNumber: settlement.referenceNumber,
      date: settlement.date,
      supplierName: settlement.supplierName,
      settlementAmount: settlement.settlementAmount,
      paymentMethod: settlement.paymentMethod,
      processedBy: settlement.processedBy,
      poNumber: settlement.poNumber,
      previousBalance: settlement.previousBalance,
      amountPaid: settlement.amountPaid,
      newBalance: settlement.newBalance,
      notes: settlement.notes,
      status: settlement.status,
      time: settlement.time,
      supplierPhone: settlement.supplierPhone,
      supplierEmail: settlement.supplierEmail
    };

    // Using PrintUtils to print the settlement
    PrintUtils.printSupplierSettlement(settlementToPrint);
  };

  const handleDownloadSettlement = (settlement: SavedSupplierSettlement) => {
    // Create a settlement object for PDF export
    const settlementToExport = {
      id: settlement.id,
      referenceNumber: settlement.referenceNumber,
      date: settlement.date,
      supplierName: settlement.supplierName,
      settlementAmount: settlement.settlementAmount,
      paymentMethod: settlement.paymentMethod,
      processedBy: settlement.processedBy,
      poNumber: settlement.poNumber,
      previousBalance: settlement.previousBalance,
      amountPaid: settlement.amountPaid,
      newBalance: settlement.newBalance,
      notes: settlement.notes,
      status: settlement.status,
      time: settlement.time,
      supplierPhone: settlement.supplierPhone,
      supplierEmail: settlement.supplierEmail
    };

    // Export the settlement as PDF
    ExportUtils.exportSupplierSettlementAsPDF(settlementToExport, `Supplier-Settlement-${settlement.referenceNumber}`);
  };

  const handleViewSettlement = (settlement: SavedSupplierSettlement) => {
    setViewingSettlement(settlement);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Render settlement details view if viewing a settlement */}
      {viewingSettlement ? (
        <div className="container mx-auto p-4 sm:p-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Settlement Details</h2>
              <Button variant="outline" onClick={() => setViewingSettlement(null)}>
                Back to Settlements
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Settlement Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Reference:</span> {viewingSettlement.referenceNumber}</p>
                  <p><span className="font-medium">Date:</span> {viewingSettlement.date}</p>
                  <p><span className="font-medium">Time:</span> {viewingSettlement.time}</p>
                  <p><span className="font-medium">PO Number:</span> {viewingSettlement.poNumber || 'N/A'}</p>
                  <p><span className="font-medium">Status:</span> {viewingSettlement.status || 'completed'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Supplier Information</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Name:</span> {viewingSettlement.supplierName}</p>
                  <p><span className="font-medium">Phone:</span> {viewingSettlement.supplierPhone}</p>
                  <p><span className="font-medium">Email:</span> {viewingSettlement.supplierEmail}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Financial Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Previous Balance:</span> {viewingSettlement.previousBalance?.toLocaleString()}</p>
                  <p><span className="font-medium">Amount Paid:</span> {viewingSettlement.amountPaid?.toLocaleString()}</p>
                  <p><span className="font-medium">New Balance:</span> {viewingSettlement.newBalance?.toLocaleString()}</p>
                  <p><span className="font-medium">Total Settlement:</span> {viewingSettlement.settlementAmount?.toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
                <div className="space-y-2">
                  <p><span className="font-medium">Payment Method:</span> {viewingSettlement.paymentMethod}</p>
                  <p><span className="font-medium">Processed By:</span> {viewingSettlement.processedBy}</p>
                  <p><span className="font-medium">Notes:</span> {viewingSettlement.notes || 'None'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button variant="outline" onClick={() => handlePrintSettlement(viewingSettlement)}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" onClick={() => handleDownloadSettlement(viewingSettlement)}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  ← Back
                </button>
                <h1 className="text-xl font-bold">Supplier Settlements</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Welcome, {username}</span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            </div>
          </div>

          <main className="container mx-auto p-4 sm:p-6">
            <div className="mb-8 sm:mb-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 flex items-center gap-2">
                    <Truck className="h-8 w-8 text-primary" />
                    Saved Supplier Settlements
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                    View and manage your saved supplier settlements from completed transactions
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search settlements by reference, supplier..."
                      className="pl-10 py-5 text-responsive-base w-64"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading saved settlements...</p>
              </div>
            ) : filteredSettlements.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Saved Settlements</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No settlements match your search." : "You haven't saved any settlements yet."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Settlements are automatically saved when you complete a supplier settlement transaction.
                </p>
                {settlements.length > 0 && filteredSettlements.length === 0 && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Showing {settlements.length} total settlement(s), but none match your search "{searchTerm}".
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredSettlements.map((settlement) => (
                  <SavedSupplierSettlementsCard
                    key={settlement.id}
                    settlement={{
                      id: settlement.id,
                      reference: settlement.referenceNumber,
                      date: settlement.date,
                      supplierName: settlement.supplierName,
                      amount: settlement.settlementAmount,
                      paymentMethod: settlement.paymentMethod,
                      status: settlement.status || "completed",
                      previousBalance: settlement.previousBalance,
                      newBalance: settlement.newBalance,
                      processedBy: settlement.processedBy,
                      poNumber: settlement.poNumber,
                      notes: settlement.notes
                    }}
                    onViewDetails={() => handleViewSettlement(settlement)}
                    onPrintSettlement={() => handlePrintSettlement(settlement)}
                    onDownloadSettlement={() => handleDownloadSettlement(settlement)}
                    onDeleteSettlement={() => handleDeleteSettlement(settlement.id)}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}
    </div>
  );
};