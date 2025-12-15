/**
 * Shared Form Utilities
 * Common utilities for form components across inventory manager
 */

/**
 * Common label styling classes
 */
export const LABEL_CLASSES = "block text-sm font-medium text-gray-700 mb-1";

/**
 * Common input styling classes
 */
export const INPUT_CLASSES = "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

/**
 * Common textarea styling classes
 */
export const TEXTAREA_CLASSES = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500";

/**
 * Generic handleChange function for form components
 */
export function createFormChangeHandler<T extends Record<string, any>>(
  formData: T,
  onFormChange: (data: T) => void
) {
  return (field: keyof T, value: any) => {
    onFormChange({
      ...formData,
      [field]: value,
    });
  };
}

