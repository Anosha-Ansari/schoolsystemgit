import { createContext, useContext, useState } from "react";

const AcademicContext = createContext(null);

export const GRADES = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10"];

const seedSections = [
  { id: "SEC1", name: "A", capacity: 40 },
  { id: "SEC2", name: "B", capacity: 40 },
  { id: "SEC3", name: "C", capacity: 35 },
  { id: "SEC4", name: "D", capacity: 35 },
];

const seedClasses = [
  { id: "CLS1", grade: "Grade 1", section: "A", teacher: "Sarah Khan", room: "R101", schedule: "8:00 AM", studentsCount: 32, status: "Active" },
  { id: "CLS2", grade: "Grade 1", section: "B", teacher: "Ahmed Ali", room: "R102", schedule: "8:00 AM", studentsCount: 29, status: "Active" },
  { id: "CLS3", grade: "Grade 2", section: "A", teacher: "Fatima Noor", room: "R201", schedule: "9:00 AM", studentsCount: 35, status: "Active" },
  { id: "CLS4", grade: "Grade 2", section: "B", teacher: "Bilal Ahmad", room: "R202", schedule: "9:00 AM", studentsCount: 31, status: "Active" },
  { id: "CLS5", grade: "Grade 3", section: "A", teacher: "Ayesha Malik", room: "R301", schedule: "10:00 AM", studentsCount: 28, status: "Active" },
  { id: "CLS6", grade: "Grade 3", section: "B", teacher: "Zain Ul Abdin", room: "R302", schedule: "10:00 AM", studentsCount: 33, status: "Active" },
];

export function AcademicProvider({ children }) {
  const [sections, setSections] = useState(seedSections);
  const [classes, setClasses] = useState(seedClasses);

  const addSection = (s) => {
    setSections((prev) => [{ id: `SEC${prev.length + 1}`, ...s }, ...prev]);
  };
  const deleteSection = (id) => setSections((prev) => prev.filter((s) => s.id !== id));

  const addClass = (c) => {
    setClasses((prev) => [{ id: `CLS${prev.length + 1}`, studentsCount: 0, status: "Active", ...c }, ...prev]);
  };
  const deleteClass = (id) => setClasses((prev) => prev.filter((c) => c.id !== id));

  const classOptions = classes.map((c) => ({ id: c.id, label: `${c.grade} - ${c.section}` }));

  return (
    <AcademicContext.Provider value={{ sections, classes, addSection, deleteSection, addClass, deleteClass, classOptions, GRADES }}>
      {children}
    </AcademicContext.Provider>
  );
}

export const useAcademic = () => useContext(AcademicContext);
