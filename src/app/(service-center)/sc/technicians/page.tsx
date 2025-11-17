"use client";
import { useState } from "react";
import { Users, UserPlus, TrendingUp, Clock, CheckCircle, X, Plus, XCircle } from "lucide-react";

interface Technician {
  id: number;
  name: string;
  status: string;
  currentJobs: number;
  completedToday: number;
  utilization: number;
  skills: string[];
}

export default function Technicians() {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [technicianForm, setTechnicianForm] = useState({
    name: "",
    status: "Available",
    skills: [] as string[],
  });
  const [currentSkill, setCurrentSkill] = useState<string>("");

  const [technicians, setTechnicians] = useState<Technician[]>([
    {
      id: 1,
      name: "Engineer 1",
      status: "Busy",
      currentJobs: 2,
      completedToday: 3,
      utilization: 85,
      skills: ["Engine", "AC", "General"],
    },
    {
      id: 2,
      name: "Engineer 2",
      status: "Available",
      currentJobs: 1,
      completedToday: 2,
      utilization: 65,
      skills: ["Brakes", "Suspension"],
    },
  ]);

  return (
    <div className="bg-[#f9f9fb] min-h-screen">
      <div className="pt-6 pb-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 mb-2">Technicians</h1>
            <p className="text-gray-500">Manage service engineers and their assignments</p>
          </div>
          <button
            onClick={() => {
              setShowAddModal(true);
              setTechnicianForm({
                name: "",
                status: "Available",
                skills: [],
              });
              setCurrentSkill("");
            }}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition shadow-md inline-flex items-center gap-2"
          >
            <UserPlus size={20} />
            Add Technician
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {technicians.map((tech) => (
            <div key={tech.id} className="bg-white rounded-2xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {tech.name.split(" ")[1] || "E"}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{tech.name}</p>
                  <p className="text-sm text-gray-600">{tech.status}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Jobs</span>
                  <span className="font-medium">{tech.currentJobs}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Today</span>
                  <span className="font-medium">{tech.completedToday}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Utilization</span>
                  <span className="font-medium">{tech.utilization}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Technician Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/30 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl w-full max-w-2xl mx-2 max-h-[90vh] overflow-y-auto p-4 md:p-6 z-[101]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Add Technician</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setTechnicianForm({
                    name: "",
                    status: "Available",
                    skills: [],
                  });
                  setCurrentSkill("");
                }}
                className="text-gray-400 hover:text-gray-600 transition p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Technician Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={technicianForm.name}
                      onChange={(e) => setTechnicianForm({ ...technicianForm, name: e.target.value })}
                      placeholder="Enter technician name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={technicianForm.status}
                      onChange={(e) => setTechnicianForm({ ...technicianForm, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      required
                    >
                      <option value="Available">Available</option>
                      <option value="Busy">Busy</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills</h3>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={currentSkill}
                      onChange={(e) => setCurrentSkill(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && currentSkill.trim()) {
                          e.preventDefault();
                          if (!technicianForm.skills.includes(currentSkill.trim())) {
                            setTechnicianForm({
                              ...technicianForm,
                              skills: [...technicianForm.skills, currentSkill.trim()],
                            });
                            setCurrentSkill("");
                          }
                        }
                      }}
                      placeholder="Enter skill and press Enter"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        if (currentSkill.trim() && !technicianForm.skills.includes(currentSkill.trim())) {
                          setTechnicianForm({
                            ...technicianForm,
                            skills: [...technicianForm.skills, currentSkill.trim()],
                          });
                          setCurrentSkill("");
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition inline-flex items-center gap-2"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                  {technicianForm.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {technicianForm.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium inline-flex items-center gap-2"
                        >
                          {skill}
                          <button
                            onClick={() => {
                              setTechnicianForm({
                                ...technicianForm,
                                skills: technicianForm.skills.filter((_, i) => i !== index),
                              });
                            }}
                            className="hover:text-blue-900"
                          >
                            <XCircle size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setTechnicianForm({
                      name: "",
                      status: "Available",
                      skills: [],
                    });
                    setCurrentSkill("");
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!technicianForm.name) {
                      alert("Please enter technician name.");
                      return;
                    }

                    const newTechnician: Technician = {
                      id: technicians.length + 1,
                      name: technicianForm.name,
                      status: technicianForm.status,
                      currentJobs: 0,
                      completedToday: 0,
                      utilization: 0,
                      skills: technicianForm.skills,
                    };

                    setTechnicians([...technicians, newTechnician]);

                    const storedTechnicians = JSON.parse(localStorage.getItem("technicians") || "[]");
                    storedTechnicians.push(newTechnician);
                    localStorage.setItem("technicians", JSON.stringify(storedTechnicians));

                    setShowAddModal(false);
                    setTechnicianForm({
                      name: "",
                      status: "Available",
                      skills: [],
                    });
                    setCurrentSkill("");

                    alert("Technician added successfully!");
                  }}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
                >
                  Add Technician
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

