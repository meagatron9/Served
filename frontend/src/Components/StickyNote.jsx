import React from "react";

const styles = `
.sticky-note {
  width: 100%;
  border-radius: 6px;
  padding: 8px;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  background-color: var(--note-color, #fff59d);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}

/* Background variants */
.note-style-plain {
  background-image: none;
}

.note-style-lined {
  --line-height: 1.4rem;
  line-height: var(--line-height);
  background-image: repeating-linear-gradient(
    to bottom,
    transparent 0,
    transparent calc(var(--line-height) - 1px),
    rgba(40, 40, 40, 0.18) calc(var(--line-height) - 1px),
    rgba(40, 40, 40, 0.18) var(--line-height)
  );
  background-position-y: 10px;
}

.note-style-grid {
  background-image:
    repeating-linear-gradient(
      to right,
      rgba(40, 40, 40, 0.15) 0,
      rgba(40, 40, 40, 0.15) 1px,
      transparent 1px,
      transparent 15px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(40, 40, 40, 0.15) 0,
      rgba(40, 40, 40, 0.15) 1px,
      transparent 1px,
      transparent 15px
    );
}

/* Title */
.note-title {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 4px;
  padding: 2px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  word-break: break-word;
}

/* Photo */
.note-photo {
  width: 100%;
  height: auto;
  max-height: 260px;
  object-fit: cover;
  margin: 4px 0;
  border-radius: 3px;
}

/* Caption / content */
.note-caption {
  font-size: 0.75rem;
  padding: 4px;
  margin-top: auto;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  font-style: italic;
  color: #333;
  word-break: break-word;
}

/* Delete button */
.delete-note-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.25);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s ease;
  user-select: none;
  z-index: 10;
}

.delete-note-btn:hover {
  background: rgba(0, 0, 0, 0.4);
}
`;

export default function StickyNote({ note, notes, setNotes }) {
  if (!note) return null;

  // Color + small tilt for “sticky” look
  const style = {
    "--note-color": note.color || "#fff59d",
    transform: note.rotation
      ? `rotate(${note.rotation}deg)`
      : "rotate(0deg)",
  };

  const styleClass = `sticky-note note-style-${note.styleType || "plain"}`;

  function handleDelete(e) {
    e.stopPropagation();
    if (!setNotes || !notes) return;
    setNotes(notes.filter((n) => n.id !== note.id));
  }

  return (
    <>
      <style>{styles}</style>
      <div className={styleClass} style={style}>
        {/* Title */}
        {note.title && <div className="note-title">{note.title}</div>}

        {/* Image */}
        {note.photo && <img src={note.photo} alt="" className="note-photo" />}

        {/* Caption (AI summary or user caption) */}
        {note.caption && (
          <div className="note-caption">
            {note.caption}
          </div>
        )}

        {/* Delete */}
        <button className="delete-note-btn" onClick={handleDelete}>
          ×
        </button>
      </div>
    </>
  );
}
