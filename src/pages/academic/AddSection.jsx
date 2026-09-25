import { useState } from "react";
import { Layers, Trash2 } from "lucide-react";
import Banner from "../../components/Banner";
import Card from "../../components/Card";
import { Field, Input, SuccessBanner } from "../../components/FormField";
import { useAcademic } from "../../context/AcademicContext";

export default function AddSection() {
  const { sections, addSection, deleteSection } = useAcademic();
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim()) { setError("Section name is required."); return; }
    if (sections.some((s) => s.name.toLowerCase() === name.trim().toLowerCase())) {
      setError("This section already exists.");
      return;
    }
    addSection({ name: name.trim().toUpperCase(), capacity: Number(capacity) || 40 });
    setName(""); setCapacity(""); setError("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <Banner title="Add Section" subtitle="Create sections (e.g. A, B, C) that can be combined with a grade to form a class." tagline={"Step 1 of 2\nAcademic Setup"} />
      <SuccessBanner show={saved} text="Section added successfully." />

      <div className="grid grid-cols-[1fr_1.6fr] gap-4">
        <Card title="New Section">
          <form onSubmit={submit} className="flex flex-col gap-4">
            <Field label="Section Name" required hint="e.g. A, B, C, D">
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A" maxLength={3} />
            </Field>
            <Field label="Capacity" hint="Maximum students in this section">
              <Input type="number" min="1" value={capacity} onChange={(e) => setCapacity(e.target.value)} placeholder="e.g. 40" />
            </Field>
            {error && <div className="text-brand-red text-xs">{error}</div>}
            <button className="bg-teal-500 text-white text-[13.5px] font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 btn-tap hover:bg-teal-600 transition-colors">
              <Layers size={15} /> Add Section
            </button>
          </form>
        </Card>

        <Card title={`Existing Sections (${sections.length})`}>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[11.5px] uppercase border-b border-border">
                <th className="py-2.5">Section</th><th>Capacity</th><th></th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-none row-hover">
                  <td className="py-2.5 font-semibold">Section {s.name}</td>
                  <td>{s.capacity} students</td>
                  <td className="text-right">
                    <button onClick={() => deleteSection(s.id)} className="text-brand-red"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {sections.length === 0 && <tr><td colSpan={3} className="text-center text-muted py-6">No sections yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
