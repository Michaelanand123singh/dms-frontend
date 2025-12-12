"use client";
import React from "react";

// Re-export consolidated components from shared directory
export { FormInput, FormSelect, FormTextarea, FormField } from "@/components/forms";
export { Modal } from "@/components/ui/Modal";

// Note: This file serves as a compatibility layer for imports from
// sc/components/shared. Prefer importing directly from @/components when convenient.
