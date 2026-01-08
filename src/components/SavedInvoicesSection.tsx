import { useState, useEffect, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download, Printer } from "lucide-react";
import { SavedInvoicesCard } from "./SavedInvoicesCard";
import { getSavedInvoices, deleteInvoice, InvoiceData } from "@/utils/invoiceUtils";
import { PrintUtils } from "@/utils/printUtils";
import { InvoiceDetails } from "@/components/InvoiceDetails";
import { ExportUtils } from "@/utils/exportUtils";

interface SavedInvoicesSectionProps {
  onBack: () => void;
  onLogout: () => void;
  username: string;
}

export const SavedInvoicesSection = ({ onBack, onLogout, username }: SavedInvoicesSectionProps) => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState<InvoiceData | null>(null);

  // Load saved invoices from database
  useEffect(() => {
    const loadInvoices = async () => {
      try {
        setLoading(true);
        const savedInvoices = await getSavedInvoices();
        setInvoices(savedInvoices);
      } catch (error) {
        console.error("Error loading saved invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();

    // Listen for storage changes to update invoices in real-time
    const handleStorageChange = () => {
      loadInvoices();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteInvoice = (invoiceId: string) => {
    try {
      deleteInvoice(invoiceId);
      // Update the state to reflect the deletion
      setInvoices(prev => prev.filter(invoice => invoice.id !== invoiceId));
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const handlePrintInvoice = (invoice: InvoiceData) => {
    // Create a transaction object for printing
    const transaction = {
      id: invoice.id,
      receiptNumber: invoice.invoiceNumber,
      date: invoice.date,
      items: invoice.itemsList || [],
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      discount: invoice.discount || 0,
      total: invoice.total,
      paymentMethod: invoice.paymentMethod,
      amountReceived: invoice.amountReceived || invoice.total,
      change: invoice.change || 0,
      customer: { name: invoice.customer }
    };

    PrintUtils.printReceipt(transaction);
  };

  const handleDownloadInvoice = (invoice: InvoiceData) => {
    // Create a transaction object for PDF export
    const transaction = {
      id: invoice.id,
      receiptNumber: invoice.invoiceNumber,
      date: invoice.date,
      items: invoice.itemsList || [],
      subtotal: invoice.subtotal || 0,
      tax: invoice.tax || 0,
      discount: invoice.discount || 0,
      total: invoice.total,
      paymentMethod: invoice.paymentMethod,
      amountReceived: invoice.amountReceived || invoice.total,
      change: invoice.change || 0,
      customer: { name: invoice.customer }
    };

    // Export the invoice as PDF
    ExportUtils.exportReceiptAsPDF(transaction, `Invoice_${invoice.invoiceNumber}`);
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setViewingInvoice(invoice);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Render invoice details view if viewing an invoice */}
      {viewingInvoice ? (
        <div className="container mx-auto p-4 sm:p-6">
          <InvoiceDetails
            id={viewingInvoice.id}
            invoiceNumber={viewingInvoice.invoiceNumber}
            date={viewingInvoice.date}
            customer={viewingInvoice.customer}
            items={viewingInvoice.itemsList || []}
            subtotal={viewingInvoice.subtotal || 0}
            discount={viewingInvoice.discount || 0}
            tax={viewingInvoice.tax || 0}
            total={viewingInvoice.total}
            paymentMethod={viewingInvoice.paymentMethod}
            status={viewingInvoice.status as "completed" | "pending" | "cancelled" | "refunded"}
            amountReceived={viewingInvoice.amountReceived || viewingInvoice.total}
            change={viewingInvoice.change || 0}
            onBack={() => setViewingInvoice(null)}
            onPrint={() => handlePrintInvoice(viewingInvoice)}
            onDownload={() => handleDownloadInvoice(viewingInvoice)}
          />
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
                <h1 className="text-xl font-bold">Sales Management</h1>
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
                    <FileText className="h-8 w-8 text-primary" />
                    Saved Invoices
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                    View and manage your saved invoices from completed transactions
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search invoices by number, customer..."
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
                <p>Loading saved invoices...</p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Saved Invoices</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? "No invoices match your search." : "You haven't saved any invoices yet."}
                </p>
                <p className="text-sm text-muted-foreground">
                  Invoices are automatically saved when you complete a transaction in the Sales Terminal.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredInvoices.map((invoice) => (
                  <SavedInvoicesCard
                    key={invoice.id}
                    invoice={{
                      id: invoice.id,
                      invoiceNumber: invoice.invoiceNumber,
                      date: invoice.date,
                      customer: invoice.customer,
                      items: invoice.items,
                      total: invoice.total,
                      paymentMethod: invoice.paymentMethod,
                      status: invoice.status
                    }}
                    onViewDetails={() => handleViewInvoice(invoice)}
                    onPrintInvoice={() => handlePrintInvoice(invoice)}
                    onDownloadInvoice={() => handleDownloadInvoice(invoice)}
                    onDeleteInvoice={() => handleDeleteInvoice(invoice.id)}
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