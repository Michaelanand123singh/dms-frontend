"use client";
"use client";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Calendar, User, Car } from "lucide-react";
import type { JobCard } from "@/shared/types";
import { defaultJobCards } from "@/__mocks__/data/job-cards.mock";
import { localStorage as safeStorage } from "@/shared/lib/localStorage";

interface AdvisorJobCardPageProps {
  params: {
    id: string;
  };
  searchParams?: {
    temp?: string;
  };
}

const fetchJobCard = (id: string): JobCard | undefined => {
  if (typeof window !== "undefined") {
    const stored = safeStorage.getItem<JobCard[]>("jobCards", []);
    const merged = [...stored, ...defaultJobCards];
    return merged.find((card) => card.id === id || card.jobCardNumber === id);
  }
  return defaultJobCards.find((card) => card.id === id || card.jobCardNumber === id);
};

const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : "—");

interface PartLine {
  warrantyTag: string;
  description: string;
  itemType: "Part" | "Work Item";
  qty: string;
  amount?: string;
  technician?: string;
}

const samplePartLines: PartLine[] = [
  {
    warrantyTag: "RQL251113259818",
    description: "2W0000000027_011 – Front Fender Jet Black",
    itemType: "Part",
    qty: "1.00",
    amount: "₹4,200",
    technician: "Engineer Rohan",
  },
  {
    warrantyTag: "RQL251113259820",
    description: "2W0000001915_011 – Hinge Flap Jet Black",
    itemType: "Part",
    qty: "1.00",
    amount: "₹1,600",
    technician: "Engineer Rohan",
  },
  {
    warrantyTag: "RQL251113259819",
    description: "OELB510742 – Front Fender – Labour – R And R",
    itemType: "Work Item",
    qty: "15.00",
    technician: "Senior Technician",
    amount: "₹2,500",
  },
];

const parsePartName = (description: string): { partCode: string; partName: string; labourCode: string } => {
  const [codePart, ...rest] = description.split("–").map((segment) => segment.trim());
  const partCodeMatch = codePart.match(/^[A-Za-z0-9_]+/);
  const partNameRaw = rest.join("–").trim().split(" - ")[0] || codePart;
  const partName = partNameRaw
    .split(",")[0]
    .replace(/[_]/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();

  const itemType = description.includes("Labour") ? "Work Item" : "Part";
  const labourCode = itemType === "Work Item" ? "R & R" : "Auto Select With Part";

  return {
    partCode: partCodeMatch ? partCodeMatch[0] : codePart,
    partName,
    labourCode,
  };
};

const buildPartSection = () => {
  return samplePartLines.map((line, index) => {
    const { partCode, partName, labourCode } = parsePartName(line.description);
    return {
      sr_no: String(index + 1),
      part_warranty_tag: line.warrantyTag,
      part_name: partName,
      part_code: partCode,
      qty: line.qty,
      amount: line.amount || "0",
      technician: line.technician || "",
      labour_code: labourCode,
    };
  });
};

export default function AdvisorJobCardDetailPage({ params, searchParams }: AdvisorJobCardPageProps) {
  const jobCard = fetchJobCard(params.id);
  const isTemporaryView = searchParams?.temp === "true" || jobCard?.isTemporary;

  if (!jobCard) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-white px-8 py-6 text-center">
          <ClipboardList className="mx-auto text-red-600" size={32} />
          <p className="mt-4 text-lg font-semibold text-gray-900">Job card not found</p>
          <p className="text-sm text-gray-500">The job card you requested does not exist or may have been removed.</p>
          <Link className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800" href="/sc/job-cards">
            <ArrowLeft size={16} />
            Back to job cards
          </Link>
        </div>
      </div>
    );
  }

  const serialNumbers = [
    { label: "Battery Serial Number", value: "BAT-XXXX" },
    { label: "MCU Serial Number", value: "MCU-XXXX" },
    { label: "VCU Serial Number", value: "VCU-XXXX" },
    { label: "Other Part Number", value: "PRT-XXXX" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-600">Job Card Layout</p>
            <h1 className="text-3xl font-semibold text-gray-900">{jobCard.jobCardNumber}</h1>
            <p className="text-sm text-gray-500">{formatDate(jobCard.createdAt)} • {jobCard.status}</p>
          </div>
          {isTemporaryView && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-700">
              Temporary job card (official copy generated after quotation approval)
            </div>
          )}
          <Link
            href="/sc/job-cards"
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-indigo-400"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
        </div>

        {/* Part 1 */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{jobCard.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Mobile Number</p>
                <p className="text-lg font-semibold text-gray-900">98765 43210</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Customer Type</p>
                <p className="text-lg font-semibold text-gray-900">B2C</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Vehicle Brand</p>
                <p className="text-lg font-semibold text-gray-900">{jobCard.vehicle.split(" ")[0]}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Vehicle Model</p>
                <p className="text-lg font-semibold text-gray-900">{jobCard.vehicle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Registration Number</p>
                <p className="text-lg font-semibold text-gray-900">{jobCard.registration}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">VIN / Chassis</p>
                <p className="text-lg font-semibold text-gray-900">VIN-XXXX-XXXX</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Variant / Battery</p>
                <p className="text-lg font-semibold text-gray-900">Signature • 32 kWh</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Warranty Status</p>
                <p className="text-lg font-semibold text-gray-900">In Warranty</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase text-gray-500">Estimated Delivery</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(jobCard.createdAt)}</p>
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs uppercase text-gray-500">Customer Address</p>
              <p className="text-sm text-gray-700">14, Service Lane, Sector 21, Gurgaon</p>
              <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
                Customer feedback: "Brake noise during regen"
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-700">
              <p className="text-xs uppercase text-gray-500">Technician Observation</p>
              <p>Brake pads showing uneven wear.</p>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-700">
              <p className="text-xs uppercase text-gray-500">Insurance</p>
              <p>Start: 01 Jan 2024 • End: 31 Dec 2024<br />FutureSure Insurance</p>
            </div>
            <div className="rounded-2xl border border-dashed border-gray-200 p-4 text-sm text-gray-700">
              <p className="text-xs uppercase text-gray-500">Concerns</p>
              <p>{jobCard.description}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <p className="text-xs uppercase text-gray-500">Serial Numbers</p>
            <div className="flex flex-wrap gap-3">
              {serialNumbers.map((serial) => (
                <div key={serial.label} className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700">
                  <span className="text-[10px] uppercase text-gray-500">{serial.label}</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{serial.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Part 2 */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase text-gray-500">Part Details & Warranty Tags</p>
              <h2 className="text-xl font-semibold text-gray-900">Structured Job Card Part Lines</h2>
            </div>
            <button className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              <ClipboardList size={14} />
              Warranty Link
            </button>
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 text-sm text-gray-700">
            <div className="grid grid-cols-12 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <span className="col-span-1">SR No</span>
              <span className="col-span-2">Part Warranty Tag</span>
              <span className="col-span-2">Part Name</span>
              <span className="col-span-2">Part Code</span>
              <span className="col-span-1">Qty</span>
              <span className="col-span-1">Amount</span>
              <span className="col-span-2">Technician</span>
              <span className="col-span-1">Labour Code</span>
            </div>
            {buildPartSection().map((line) => (
              <div key={line.part_warranty_tag} className="grid grid-cols-12 px-4 py-3">
                <span className="col-span-1 font-semibold">{line.sr_no}</span>
                <span className="col-span-2 text-indigo-600">{line.part_warranty_tag}</span>
                <span className="col-span-2">{line.part_name}</span>
                <span className="col-span-2">{line.part_code}</span>
                <span className="col-span-1">{line.qty}</span>
                <span className="col-span-1">{line.amount}</span>
                <span className="col-span-2">{line.technician || "—"}</span>
                <span className="col-span-1">{line.labour_code}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Part 2A Row, Part 3 replaced with summary */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-gray-500">Warranty / Insurance Evidence</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {["Video Evidence", "VIN Image", "ODO Meter Image", "Damage Photos"].map((item) => (
                  <button
                    key={item}
                    className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-700 hover:border-indigo-400"
                  >
                    {item}
                    <span className="text-indigo-600">Upload</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="text-xs uppercase text-gray-500">Issue Details</p>
              <p>Description: {jobCard.description}</p>
              <p>Observations: 02</p>
              <p>Symptom: Loss of regen effect</p>
              <p>Defect Part: {jobCard.parts[0]}</p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-gray-100 bg-slate-50 p-4 text-sm text-gray-700">
            <p className="text-xs uppercase text-gray-500">Requisition Summary</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-gray-900">{jobCard.jobCardNumber}</p>
                <p className="text-xs text-gray-500">Job Card</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{jobCard.parts.length} Parts</p>
                <p className="text-xs text-gray-500">Requested</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">ERP Approved</p>
                <p className="text-xs text-gray-500">Approval Mail stored</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Cost ₹{jobCard.parts.length * 1500}</p>
                <p className="text-xs text-gray-500">Includes duties</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

