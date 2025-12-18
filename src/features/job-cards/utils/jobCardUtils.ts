import { JobCardPart2Item } from "../types/job-card.types";

/**
 * Extract part code from description (alphanumeric prefix before dash/comma)
 */
export const extractPartCode = (description: string): string => {
    const match = description.match(/^([A-Z0-9_]+)/i);
    return match ? match[1] : "";
};

/**
 * Extract part name from description (clean name after dash/comma)
 */
export const extractPartName = (description: string): string => {
    // Remove part code prefix and clean up
    let cleaned = description.replace(/^[A-Z0-9_]+[-_]\s*/i, ""); // Remove code prefix
    cleaned = cleaned.split(/[-–—,]/)[0].trim(); // Take first part before dash/comma
    // Capitalize first letter of each word
    return cleaned
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ");
};

/**
 * Extract labour code from work item description
 */
export const extractLabourCode = (description: string): string => {
    const labourMatch = description.match(/labour[:\s-]+(r\s*&\s*r|r\s+and\s+r|.+)/i);
    if (labourMatch) {
        return labourMatch[1].trim();
    }
    return "R & R"; // Default
};

/**
 * Re-generate sequence numbers for part items
 */
export const generateSrNoForPart2Items = (items: JobCardPart2Item[]): JobCardPart2Item[] => {
    return items.map((item, index) => ({
        ...item,
        srNo: index + 1,
    }));
};
