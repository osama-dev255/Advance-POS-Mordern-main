import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { FileText, Calendar, User, CreditCard, Eye, Download, Trash2, Printer } from "lucide-react";

interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  rate?: number;
  amount?: number;
  price?: number;  // For backward compatibility
  unit?: string;
}

interface SavedInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  paymentMethod: string;
  status: "completed" | "pending" | "cancelled" | "refunded";
  itemsList?: InvoiceItem[];
}

interface SavedInvoicesCardProps {
  invoice: SavedInvoice;
  onViewDetails: () => void;
  onPrintInvoice: () => void;
  onDownloadInvoice: () => void;
  onDeleteInvoice: () => void;
  className?: string;
}

export const SavedInvoicesCard = ({ 
  invoice, 
  onViewDetails,
  onPrintInvoice,
  onDownloadInvoice,
  onDeleteInvoice,
  className 
}: SavedInvoicesCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "refunded": return "destructive";
      case "pending": return "secondary";
      case "cancelled": return "outline";
      default: return "default";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice #{invoice.invoiceNumber}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              {formatDate(invoice.date)}
            </p>
          </div>
          <Badge variant={getStatusVariant(invoice.status)}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{invoice.customer}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{invoice.items} items</span>
            </div>
            <div className="font-bold">{formatCurrency(invoice.total)}</div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Payment:</span>
            <span className="capitalize">{invoice.paymentMethod}</span>
          </div>
          
          {/* Items Table Section */}
          {invoice.itemsList && invoice.itemsList.length > 0 && (
            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
              >
                <span>Items Details</span>
                <svg 
                  className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Button>
              
              {expanded && (
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-2 text-xs sm:text-sm">Item</th>
                        <th className="text-left p-2 text-xs sm:text-sm">Description</th>
                        <th className="text-right p-2 text-xs sm:text-sm">Qty</th>
                        <th className="text-left p-2 text-xs sm:text-sm">Unit</th>
                        <th className="text-right p-2 text-xs sm:text-sm">Rate</th>
                        <th className="text-right p-2 text-xs sm:text-sm">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.itemsList.map((item, index) => (
                        <tr 
                          key={item.id || index} 
                          className={index % 2 === 0 ? "bg-muted/50" : ""}
                        >
                          <td className="p-2 text-xs sm:text-sm">{index + 1}</td>
                          <td className="p-2 text-xs sm:text-sm">{item.name}</td>
                          <td className="p-2 text-right text-xs sm:text-sm">{item.quantity}</td>
                          <td className="p-2 text-xs sm:text-sm">{item.unit || ''}</td>
                          <td className="p-2 text-right text-xs sm:text-sm">{formatCurrency(item.rate ?? item.price ?? 0)}</td>
                          <td className="p-2 text-right text-xs sm:text-sm font-medium">{formatCurrency(item.amount ?? (item.price != null && item.quantity != null ? item.price * item.quantity : 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onViewDetails}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onPrintInvoice}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onDownloadInvoice}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onDeleteInvoice}
              title="Delete Invoice"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};