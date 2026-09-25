import { useState } from "react";
import { UserPlus, ArrowRightLeft, Paperclip } from "lucide-react";
import Banner from "../../components/Banner";
import Card from "../../components/Card";
import { Field, Input, Select, SectionTitle, SuccessBanner } from "../../components/FormField";
import { useStudents } from "../../context/StudentsContext";
import { useAcademic } from "../../context/AcademicContext";

const empty = {
  firstName: "", lastName: "", dob: "", gender: "Male", classId: "",
  guardianName: "", guardianPhone: "", guardianRelation: "Father",
  address: "", email: "",
  isTransfer: false, previousSchool: "", tcNumber: "", tcDate: "", previousClass: "", reason: "", tcFile: "",
};

export default function RegisterStudent() {
  const { addStudent } = useStudents();
  const { classOptions } = useAcademic();
  const [form, setForm] = useState(empty);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const req = ["firstName", "lastName", "dob", "classId", "guardianName", "guardianPhone"];
    if (form.isTransfer) req.push("previousSchool", "tcNumber", "tcDate");
    const errs = {};
    req.forEach((k) => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) { setSaved(false); return; }
    const cls = classOptions.find((c) => c.id === form.classId);
    addStudent({
      name: `${form.firstName} ${form.lastName}`,
      class: cls?.label || "-",
      roll: Math.floor(Math.random() * 30) + 1,
      gender: form.gender,
      isTransfer: form.isTransfer,
      transfer: form.isTransfer
        ? {
            previousSchool: form.previousSchool,
            tcNumber: form.tcNumber,
            tcDate: form.tcDate,
            previousClass: form.previousClass,
            reason: form.reason,
            tcFile: form.tcFile,
          }
        : undefined,
    });
    setSaved(true);
    setForm(empty);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <>
      <Banner title="Register Student" subtitle="Add a new student to the school records." tagline={"Every Child\nMatters"} />
      <SuccessBanner show={saved} text="Student registered successfully." />

      <form onSubmit={submit} className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <Card>
            <SectionTitle step="1" title="Personal Information" desc="Basic details about the student" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <Input value={form.firstName} onChange={set("firstName")} placeholder="e.g. Ayesha" className={errors.firstName ? "border-brand-red" : ""} />
              </Field>
              <Field label="Last Name" required>
                <Input value={form.lastName} onChange={set("lastName")} placeholder="e.g. Khan" className={errors.lastName ? "border-brand-red" : ""} />
              </Field>
              <Field label="Date of Birth" required>
                <Input type="date" value={form.dob} onChange={set("dob")} className={errors.dob ? "border-brand-red" : ""} />
              </Field>
              <Field label="Gender" required>
                <Select value={form.gender} onChange={set("gender")}>
                  <option>Male</option><option>Female</option>
                </Select>
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle step="2" title="Academic Information" desc="Class placement for this student" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Class" required hint="Manage class/section options under Academic Setup">
                <Select value={form.classId} onChange={set("classId")} className={errors.classId ? "border-brand-red" : ""}>
                  <option value="">Select class</option>
                  {classOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </Select>
              </Field>
              <Field label="Email (optional)">
                <Input type="email" value={form.email} onChange={set("email")} placeholder="student@school.edu" />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle step="3" title="Guardian Information" desc="Parent or guardian contact details" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Guardian Name" required>
                <Input value={form.guardianName} onChange={set("guardianName")} placeholder="e.g. Ali Raza" className={errors.guardianName ? "border-brand-red" : ""} />
              </Field>
              <Field label="Relation">
                <Select value={form.guardianRelation} onChange={set("guardianRelation")}>
                  <option>Father</option><option>Mother</option><option>Guardian</option>
                </Select>
              </Field>
              <Field label="Guardian Phone" required>
                <Input value={form.guardianPhone} onChange={set("guardianPhone")} placeholder="+92 3XX XXXXXXX" className={errors.guardianPhone ? "border-brand-red" : ""} />
              </Field>
              <Field label="Address">
                <Input value={form.address} onChange={set("address")} placeholder="Street, City" />
              </Field>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-1">
              <SectionTitle step="4" title="Transfer Certificate" desc="Fill this in only if the student is joining via transfer from another school" />
              <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer shrink-0 -mt-6">
                <input
                  type="checkbox"
                  checked={form.isTransfer}
                  onChange={(e) => setForm((f) => ({ ...f, isTransfer: e.target.checked }))}
                  className="w-4 h-4 accent-brand-blue"
                />
                <ArrowRightLeft size={14} className="text-brand-purple" /> Transfer Student
              </label>
            </div>

            {form.isTransfer && (
              <div className="grid grid-cols-2 gap-4 mt-3 pt-4 border-t border-border">
                <Field label="Previous School Name" required>
                  <Input value={form.previousSchool} onChange={set("previousSchool")} placeholder="e.g. City Grammar School" className={errors.previousSchool ? "border-brand-red" : ""} />
                </Field>
                <Field label="Previous Class">
                  <Input value={form.previousClass} onChange={set("previousClass")} placeholder="e.g. Class 7" />
                </Field>
                <Field label="Transfer Certificate (TC) Number" required>
                  <Input value={form.tcNumber} onChange={set("tcNumber")} placeholder="e.g. TC-2026-0451" className={errors.tcNumber ? "border-brand-red" : ""} />
                </Field>
                <Field label="TC Issue Date" required>
                  <Input type="date" value={form.tcDate} onChange={set("tcDate")} className={errors.tcDate ? "border-brand-red" : ""} />
                </Field>
                <Field label="Reason for Transfer">
                  <Input value={form.reason} onChange={set("reason")} placeholder="e.g. Family relocation" />
                </Field>
                <Field label="Attach TC Document" hint="PDF or image of the transfer certificate">
                  <label className="flex items-center gap-2 border border-dashed border-border rounded-lg px-3.5 py-2.5 text-[13px] text-muted cursor-pointer hover:border-brand-blue">
                    <Paperclip size={14} />
                    {form.tcFile || "Choose file…"}
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => setForm((f) => ({ ...f, tcFile: e.target.files[0]?.name || "" }))}
                    />
                  </label>
                </Field>
              </div>
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card title="Summary">
            <div className="text-[13px] space-y-2">
              <div className="flex justify-between"><span className="text-muted">Name</span><b>{form.firstName || form.lastName ? `${form.firstName} ${form.lastName}` : "—"}</b></div>
              <div className="flex justify-between"><span className="text-muted">Gender</span><b>{form.gender}</b></div>
              <div className="flex justify-between"><span className="text-muted">Class</span><b>{classOptions.find((c) => c.id === form.classId)?.label || "—"}</b></div>
              <div className="flex justify-between"><span className="text-muted">Guardian</span><b>{form.guardianName || "—"}</b></div>
              {form.isTransfer && (
                <div className="flex justify-between"><span className="text-muted">Transfer</span><b className="text-brand-purple">Yes — TC required</b></div>
              )}
            </div>
            <button type="submit" className="w-full mt-5 bg-brand-blue text-white text-[13.5px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 btn-tap">
              <UserPlus size={16} /> Register Student
            </button>
          </Card>
        </div>
      </form>
    </>
  );
}
