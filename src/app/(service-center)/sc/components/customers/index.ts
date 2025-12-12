export type {
  CustomerWithVehicles,
  CustomerType,
  Vehicle,
  NewCustomerForm,
  NewVehicleForm,
} from "@/shared/types";

export { useCustomerSearch } from "../../../../../hooks/api";
export {
  validatePhone,
  validateEmail,
  validateVIN,
  cleanPhone,
} from "@/shared/utils/validation";
