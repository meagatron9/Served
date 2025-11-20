import { useState } from "react";
import "./stickyNote.css";

export default function StickyNote({ note, notes, setNotes, boardRef }) {
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const style = {
    backgroundColor: note.color,
    transform: `translate(${note.x}px, ${note.y}px) rotate(${note.rotation}deg)`,
    boxShadow: `0 ${note.shadowDepth}px ${note.shadowDepth * 2}px rgba(0,0,0,0.25)`,
    position: "absolute",
    cursor: isDragging ? "grabbing" : "grab",
  };

  function handleMouseDown(e) {
    setIsDragging(true);

    const rect = e.target.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleMouseMove(e) {
    if (!isDragging) return;

    // Find the parent board element
    const board = e.target.closest(".notes-board");
    const boardRect = board.getBoundingClientRect();

    const noteWidth = 180;   // must match your CSS size
    const noteHeight = 180;  // must match your CSS size

    // Position relative to the board, not the window:
    let newX = e.clientX - boardRect.left - offset.x;
    let newY = e.clientY - boardRect.top - offset.y;

    // ⭐ Prevent note from going OUTSIDE left/right
    if (newX < 0) newX = 0;
    if (newX > boardRect.width - noteWidth) {
      newX = boardRect.width - noteWidth;
    }

    // ⭐ Prevent note from going OUTSIDE top/bottom
    if (newY < 0) newY = 0;
    if (newY > boardRect.height - noteHeight) {
      newY = boardRect.height - noteHeight;
    }

    // Update the note
    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, x: newX, y: newY } : n
      )
    );
  }


  function handleMouseUp() {
    setIsDragging(false);
  }

  return (
    <div
      className="sticky-note"
      style={style}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <p>{note.text}</p>
      <button
        className="delete-note-btn"
        onClick={(e) => {
          e.stopPropagation(); // prevents starting a drag when clicking delete
          setNotes(notes.filter((n) => n.id !== note.id));
        }}
      >
        ×
      </button>
    </div>
  );
}
