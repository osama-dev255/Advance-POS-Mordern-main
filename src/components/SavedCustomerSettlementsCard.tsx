import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { 
  HandCoins, 
  Calendar, 
  User, 
  CreditCard, 
  Eye, 
  Download, 
  Trash2, 
  Printer 
} from "lucide-react";

interface SavedCustomerSettlement {
  id: string;
  reference: string;
  date: string;
  customerName: string;
  amount: number;
  paymentMethod: string;
  status: "completed" | "pending" | "cancelled";
  previousBalance?: number;
  newBalance?: number;
  processedBy?: string;
  notes?: string;
}

interface SavedCustomerSettlementsCardProps {
  settlement: SavedCustomerSettlement;
  onViewDetails: () => void;
  onPrintSettlement: () => void;
  onDownloadSettlement: () => void;
  onDeleteSettlement: () => void;
  className?: string;
}

export const SavedCustomerSettlementsCard = ({ 
  settlement, 
  onViewDetails,
  onPrintSettlement,
  onDownloadSettlement,
  onDeleteSettlement,
  className 
}: SavedCustomerSettlementsCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "cancelled": return "destructive";
      case "pending": return "secondary";
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
              <HandCoins className="h-5 w-5 text-primary" />
              Settlement #{settlement.reference || 'N/A'}
            </CardTitle>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-4 w-4" />
              {settlement.date ? formatDate(settlement.date) : 'N/A'}
            </p>
          </div>
          <Badge variant={getStatusVariant(settlement.status || 'completed')}>
            {(settlement.status || 'completed').charAt(0).toUpperCase() + (settlement.status || 'completed').slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm truncate">{settlement.customerName || 'Unknown Customer'}</span>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm capitalize">{settlement.paymentMethod || 'N/A'}</span>
            </div>
            <div className="font-bold">{formatCurrency(settlement.amount || 0)}</div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Processed by:</span>
            <span className="capitalize">{settlement.processedBy || 'System'}</span>
          </div>
          
          {/* Additional Details Section */}
          {((settlement.previousBalance !== undefined && settlement.previousBalance !== null && settlement.previousBalance !== 0) || 
           (settlement.newBalance !== undefined && settlement.newBalance !== null && settlement.newBalance !== 0) || 
           (settlement.notes && settlement.notes.trim() !== '')) ? (
            <div className="pt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-between"
                onClick={() => setExpanded(!expanded)}
              >
                <span>More Details</span>
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
                <div className="mt-3 space-y-2 p-3 bg-muted rounded-lg">
                  {settlement.previousBalance !== undefined && settlement.previousBalance !== null && settlement.previousBalance !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Previous Balance:</span>
                      <span>{formatCurrency(settlement.previousBalance)}</span>
                    </div>
                  )}
                  
                  {settlement.newBalance !== undefined && settlement.newBalance !== null && settlement.newBalance !== 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">New Balance:</span>
                      <span>{formatCurrency(settlement.newBalance)}</span>
                    </div>
                  )}
                  
                  {settlement.notes && settlement.notes.trim() !== '' && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1 text-muted-foreground">{settlement.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
          
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
              onClick={onPrintSettlement}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onDownloadSettlement}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onDeleteSettlement}
              title="Delete Settlement"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};