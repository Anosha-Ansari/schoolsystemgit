import { useState } from "react";
import { BookOpen, Trash2 } from "lucide-react";
import Banner from "../../components/Banner";
import Card from "../../components/Card";
import { Field, Input, Select, SuccessBanner } from "../../components/FormField";
import { useAcademic } from "../../context/AcademicContext";
import { useTeachers } from "../../context/TeachersContext";
import Pill from "../../components/Pill";

export default function AddClass() {
  const { classes, addClass, deleteClass, sections, GRADES } = useAcademic();
  const { teachers } = useTeachers();
  const [grade, setGrade] = useState(GRADES[0]);
  const [section, setSection] = useState("");
  const [teacher, setTeacher] = useState("");
  const [room, setRoom] = useState("");
  const [schedule, setSchedule] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (!section) { setError("Please select a section."); return; }
    if (classes.some((c) => c.grade === grade && c.section === section)) {
      setError(`${grade} - ${section} already exists.`);
      return;
    }
    addClass({ grade, section, teacher: teacher || "Unassigned", room: room || "-", schedule: schedule || "-" });
    setSection(""); setTeacher(""); setRoom(""); setSchedule(""); setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Banner title="Add Class" subtitle="Combine a grade with a section to create a class, e.g. Grade 4 - A." tagline={"Step 2 of 2\nAcademic Setup"} />
      <SuccessBanner show={saved} text="Class created successfully." />

      <div className="grid grid-cols-[1fr_1.6fr] gap-4">
        <Card title="New Class">
          {sections.length === 0 ? (
            <p className="text-muted text-[13px]">Please add at least one section first under <b>Add Section</b>.</p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-4">
              <Field label="Grade" required>
                <Select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  {GRADES.map((g) => <option key={g}>{g}</option>)}
                </Select>
              </Field>
              <Field label="Section" required hint="Manage sections under Add Section">
                <Select value={section} onChange={(e) => setSection(e.target.value)}>
                  <option value="">Select section</option>
                  {sections.map((s) => <option key={s.id} value={s.name}>Section {s.name}</option>)}
                </Select>
              </Field>
              <Field label="Class Teacher">
                <Select value={teacher} onChange={(e) => setTeacher(e.target.value)}>
                  <option value="">Unassigned</option>
                  {teachers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
                </Select>
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Room"><Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="e.g. R101" /></Field>
                <Field label="Schedule"><Input value={schedule} onChange={(e) => setSchedule(e.target.value)} placeholder="e.g. 8:00 AM" /></Field>
              </div>
              {error && <div className="text-brand-red text-xs">{error}</div>}
              <button className="bg-brand-orange text-white text-[13.5px] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 btn-tap hover:brightness-105 transition-all">
                <BookOpen size={15} /> Add Class
              </button>
            </form>
          )}
        </Card>

        <Card title={`Existing Classes (${classes.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                  <th className="py-2.5">Class</th><th>Teacher</th><th>Room</th><th>Schedule</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {classes.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-none row-hover">
                    <td className="py-2.5 font-semibold">{c.grade} - {c.section}</td>
                    <td>{c.teacher}</td>
                    <td>{c.room}</td>
                    <td>{c.schedule}</td>
                    <td><Pill>{c.status}</Pill></td>
                    <td className="text-right"><button onClick={() => deleteClass(c.id)} className="text-brand-red"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
                {classes.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-6">No classes yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
