// Design: Dark Brutalism + Neon Accent — WAM Calculator
// Brand: #012E2B bg, #FFDC73 accent, JetBrains Mono for numbers
import { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen, Calculator, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";

const GRADE_COLORS: Record<string, string> = {
  HD: "#4ade80", D: "#FFDC73", C: "#fb923c", P: "#f87171", N: "#ef4444",
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

function calculateWAMFromData(semesters: Array<{ subjects: Array<{ mark: number | null; creditPoints: number | null }> }>): number | null {
  let totalWeighted = 0;
  let totalCredits = 0;
  for (const sem of semesters) {
    for (const sub of sem.subjects) {
      if (sub.mark !== null && sub.creditPoints !== null) {
        totalWeighted += sub.mark * sub.creditPoints;
        totalCredits += sub.creditPoints;
      }
    }
  }
  return totalCredits > 0 ? totalWeighted / totalCredits : null;
}

function calculateSemWAM(subjects: Array<{ mark: number | null; creditPoints: number | null }>): number | null {
  let tw = 0, tc = 0;
  for (const s of subjects) {
    if (s.mark !== null && s.creditPoints !== null) { tw += s.mark * s.creditPoints; tc += s.creditPoints; }
  }
  return tc > 0 ? tw / tc : null;
}

export default function WAMPage() {
  const { semesters, addSemester, deleteSemester, addSubject, updateSubject, deleteSubject, calculateWAM, loadSampleData } = useWAMStore();
  const isLoading = false;


  const [expandedSems, setExpandedSems] = useState<Set<number>>(new Set());
  const [newSemName, setNewSemName] = useState("");
  const [showSemForm, setShowSemForm] = useState(false);
  const [addSubjectFor, setAddSubjectFor] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({ code: "", name: "", mark: "", creditPoints: "6" });

  const wam = calculateWAMFromData(semesters as Array<{ subjects: Array<{ mark: number | null; creditPoints: number | null }> }>);

  const toggleSem = (id: number) => {
    setExpandedSems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddSem = () => {
    if (!newSemName.trim()) return;
    addSemester({ name: newSemName.trim() });
    setNewSemName("");
    setShowSemForm(false);
  };

  const handleAddSubject = (semId: number) => {
    if (!subjectForm.name.trim()) return;
    addSubject({
      semesterId: semId,
      code: subjectForm.code || "SUBJ0000",
      name: subjectForm.name,
      mark: subjectForm.mark ? parseFloat(subjectForm.mark) : undefined,
      creditPoints: parseInt(subjectForm.creditPoints) || 6,
    });
    setSubjectForm({ code: "", name: "", mark: "", creditPoints: "6" });
    setAddSubjectFor(null);
  };

  const handleLoadSample = () => {
    if (semesters.length > 0) {
      if (!confirm("This will replace all your WAM data with sample data. Continue?")) return;
    }
    loadSampleData();
  };

  if (isLoading) return (
    <div className="page-container bg-[#012E2B] flex items-center justify-center">
      <Loader2 className="text-[#FFDC73] animate-spin" size={32} />
    </div>
  );

  return (
    <div className="page-container bg-[#012E2B]">
      <PageHeader
        title="WAM Calculator"
        subtitle="Track your academic performance"
        accent
        right={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLoadSample}
              disabled={false}
              className="flex items-center gap-1.5 bg-[#0a3d39] border border-[rgba(255,220,115,0.2)] text-[#FFDC73] rounded-xl px-3 py-1.5 text-xs font-bold disabled:opacity-50"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <FlaskConical size={12} />
              {false ? "Loading..." : "Sample"}
            </button>
            <button
              type="button"
              onClick={() => setShowSemForm(!showSemForm)}
              className="flex items-center gap-1.5 bg-[#FFDC73] text-[#012E2B] rounded-xl px-3 py-1.5 text-xs font-bold"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <Plus size={12} /> Semester
            </button>
          </div>
        }
      />

      <div className="px-4 pt-20 pb-24 flex flex-col gap-4">
        {/* WAM Summary */}
        {wam !== null && (
          <Card glow className="bg-gradient-to-br from-[#0a3d39] to-[#0d4a45]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: `${getMarkColor(wam)}20`, border: `2px solid ${getMarkColor(wam)}40` }}>
                <span className="text-xl font-black" style={{ color: getMarkColor(wam), fontFamily: "'JetBrains Mono', monospace" }}>
                  {wam.toFixed(1)}
                </span>
              </div>
              <div>
                <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Cumulative WAM</p>
                <p className="text-[#8fa8a5] text-xs">{semesters.length} semester{semesters.length !== 1 ? "s" : ""} tracked</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: getMarkColor(wam) }}>
                  {wam >= 80 ? "High Distinction" : wam >= 70 ? "Distinction" : wam >= 60 ? "Credit" : wam >= 50 ? "Pass" : "Fail"}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Add Semester Form */}
        {showSemForm && (
          <Card>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Semester 1 2025"
                value={newSemName}
                onChange={(e) => setNewSemName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSem()}
                className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-3 py-2.5 text-[#F8F8FF] text-sm placeholder-[#8fa8a5] outline-none focus:border-[#FFDC73]/40"
              />
              <button type="button" onClick={handleAddSem} disabled={false}
                className="bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Add
              </button>
            </div>
          </Card>
        )}

        {/* Semesters */}
        {semesters.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-3 py-6">
              <Calculator size={32} className="text-[#8fa8a5]" />
              <p className="text-[#8fa8a5] text-sm text-center">No semesters yet.<br />Add a semester or load sample data to get started.</p>
              <div className="flex gap-2 flex-wrap justify-center">
                <button type="button" onClick={() => setShowSemForm(true)}
                  className="flex items-center gap-2 bg-[#FFDC73] text-[#012E2B] rounded-xl px-4 py-2 text-sm font-bold"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <Plus size={14} /> Add Semester
                </button>
                <button type="button" onClick={handleLoadSample} disabled={false}
                  className="flex items-center gap-2 bg-[#0a3d39] border border-[rgba(255,220,115,0.2)] text-[#FFDC73] rounded-xl px-4 py-2 text-sm font-bold disabled:opacity-50"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <FlaskConical size={14} /> {false ? "Loading..." : "Load Sample"}
                </button>
              </div>
            </div>
          </Card>
        ) : (
          semesters.map((sem) => {
            const isExpanded = expandedSems.has(sem.id);
            const semWAM = calculateSemWAM(sem.subjects as Array<{ mark: number | null; creditPoints: number | null }>);
            return (
              <Card key={sem.id} className="p-0 overflow-hidden">
                {/* Semester Header — use div+role to avoid nested <button> inside <button> */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleSem(sem.id)}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleSem(sem.id)}
                  className="w-full flex items-center justify-between p-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#FFDC73]/10 border border-[#FFDC73]/20 flex items-center justify-center">
                      <BookOpen size={14} className="text-[#FFDC73]" />
                    </div>
                    <div>
                      <p className="text-[#F8F8FF] text-sm font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{sem.name}</p>
                      <p className="text-[#8fa8a5] text-xs">{sem.subjects.length} subject{sem.subjects.length !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {semWAM !== null && (
                      <span className="text-sm font-black" style={{ color: getMarkColor(semWAM), fontFamily: "'JetBrains Mono', monospace" }}>
                        {semWAM.toFixed(1)}
                      </span>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); deleteSemester({ id: sem.id }); }}
                        className="text-[#8fa8a5] p-1 active:text-red-400"
                      >
                        <Trash2 size={13} />
                      </button>
                      {isExpanded ? <ChevronUp size={16} className="text-[#8fa8a5]" /> : <ChevronDown size={16} className="text-[#8fa8a5]" />}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[rgba(255,220,115,0.08)] px-4 pb-4">
                    {/* Subjects */}
                    {(sem.subjects as Array<{ id: number; code: string | null; name: string; mark: number | null; creditPoints: number }>).map((sub) => (
                      <div key={sub.id} className="flex items-center gap-3 py-2.5 border-b border-[rgba(255,220,115,0.05)] last:border-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {sub.code && <span className="text-[#FFDC73] text-[10px] font-bold">{sub.code}</span>}
                            <span className="text-[#F8F8FF] text-xs font-semibold truncate" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{sub.name}</span>
                          </div>
                          <p className="text-[#8fa8a5] text-[10px]">{sub.creditPoints} CP</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <input
                            type="number"
                            min="0" max="100"
                            value={sub.mark ?? ""}
                            placeholder="–"
                            onChange={(e) => updateSubject({ id: sub.id, mark: e.target.value ? parseFloat(e.target.value) : undefined })}
                            className="w-14 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-lg px-2 py-1 text-center text-sm font-bold outline-none focus:border-[#FFDC73]/40"
                            style={{ color: sub.mark !== null ? getMarkColor(sub.mark) : "#8fa8a5", fontFamily: "'JetBrains Mono', monospace" }}
                          />
                          {sub.mark !== null && (
                            <span className="text-[10px] font-bold w-6" style={{ color: GRADE_COLORS[getGrade(sub.mark)] }}>
                              {getGrade(sub.mark)}
                            </span>
                          )}
                          <button type="button" onClick={() => deleteSubject({ id: sub.id })} className="text-[#8fa8a5] active:text-red-400">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Add Subject Form */}
                    {addSubjectFor === sem.id ? (
                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input type="text" placeholder="Code (e.g. COMP1234)" value={subjectForm.code}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, code: e.target.value }))}
                            className="w-28 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-2 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none" />
                          <input type="text" placeholder="Subject name" value={subjectForm.name}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, name: e.target.value }))}
                            className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-2 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none" />
                        </div>
                        <div className="flex gap-2">
                          <input type="number" placeholder="Mark" value={subjectForm.mark}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, mark: e.target.value }))}
                            className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-2 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none" />
                          <input type="number" placeholder="Credit Points" value={subjectForm.creditPoints}
                            onChange={(e) => setSubjectForm((f) => ({ ...f, creditPoints: e.target.value }))}
                            className="flex-1 bg-[#012E2B] border border-[rgba(255,220,115,0.12)] rounded-xl px-2 py-2 text-[#F8F8FF] text-xs placeholder-[#8fa8a5] outline-none" />
                        </div>
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleAddSubject(sem.id)} disabled={addSubMut.isPending}
                            className="flex-1 bg-[#FFDC73] text-[#012E2B] rounded-xl py-2 text-xs font-bold disabled:opacity-50"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                            Add
                          </button>
                          <button type="button" onClick={() => setAddSubjectFor(null)}
                            className="px-4 bg-[#0d4a45] text-[#8fa8a5] rounded-xl py-2 text-xs">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setAddSubjectFor(sem.id)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 border border-dashed border-[rgba(255,220,115,0.2)] rounded-xl py-2.5 text-[#8fa8a5] text-xs hover:border-[#FFDC73]/40 hover:text-[#FFDC73] transition-colors">
                        <Plus size={12} /> Add Subject
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}

        {/* Grade Legend */}
        <Card>
          <p className="text-[#8fa8a5] text-xs font-semibold mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Grade Scale</p>
          <div className="flex gap-2 flex-wrap">
            {[["HD", "80–100"], ["D", "70–79"], ["C", "60–69"], ["P", "50–59"], ["N", "0–49"]].map(([g, r]) => (
              <div key={g} className="flex items-center gap-1.5">
                <span className="text-xs font-bold w-6" style={{ color: GRADE_COLORS[g] }}>{g}</span>
                <span className="text-[#8fa8a5] text-[10px]">{r}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
