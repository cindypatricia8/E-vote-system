import React,{useState} from 'react';

type Candidate = { id: string; name: string; party?: string };
type Position = { key: string; title: string; candidates: Candidate[] };

const POSITIONS: Position[] = [
  {
    key: "president",
    title: "President",
    candidates: [
      { id: "1", name: "Candidate A" },
      { id: "2", name: "Candidate B" },
      { id: "3", name: "Candidate C" },
    ],
  }];

export default function MainVoting () {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const choose = (posKey: string, candId: string) =>
    setSelections((p) => ({ ...p, [posKey]: candId }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing = POSITIONS.filter((p) => !selections[p.key]).map((p) => p.title);
    if (missing.length) {
      setErrors(missing);
      setSubmitted(false);
      return;
    }
    setErrors([]);
    setSubmitted(true);
    // send result to API
    console.log("Ballot:", selections);
  };

  const onReset = () => {
    setSelections({});
    setErrors([]);
    setSubmitted(false);
  };

return (
    <div className="page"> 
        <div className="header">
            <div className="monash-logo"></div>
            <h1 className="title">MSA Election 2026/2027</h1>
        </div>

        <p>You are voting for these positions below:</p>
            <ol className="positions">
                <li>President</li>
                <li>Vice President</li>
                <li>Secretary</li>
                <li>Treasurer</li>
            </ol>

        <form className="ballot" onSubmit={onSubmit} onReset={onReset} noValidate>
        {POSITIONS.map((pos) => {
          const missingThis = submitted && !selections[pos.key];
          return (
            <fieldset key={pos.key} 
            className={`race ${missingThis ? "invalid" : ""}`}>
              <legend>{pos.title}</legend>
              {pos.candidates.map((c) => {
                const id = `${pos.key}-${c.id}`;
                return (
                  <label key={c.id} htmlFor={id} className="option">
                    <input
                      id={id}
                      type="radio"
                      name={pos.key}
                      value={c.id}
                      checked={selections[pos.key] === c.id}
                      onChange={() => choose(pos.key, c.id)}
                    />
                    <span>{c.name}</span>
                  </label>
                );
              })}
            </fieldset>
          );
        })}

        <div className="actions">
          <button type="submit" className="btn btn-primary">Submit</button>
        </div>
      </form>
        

    </div>

);
}