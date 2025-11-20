import { useState } from "react";
import { Palette } from "lucide-react";
import StickyNote from "../components/StickyNote.jsx";
import "./dashboard.css";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [color, setColor] = useState("#fff59d");

  const [showColors, setShowColors] = useState(false);

  const COLORS = [
    "#fff59d", // yellow
    "#ffd1dc", // pink
    "#cce5ff", // blue
    "#d4f8d4", // green
  ];

  function addNote() {
    if (!text.trim()) return;

    const MAX_CHARS = 180;

    const newNote = {
      id: Date.now(),
      text: text.slice(0, MAX_CHARS),
      color,
      x: 50,
      y: 50,
      rotation: (Math.random() * 8 - 4).toFixed(2),
      shadowDepth: Math.floor(Math.random() * 4) + 2,
    };

    setNotes([...notes, newNote]);
    setText("");
  }

  return (
    <div className="dashboard-wrapper">

      <div className="notes-board">
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            notes={notes}
            setNotes={setNotes}
          />
        ))}
      </div>

      {/* Input Area */}
      <div className="note-controls">

        <textarea
          className="note-input"
          value={text}
          maxLength={180}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your note to post to the board..."
        />

        {/* PALETTE BUTTON + RADIAL MENU */}
        <div className="color-wrapper">
          <button
            className="color-btn"
            onClick={() => setShowColors(!showColors)}
          >
            <Palette size={18} />
          </button>

          {showColors && (
            <div className="color-wheel">
              {COLORS.map((c, i) => (
                <div
                  key={c}
                  className="color-dot"
                  style={{ backgroundColor: c, "--i": i }}
                  onClick={() => {
                    setColor(c);
                    setShowColors(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>


        <button className="add-btn" onClick={addNote}>
          Add Note
        </button>

      </div>
    </div>
  );
}
