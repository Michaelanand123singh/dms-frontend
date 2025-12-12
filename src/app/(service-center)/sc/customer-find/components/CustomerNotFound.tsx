/**
 * Customer Not Found Component
 */

import { AlertCircle, PlusCircle } from "lucide-react";
import { Button } from "../../components/shared/Button";

export interface CustomerNotFoundProps {
  canCreateNewCustomer: boolean;
  onCreateCustomer: () => void;
}

export function CustomerNotFound({ canCreateNewCustomer, onCreateCustomer }: CustomerNotFoundProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
      <div className="text-center py-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
          <AlertCircle className="text-amber-600" size={32} strokeWidth={2} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Not Found</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {canCreateNewCustomer
            ? "No customer found with the provided search. Would you like to create a new customer?"
            : "No customer found with the provided search. Please contact a service advisor or call center to create a new customer."}
        </p>
        {canCreateNewCustomer && (
          <Button onClick={onCreateCustomer} icon={PlusCircle} className="mx-auto">
            Create New Customer
          </Button>
        )}
      </div>
    </div>
  );
}

