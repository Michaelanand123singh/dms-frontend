"use client";
import React from "react";

// Re-export consolidated components from shared directory
export { FormInput } from "@/components/forms/FormInput";
export { FormSelect } from "@/components/forms/FormSelect";
export { Modal } from "@/components/ui/Modal";

// Note: The Modal, FormInput, and FormSelect components are now imported from
// the consolidated shared components directory. This file serves as a compatibility
// layer for existing code that imports from this location.
// 
// TODO: Update all imports to use @/components directly and remove this file.
