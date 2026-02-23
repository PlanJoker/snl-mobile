// Design: Dark Brutalism + Neon Accent — WAM Calculator
// Brand: #012E2B bg, #FFDC73 accent, JetBrains Mono for numbers
import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, TrendingUp, BookOpen, Calculator } from "lucide-react";
import { useWAMStore, type Semester, type Subject } from "../stores/wamStore";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

const GRADE_COLORS: Record<string, string> = {
  HD: "#4ade80",
  D: "#FFDC73",
  C: "#fb923c",
  P: "#f87171",
  N: "#ef4444",
};

function getGrade(mark: number): string {
  if (mark >= 80) return "HD";
  if (mark >= 70) return "D";
  if (mark >= 60) return "C";
  if (mark >= 50) return "P";
  return "N";
}

function getMarkColor(mark: number): string {
  if (mark >= 80) return "#4ade80";
  if (mark >= 70) return "#FFDC73";
  if (mark >= 60) return "#fb923c";
  if (mark >= 50) return "#f87171";
  return "#ef4444";
}

export default function WAMPage() {
  const {
    semesters, addSemester, removeSemester, updateSemester,
    addSubject, removeSubject, updateSubject,
    addAssignment, removeAssignment, updateAssignment,
    calculateWAM, calculateSemesterWAM,
  } = useWAMStore();

  const [expandedSems, setExpandedSems] = useState<Set<string>>(new Set<string>());
  const [expandedSubs, setExpandedSubs] = useState<Set<string>>(new Set<string>());
  const [newSemName, setNewSemName] = useState("");
  const [showSemForm, setShowSemForm] = useState(false);
  const [addSubjectFor, setAddSubjectFor] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", mark: "", creditPoints: "" });

  const wam = calculateWAM();

  const toggleSem = (id: string) => {
    setExpandedSems((prev) => {
      const next = new Set<string>(Array.from(prev));
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSub = (id: string) => {
    setExpandedSubs((prev) => {
      const next = new Set<string>(Array.from(prev));
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleAddSemester = () => {
    if (!newSemName.trim()) return;
    addSemester(newSemName.trim());
    setNewSemName("");
    setShowSemForm(false);
  };

  const handleAddSubject = (semId: string) => {
    if (!subjectForm.code && !subjectForm.name) return;
    addSubject(semId, subjectForm.code, subjectForm.name);
    // Update mark/credits if provided
    const sem = semesters.find((s) => s.id === semId);
    if (sem && (subjectForm.mark || subjectForm.creditPoints)) {
      // We need the new subject id - get it after add
      setTimeout(() => {
        const updatedSem = useWAMStore.getState().semesters.find((s) => s.id === semId);
        const lastSub = updatedSem?.subjects[updatedSem.subjects.length - 1];
        if (lastSub) {
          updateSubject(semId, lastSub.id, {
            mark: subjectForm.mark ? parseFloat(subjectForm.mark) : null,
            creditPoints: subjectForm.creditPoints ? parseFloat(subjectForm.creditPoints) : null,
          });
        }
      }, 0);
    }
    setSubjectForm({ code: "", name: "", mark: "", creditPoints: "" });
    setAddSubjectFor(null);
  };

  const WAMBar = ({ value, max = 100 }: { value: number; max?: number }) => (
    <div className="h-1.5 bg-[#012E2B] rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${(value / max) * 100}%`, background: getMarkColor(value) }}
      />
    </div>
  );

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="WAM Calculator"
        subtitle="Weighted Average Mark"
        accent
        right={
          <button
            type="button"
            onClick={() => setShowSemForm(!showSemForm)}
            className="flex items-center gap-1.5 bg-[#FFDC73] text-[#012E2B] rounded-xl px-3 py-1.5 text-xs font-bold"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Plus size={12} /> Semester
          </button>
        }
      />

      <div className="px-4 pt-2 pb-4 flex flex-col gap-4">
        {/* Overall WAM */}
        <Card glow className="bg-gradient-to-br from-[#0a3d39] to-[#0d4a45]">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[#8fa8a5] text-xs uppercase tracking-wide font-semibold">Cumulative WAM</p>
              <div className="flex items-end gap-2 mt-1">
                <span
                  className="text-4xl font-black mono"
                  style={{ color: wam !== null ? getMarkColor(wam) : "#8fa8a5" }}
                >
                  {wam !== null ? wam.toFixed(2) : "—"}
                </span>
                {wam !== null && (
                  <span className="text-sm font-bold mb-1" style={{ color: getMarkColor(wam) }}>
                    {getGrade(wam)}
                  </span>
                )}
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#012E2B] flex items-center justify-center">
              <Calculator size={24} className="text-[#FFDC73]" />
            </div>
          </div>
          {wam !== null && <WAMBar value={wam} />}
          <div className="flex gap-3 mt-3">
            {Object.entries(GRADE_COLORS).map(([grade, color]) => (
              <div key={grade} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="text-[10px] text-[#8fa8a5]">{grade}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Add Semester Form */}
        {showSemForm && (
          <Card>
            <p className="text-[#F8F8FF] text-sm font-bold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>New Semester</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Semester 1 2025"
                value={newSemName}
                onChange={(e) => setNewSemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSemester()}
                className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
              />
              <button type="button" onClick={handleAddSemester} className="bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2.5 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Add
              </button>
            </div>
          </Card>
        )}

        {/* Semesters */}
        {semesters.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-6">
              <BookOpen size={32} className="text-[#8fa8a5]" />
              <p className="text-[#8fa8a5] text-sm text-center">No semesters yet.<br />Add your first semester to start tracking.</p>
              <button type="button" onClick={() => setShowSemForm(true)} className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2 text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <Plus size={14} /> Add Semester
              </button>
            </div>
          </Card>
        ) : (
          semesters.map((sem) => {
            const semWAM = calculateSemesterWAM(sem.id);
            const isExpanded = expandedSems.has(sem.id);
            return (
              <div key={sem.id} className="bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-2xl overflow-hidden">
                {/* Semester Header */}
                <button
                  type="button"
                  onClick={() => toggleSem(sem.id)}
                  className="w-full flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-[#FFDC73]" />
                    <div className="text-left">
                      <p className="text-[#F8F8FF] text-sm font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{sem.name}</p>
                      <p className="text-[#8fa8a5] text-xs">{sem.subjects.length} subject{sem.subjects.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {semWAM !== null && (
                      <span className="mono text-sm font-bold" style={{ color: getMarkColor(semWAM) }}>
                        {semWAM.toFixed(1)}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={16} className="text-[#8fa8a5]" /> : <ChevronDown size={16} className="text-[#8fa8a5]" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-3 flex flex-col gap-2">
                    {/* Subjects */}
                    {sem.subjects.map((sub) => {
                      const isSubExpanded = expandedSubs.has(sub.id);
                      return (
                        <div key={sub.id} className="bg-[#012E2B] rounded-xl overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2.5">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[#FFDC73] text-xs font-bold mono">{sub.code || "—"}</span>
                                <span className="text-[#F8F8FF] text-xs truncate">{sub.name}</span>
                              </div>
                              {sub.mark !== null && (
                                <div className="mt-1">
                                  <WAMBar value={sub.mark} />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {/* Mark input */}
                              <input
                                type="number"
                                placeholder="Mark"
                                value={sub.mark ?? ""}
                                onChange={(e) => updateSubject(sem.id, sub.id, { mark: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-16 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-lg px-2 py-1 text-[#F8F8FF] text-xs mono text-center outline-none focus:border-[#FFDC73]/40"
                                min="0"
                                max="100"
                              />
                              {/* CP input */}
                              <input
                                type="number"
                                placeholder="CP"
                                value={sub.creditPoints ?? ""}
                                onChange={(e) => updateSubject(sem.id, sub.id, { creditPoints: e.target.value ? parseFloat(e.target.value) : null })}
                                className="w-12 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-lg px-2 py-1 text-[#F8F8FF] text-xs mono text-center outline-none focus:border-[#FFDC73]/40"
                              />
                              <button type="button" onClick={() => removeSubject(sem.id, sub.id)} className="text-[#8fa8a5] active:text-red-400">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Assignments toggle */}
                          <button
                            type="button"
                            onClick={() => toggleSub(sub.id)}
                            className="w-full flex items-center gap-1 px-3 pb-2 text-[#8fa8a5] text-[10px]"
                          >
                            {isSubExpanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            Assignments ({sub.assignments.length})
                          </button>

                          {isSubExpanded && (
                            <div className="px-3 pb-3 flex flex-col gap-1.5">
                              {sub.assignments.map((a) => {
                                const computed = a.userScore !== null && a.maxScore !== null && a.weight !== null
                                  ? (a.userScore / a.maxScore) * a.weight
                                  : null;
                                return (
                                  <div key={a.id} className="flex items-center gap-2 bg-[#0a3d39] rounded-lg px-2 py-1.5">
                                    <span className="text-[#F8F8FF] text-[10px] flex-1 truncate">{a.name || "Assignment"}</span>
                                    <input
                                      type="number"
                                      placeholder="Score"
                                      value={a.userScore ?? ""}
                                      onChange={(e) => updateAssignment(sem.id, sub.id, a.id, { userScore: e.target.value ? parseFloat(e.target.value) : null })}
                                      className="w-12 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded px-1.5 py-1 text-[#F8F8FF] text-[10px] mono text-center outline-none"
                                    />
                                    <span className="text-[#8fa8a5] text-[10px]">/</span>
                                    <input
                                      type="number"
                                      placeholder="Max"
                                      value={a.maxScore ?? ""}
                                      onChange={(e) => updateAssignment(sem.id, sub.id, a.id, { maxScore: e.target.value ? parseFloat(e.target.value) : null })}
                                      className="w-12 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded px-1.5 py-1 text-[#F8F8FF] text-[10px] mono text-center outline-none"
                                    />
                                    <span className="text-[#8fa8a5] text-[10px]">w:</span>
                                    <input
                                      type="number"
                                      placeholder="%"
                                      value={a.weight ?? ""}
                                      onChange={(e) => updateAssignment(sem.id, sub.id, a.id, { weight: e.target.value ? parseFloat(e.target.value) : null })}
                                      className="w-10 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded px-1.5 py-1 text-[#F8F8FF] text-[10px] mono text-center outline-none"
                                    />
                                    {computed !== null && (
                                      <span className="text-[#FFDC73] text-[10px] mono w-10 text-right">{computed.toFixed(1)}%</span>
                                    )}
                                    <button type="button" onClick={() => removeAssignment(sem.id, sub.id, a.id)} className="text-[#8fa8a5] active:text-red-400">
                                      <Trash2 size={11} />
                                    </button>
                                  </div>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => addAssignment(sem.id, sub.id, { name: `Assignment ${sub.assignments.length + 1}`, userScore: null, maxScore: null, weight: null })}
                                className="flex items-center gap-1 text-[#FFDC73] text-[10px] font-semibold mt-1"
                              >
                                <Plus size={10} /> Add assignment
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add Subject */}
                    {addSubjectFor === sem.id ? (
                      <div className="bg-[#012E2B] rounded-xl p-3 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Code (e.g. FIT3155)"
                            value={subjectForm.code}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, code: e.target.value }))}
                            className="flex-1 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
                          />
                          <input
                            type="text"
                            placeholder="Name"
                            value={subjectForm.name}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))}
                            className="flex-1 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Mark (0-100)"
                            value={subjectForm.mark}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, mark: e.target.value }))}
                            className="flex-1 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
                          />
                          <input
                            type="number"
                            placeholder="Credit Points"
                            value={subjectForm.creditPoints}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, creditPoints: e.target.value }))}
                            className="flex-1 bg-[#0a3d39] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddSubject(sem.id)} className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2 text-xs font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Add Subject
                          </button>
                          <button type="button" onClick={() => setAddSubjectFor(null)} className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2 text-xs">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setAddSubjectFor(sem.id)}
                        className="flex items-center gap-2 text-[#FFDC73] text-xs font-semibold py-1"
                      >
                        <Plus size={13} /> Add Subject
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => removeSemester(sem.id)}
                      className="flex items-center gap-1.5 text-red-400/60 text-xs mt-1"
                    >
                      <Trash2 size={12} /> Remove semester
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
