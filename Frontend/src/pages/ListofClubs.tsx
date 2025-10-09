
import { useState, useEffect } from "react";
import { getAllClubs } from "../api/apiService";
import "./ListofClubs.css";
import { Club } from "../types";

type Mode = "general" | "club";

//Demo data
type Club = {
  id: string;
  name: string;
  desc: string;
};

const CLUBS: Club[] = [
  { id: "art",        name: "Art Society",       desc: "Design, drawing & exhibits" },
  { id: "robotics",   name: "Robotics Club",     desc: "Build & compete" },
  { id: "sports",     name: "Sports Council",    desc: "Leagues & training" },
  { id: "coding",     name: "Coding Circle",     desc: "Hack nights & projects" },
]

// Hard-coded
const USER_ASSIGNED = new Set<string>(["robotics", "coding"]);

function SegmentedToggle({
  mode,
  onChange,
}: {
  mode: Mode;
  onChange: (m: Mode) => void;
}) {
  return (
    <div className="seg" role="tablist" aria-label="Admin mode">
      <button
        role="tab"
        aria-selected={mode === "general"}
        onClick={() => onChange("general")}
      >
        General Admin
      </button>
      <button
        role="tab"
        aria-selected={mode === "club"}
        onClick={() => onChange("club")}
      >
        Club Admin
      </button>
    </div>
  );
}

function ClubButton({
  club,
  allowed,
  onOpen,
}: {
  club: Club;
  allowed: boolean;
  onOpen: (c: Club) => void;
}) {
  return (
    <button
      className="club"
      aria-label={club.name + (allowed ? "" : " (not assigned)")}
      aria-disabled={!allowed}
      onClick={() => allowed && onOpen(club)}
    >
      <div className="club-text">
        <div className="name">{club.name}</div>
        <div className="desc">{club.desc}</div>
      </div>
    </button>
  );
}

export default function Clubs() {
  const [mode, setMode] = useState<Mode>("general");
  const [clubs, setClubs] = useState<Club[]>([]);

  // useEffect(() => {
  //        const fetchClubs = async () => {
  //            try {
  //                const response = await getAllClubs(); 
  //                setManagedClubs(response.data.data.clubs);
  //            } catch (err) {
  //                setError('Failed to load your clubs.');
  //            }
  //        };
  //        fetchClubs();
  //    }, []);

  function handleOpenClub(club: Club) {
    // Replace with navigation or modal opening
    alert(`${mode === "general" ? "Opening" : "Managing"}: ${club.name}`);
  }

  return (
    <div className="wrap">
      <header className="topbar">
        <h1>Clubs</h1>
      
        <div className="spacer" />
        <SegmentedToggle mode={mode} onChange={setMode} />
      </header>

      <main className="grid" aria-label="Clubs">
        {CLUBS.map((club) => {
          const allowed = mode === "general" || USER_ASSIGNED.has(club.id);
          return (
            <ClubButton
              key={club.id}
              club={club}
              allowed={allowed}
              onOpen={handleOpenClub}
            />
          );
        })}
      </main>
    </div>
  );
}
