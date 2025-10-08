import { useMemo, useState } from "react";
import { ImageSlider, type Candidate, type Position } from "../components/imageSlider";
import "./main-voting.css";

import presidentA from "../images/presidentA.jpg";
import presidentB from "../images/presidentB.jpg";
import presidentC from "../images/presidentC.jpg";
import presidentD from "../images/presidentD.jpg";

// Demo data
const candidates: Candidate[] = [
  { id: "1", first_name: "Emma",  last_name: "Johnson", position: "President",      img: presidentA, vision: "Build an inclusive and creative club culture.", mission: "Launch mentorship programs and feedback surveys." },
  { id: "2", first_name: "David", last_name: "Larson",  position: "Vice President", img: presidentB, vision: "Build an inclusive and creative club culture.", mission: "Launch mentorship programs and feedback surveys." },
  { id: "3", first_name: "Erika", last_name: "Morrow",  position: "Secretary",      img: presidentC, vision: "Build an inclusive and creative club culture.", mission: "Launch mentorship programs and feedback surveys." },
  { id: "4", first_name: "Carley",last_name: "Fortune", position: "Treasurer",      img: presidentD, vision: "Build an inclusive and creative club culture.", mission: "Launch mentorship programs and feedback surveys." },
  { id: "5", first_name: "Sally", last_name: "Rooney",  position: "Treasurer",      img: presidentD, vision: "Build an inclusive and creative club culture.", mission: "Launch mentorship programs and feedback surveys." },
];

const POSITIONS: Position[] = ["President", "Vice President", "Secretary", "Treasurer"];

function TabBar({ value, onChange }: { value: Position; onChange: (p: Position) => void }) {
  return (
    <div role="tablist" aria-label="Positions" className="tabbar">
      {POSITIONS.map((p) => (
        <button
          key={p}
          role="tab"
          className="tab"
          aria-selected={value === p}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Position>("President");

  // remember a selection per role
  const [selectedByRole, setSelectedByRole] = useState<Record<Position, string | null>>({
    President: null, "Vice President": null, Secretary: null, Treasurer: null,
  });

  // list for active tab (used by radios + slider)
  const visible = useMemo(() => candidates.filter((c) => c.position === tab), [tab]);
  const selectedId = selectedByRole[tab];
  const currentPick = useMemo(
    () => visible.find((c) => c.id === selectedId) ?? null,
    [visible, selectedId]
  );

  // Completion logic
  const countsByRole: Record<Position, number> = useMemo(() => {
    return POSITIONS.reduce((acc, p) => {
      acc[p] = candidates.filter(c => c.position === p).length;
      return acc;
    }, {} as Record<Position, number>);
  }, []);

  const requiredRoles = useMemo(
    () => POSITIONS.filter(p => countsByRole[p] > 0),
    [countsByRole]
  );
  const allPicked = requiredRoles.every(p => !!selectedByRole[p]);
  const missingRoles = requiredRoles.filter(p => !selectedByRole[p]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!allPicked) {
      alert(`Please choose a candidate for: ${missingRoles.join(", ")}`);
      return;
    }
    const payload = requiredRoles.map(p => ({
      position: p,
      candidateId: selectedByRole[p]!,
    }));
    // send to backend
    alert("Submitting\n" + JSON.stringify(payload, null, 2));
  }

  const FORM_ID = "vote-form";

  return (
    <div className="page">
      <h1>Club Election — Candidates</h1>
      <h3>Please Enter your selection for the Positions Below</h3>
      <p className="subtle">
        *Press a position tab to display its candidates (with vision & mission)
      </p>

      {/* Tab-specific form (no submit button inside) */}
      <form id={FORM_ID} onSubmit={onSubmit} className="vote-form">
        <fieldset className="vote-fieldset">
          <legend className="vote-legend">{tab}</legend>

          {visible.length === 0 ? (
            <p style={{ color: "#888" }}>No candidates for {tab}.</p>
          ) : (
            visible.map((c) => {
              const id = `${tab}-${c.id}`;
              return (
                <label key={c.id} htmlFor={id} className="radio-option">
                  <input
                    id={id}
                    type="radio"
                    name={`candidate-${tab}`}
                    value={c.id}
                    checked={selectedId === c.id}
                    onChange={() => setSelectedByRole((prev) => ({ ...prev, [tab]: c.id }))}
                  />
                  <span>{c.first_name} {c.last_name}</span>
                </label>
              );
            })
          )}
        </fieldset>
      </form>

      {/* Submit button lives outside the form */}
      <button
        type="submit"
        form={FORM_ID}
        disabled={!allPicked}
        className="submit-btn"
      >
        Submit
      </button>

      {/* Tabs (page-wide) */}
      <TabBar value={tab} onChange={setTab} />

      {/* Slider */}
      {visible.length ? (
        <ImageSlider imageUrls={visible} />
      ) : (
        <p style={{ textAlign: "center", color: "#888" }}>No candidates for {tab}.</p>
      )}
    </div>
  );
}
