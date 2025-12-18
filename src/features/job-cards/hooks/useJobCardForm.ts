import { useState, useCallback } from "react";
import { CreateJobCardForm, JobCardPart2Item } from "../types/job-card.types";
import { jobCardAdapter } from "../utils/jobCardAdapter";
import { Quotation } from "@/shared/types/quotation.types";
import { CustomerWithVehicles, Vehicle } from "@/shared/types/vehicle.types";
import { generateJobCardNumber } from "@/shared/utils/job-card.utils";

export interface UseJobCardFormProps {
    initialValues?: Partial<CreateJobCardForm>;
    serviceCenterId: string;
    onSuccess?: (data: any) => void;
    onError?: (error: string) => void;
}

export const useJobCardForm = ({
    initialValues,
    serviceCenterId,
    onSuccess,
    onError,
}: UseJobCardFormProps) => {
    const [form, setForm] = useState<CreateJobCardForm>({
        ...jobCardAdapter.createEmptyForm(),
        ...(initialValues || {}),
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);

    const resetForm = useCallback(() => {
        setForm(jobCardAdapter.createEmptyForm());
        setSelectedQuotation(null);
    }, []);

    const handleSelectQuotation = useCallback((
        quotation: Quotation,
        customer: CustomerWithVehicles,
        vehicle?: Vehicle
    ) => {
        const mappedData = jobCardAdapter.mapQuotationToForm(quotation, customer, vehicle);
        setForm(prev => ({
            ...prev,
            ...mappedData,
        }));
        setSelectedQuotation(quotation);
    }, []);

    const handleSelectCustomer = useCallback((
        customer: CustomerWithVehicles,
        vehicle?: Vehicle
    ) => {
        const mappedData = jobCardAdapter.mapCustomerToForm(customer, vehicle);
        setForm(prev => ({
            ...prev,
            ...mappedData,
        }));
        setSelectedQuotation(null);
    }, []);

    const updateFormField = useCallback(<K extends keyof CreateJobCardForm>(
        field: K,
        value: CreateJobCardForm[K]
    ) => {
        setForm(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const handleAddPartItem = useCallback((item: JobCardPart2Item) => {
        setForm(prev => ({
            ...prev,
            part2Items: [...prev.part2Items, { ...item, srNo: prev.part2Items.length + 1 }]
        }));
    }, []);

    const handleRemovePartItem = useCallback((index: number) => {
        setForm(prev => {
            const newItems = prev.part2Items.filter((_, i) => i !== index);
            // Re-index
            const reIndexed = newItems.map((item, i) => ({ ...item, srNo: i + 1 }));
            return { ...prev, part2Items: reIndexed };
        });
    }, []);

    return {
        form,
        setForm,
        updateFormField,
        isSubmitting,
        setIsSubmitting,
        selectedQuotation,
        resetForm,
        handleSelectQuotation,
        handleSelectCustomer,
        handleAddPartItem,
        handleRemovePartItem,
    };
};
