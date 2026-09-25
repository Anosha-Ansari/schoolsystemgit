import { createContext, useContext, useState } from "react";
import { students as seedStudents } from "../data/sampleData";

const StudentsContext = createContext(null);

export function StudentsProvider({ children }) {
  const [students, setStudents] = useState(seedStudents);

  const addStudent = (s) => {
    setStudents((prev) => [
      { id: `STU${String(prev.length + 1).padStart(3, "0")}`, status: "Active", ...s },
      ...prev,
    ]);
  };

  return (
    <StudentsContext.Provider value={{ students, addStudent }}>
      {children}
    </StudentsContext.Provider>
  );
}

export const useStudents = () => useContext(StudentsContext);
