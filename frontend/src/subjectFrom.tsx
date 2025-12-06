import { useState } from "react";

export default function SubjectForm() {
  const [form, setForm] = useState({
    code: "",
    name: "",
    credit: 3,
  });

  const submit = async () => {
    if (!form.code.trim()) return alert("Code required");
    if (!form.name.trim()) return alert("Name required");

    await fetch("http://localhost:3000/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    alert("Created!");
  };

  return (
    <div style={{ padding: 20 }}>
      <input
        placeholder="Code"
        onChange={(e) => setForm({ ...form, code: e.target.value })}
      />
      <br />
      <input
        placeholder="Name"
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <br />
      <input
        type="number"
        placeholder="Credit"
        onChange={(e) => setForm({ ...form, credit: Number(e.target.value) })}
      />
      <br />
      <button onClick={submit}>Create Subject</button>
    </div>
  );
}
