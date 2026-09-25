import { createContext, useContext, useState } from "react";
import { teachers as seedTeachers } from "../data/sampleData";

const TeachersContext = createContext(null);

export function TeachersProvider({ children }) {
  const [teachers, setTeachers] = useState(
    seedTeachers.map((t, i) => ({ id: `TCH${String(i + 1).padStart(3, "0")}`, ...t }))
  );

  const addTeacher = (t) => {
    setTeachers((prev) => [
      { id: `TCH${String(prev.length + 1).padStart(3, "0")}`, status: "Active", classes: 0, ...t },
      ...prev,
    ]);
  };

  return (
    <TeachersContext.Provider value={{ teachers, addTeacher }}>
      {children}
    </TeachersContext.Provider>
  );
}

export const useTeachers = () => useContext(TeachersContext);
