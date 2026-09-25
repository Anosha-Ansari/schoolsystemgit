import { useState } from "react";
import { UserPlus } from "lucide-react";
import Banner from "../../components/Banner";
import Card from "../../components/Card";
import { Field, Input, Select, SectionTitle, SuccessBanner } from "../../components/FormField";
import { useTeachers } from "../../context/TeachersContext";

const SUBJECTS = ["Mathematics", "English", "Science", "Physics", "Biology", "Chemistry", "Urdu", "Social Studies", "Computer"];

const empty = {
  firstName: "", lastName: "", email: "", phone: "",
  subject: "Mathematics", qualification: "", experience: "",
};

export default function RegisterTeacher() {
  const { addTeacher } = useTeachers();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const req = ["firstName", "lastName", "email", "phone"];
    const errs = {};
    req.forEach((k) => { if (!form[k]) errs[k] = true; });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    addTeacher({
      name: `${form.firstName} ${form.lastName}`,
      subject: form.subject,
      experience: form.experience ? `${form.experience} yrs` : "New",
    });
    setSaved(true);
    setForm(empty);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <>
      <Banner title="Register Teacher" subtitle="Add a new teacher to the school staff." tagline={"Teach · Inspire\nMake a Difference"} />
      <SuccessBanner show={saved} text="Teacher registered successfully." />

      <form onSubmit={submit} className="grid grid-cols-[2fr_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <Card>
            <SectionTitle step="1" title="Personal Information" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <Input value={form.firstName} onChange={set("firstName")} placeholder="e.g. Ahmed" className={errors.firstName ? "border-brand-red" : ""} />
              </Field>
              <Field label="Last Name" required>
                <Input value={form.lastName} onChange={set("lastName")} placeholder="e.g. Khan" className={errors.lastName ? "border-brand-red" : ""} />
              </Field>
              <Field label="Email" required>
                <Input type="email" value={form.email} onChange={set("email")} placeholder="teacher@school.edu" className={errors.email ? "border-brand-red" : ""} />
              </Field>
              <Field label="Phone" required>
                <Input value={form.phone} onChange={set("phone")} placeholder="+92 3XX XXXXXXX" className={errors.phone ? "border-brand-red" : ""} />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionTitle step="2" title="Professional Information" desc="Subject, qualification and experience" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Subject" required>
                <Select value={form.subject} onChange={set("subject")}>
                  {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </Field>
              <Field label="Years of Experience">
                <Input type="number" min="0" value={form.experience} onChange={set("experience")} placeholder="e.g. 5" />
              </Field>
              <Field label="Highest Qualification">
                <Input value={form.qualification} onChange={set("qualification")} placeholder="e.g. M.Sc Mathematics" />
              </Field>
            </div>
          </Card>
        </div>

        <Card title="Summary">
          <div className="text-[13px] space-y-2">
            <div className="flex justify-between"><span className="text-muted">Name</span><b>{form.firstName || form.lastName ? `${form.firstName} ${form.lastName}` : "—"}</b></div>
            <div className="flex justify-between"><span className="text-muted">Subject</span><b>{form.subject}</b></div>
            <div className="flex justify-between"><span className="text-muted">Experience</span><b>{form.experience ? `${form.experience} yrs` : "—"}</b></div>
          </div>
          <button type="submit" className="w-full mt-5 bg-brand-purple text-white text-[13.5px] font-semibold py-3 rounded-lg flex items-center justify-center gap-2 btn-tap hover:brightness-110 transition-all">
            <UserPlus size={16} /> Register Teacher
          </button>
        </Card>
      </form>
    </>
  );
}
