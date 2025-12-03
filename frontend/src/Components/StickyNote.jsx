import { useState, useRef, useEffect } from "react";
import { Pencil } from "lucide-react";

const styles = `
.sticky-note {
  width: 180px;
  height: 180px;
  padding: 8px;
  border-radius: 3px;
  font-size: 0.85rem;
  display: flex;
  flex-direction: column;
  background-color: var(--note-color, #fff59d);
  position: relative;
  overflow: hidden;
}

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
    rgba(40, 40, 40, 0.3) calc(var(--line-height) - 1px),
    rgba(40, 40, 40, 0.3) var(--line-height)
  );
  background-position-y: 10px;
}

.note-style-grid {
  background-image:
    repeating-linear-gradient(
      to right,
      rgba(40, 40, 40, 0.2) 0,
      rgba(40, 40, 40, 0.2) 1px,
      transparent 1px,
      transparent 15px
    ),
    repeating-linear-gradient(
      to bottom,
      rgba(40, 40, 40, 0.2) 0,
      rgba(40, 40, 40, 0.2) 1px,
      transparent 1px,
      transparent 15px
    );
}

.note-title {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 4px;
  padding: 2px 4px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  word-break: break-word;
}

.note-photo {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: cover;
  margin-bottom: 4px;
  border-radius: 2px;
}

.sticky-note-content {
  flex: 1;
  padding: 4px;
  overflow-y: auto;
  word-break: break-word;
  overflow-wrap: break-word;
  line-height: 1.3;
  user-select: none;
  font-size: 0.8rem;
}

.note-caption {
  font-size: 0.7rem;
  padding: 2px 4px;
  border-top: 1px solid rgba(0, 0, 0, 0.15);
  font-style: italic;
  color: #555;
  margin-top: auto;
}

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

.hover-darken {
  filter: brightness(0.88);
  transition: 0.25s ease;
}

.edit-note-btn {
  position: absolute;
  bottom: 6px;
  right: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.28);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  transition: 0.2s ease;
  z-index: 10;
}

.edit-note-btn:hover {
  background: rgba(0, 0, 0, 0.45);
}

.sticky-note-content.editing {
  user-select: text;
  cursor: text;
  border: 1px dashed #333;
  background: rgba(255, 255, 255, 0.4);
  padding: 6px;
}

.note-toolbar-wrapper {
  position: absolute;
  width: max-content;
  z-index: 999;
}

.text-style-toolbar {
  display: flex;
  gap: 4px;
  background: white;
  padding: 6px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.text-style-btn {
  padding: 6px 10px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s ease;
}

.text-style-btn:hover {
  background: #f0f0f0;
}

.done-btn {
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 6px 12px;
  font-size: 0.85rem;
}

.done-btn:hover {
  background: #45a047;
}
`;

export default function StickyNote({ note, notes, setNotes }) {
  // Guard against missing props
  if (!note || !notes || !setNotes) {
    return null;
  }

  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const editHoverTimerRef = useRef(null);
  const bringTopTimerRef = useRef(null);

  const [showEditBtn, setShowEditBtn] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const contentRef = useRef(null);
  const savedSelection = useRef(null);

  const [message, setMessage] = useState(null);
  const [messagePos, setMessagePos] = useState(null);
  const hoverPosRef = useRef(null);

  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedSelection.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function restoreSelection() {
    if (!savedSelection.current) return;
    const sel = window.getSelection();
    sel.removeAllRanges();
    try {
      sel.addRange(savedSelection.current);
    } catch (e) {
      console.warn("Could not restore selection:", e);
    }
  }

  function clearHoverTimers() {
    if (editHoverTimerRef.current) {
      clearTimeout(editHoverTimerRef.current);
      editHoverTimerRef.current = null;
    }
    if (bringTopTimerRef.current) {
      clearTimeout(bringTopTimerRef.current);
      bringTopTimerRef.current = null;
    }
  }

  function computeOverlapInfo() {
    const NOTE_SIZE = 180;
    const thisX = note.x;
    const thisY = note.y;
    const thisRight = thisX + NOTE_SIZE;
    const thisBottom = thisY + NOTE_SIZE;

    let totalOverlapArea = 0;
    let overlappingCount = 0;
    const noteArea = NOTE_SIZE * NOTE_SIZE;

    notes.forEach((n) => {
      if (n.id === note.id) return;

      const otherX = n.x;
      const otherY = n.y;
      const otherRight = otherX + NOTE_SIZE;
      const otherBottom = otherY + NOTE_SIZE;

      const overlapWidth = Math.max(
        0,
        Math.min(thisRight, otherRight) - Math.max(thisX, otherX)
      );
      const overlapHeight = Math.max(
        0,
        Math.min(thisBottom, otherBottom) - Math.max(thisY, otherY)
      );

      if (overlapWidth > 0 && overlapHeight > 0) {
        const area = overlapWidth * overlapHeight;
        overlappingCount += 1;
        totalOverlapArea += area;
      }
    });

    if (totalOverlapArea > noteArea) {
      totalOverlapArea = noteArea;
    }

    const ratio = noteArea === 0 ? 0 : totalOverlapArea / noteArea;
    const isMostlyCovered = ratio >= 0.6;

    return { isMostlyCovered, overlappingCount };
  }

  function bringNoteToTop() {
    const maxZ = notes.reduce(
      (max, n) => Math.max(max, n.zIndex || 0),
      0
    );

    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, zIndex: maxZ + 1 } : n
      )
    );
  }

  function handleFiveSecondHover() {
    const { isMostlyCovered, overlappingCount } = computeOverlapInfo();

    if (!isMostlyCovered) {
      bringNoteToTop();
    } else {
      if (overlappingCount > 0) {
        setMessage(`${overlappingCount} note${overlappingCount > 1 ? 's are' : ' is'} overlapping this note`);
      } else {
        setMessage("Notes are overlapping this note");
      }

      setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
  }

  function handleMouseEnter(e) {
    if (isEditing || isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    hoverPosRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 8,
    };

    clearHoverTimers();

    editHoverTimerRef.current = setTimeout(() => {
      setShowEditBtn(true);
    }, 3000);

    bringTopTimerRef.current = setTimeout(() => {
      handleFiveSecondHover();
    }, 5000);
  }

  function handleMouseLeave() {
    clearHoverTimers();
    setShowEditBtn(false);
    setMessage(null);
    hoverPosRef.current = null;
  }

  function handleMouseMoveOnNote(e) {
    if (!isDragging && hoverPosRef.current) {
      setMessagePos({
        x: e.clientX,
        y: e.clientY + 12,
      });
    }
  }

  function handleMouseDown(e) {
    if (isEditing) {
      e.stopPropagation();
      return;
    }

    if (e.target.closest('.delete-note-btn')) {
      return;
    }

    setShowEditBtn(false);
    clearHoverTimers();
    setMessage(null);

    setIsDragging(true);

    const rect = e.currentTarget.getBoundingClientRect();
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e) {
      const board = document.querySelector(".pinterest-board");
      if (!board) return;

      const boardRect = board.getBoundingClientRect();
      const noteWidth = 180;
      const noteHeight = 180;

      let newX = e.clientX - boardRect.left - offset.x;
      let newY = e.clientY - boardRect.top - offset.y;

      if (newX < 0) newX = 0;
      if (newX > boardRect.width - noteWidth)
        newX = boardRect.width - noteWidth;

      if (newY < 0) newY = 0;
      if (newY > boardRect.height - noteHeight)
        newY = boardRect.height - noteHeight;

      setNotes((prevNotes) =>
        prevNotes.map((n) =>
          n.id === note.id ? { ...n, x: newX, y: newY } : n
        )
      );
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, offset, note.id, setNotes]);

  useEffect(() => {
    return () => {
      clearHoverTimers();
    };
  }, []);

  function enterEditMode() {
    setIsEditing(true);
    setShowEditBtn(false);
    clearHoverTimers();

    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        saveSelection();
      }
    }, 30);
  }

  function exitEditMode() {
    const newHTML = contentRef.current.innerHTML;

    setNotes(
      notes.map((n) =>
        n.id === note.id ? { ...n, html: newHTML } : n
      )
    );

    setIsEditing(false);
  }

  function applyCommand(cmd) {
    if (!contentRef.current) return;
    contentRef.current.focus();
    restoreSelection();
    document.execCommand(cmd, false, null);
    saveSelection();
  }

  const style = {
    "--note-color": note.color,
    transform: `translate(${note.x}px, ${note.y}px) rotate(${note.rotation}deg)`,
    boxShadow: `0 ${note.shadowDepth}px ${
      note.shadowDepth * 2
    }px rgba(0,0,0,0.25)`,
    position: "absolute",
    cursor: isDragging ? "grabbing" : isEditing ? "default" : "grab",
    zIndex: note.zIndex || 1,
  };

  const styleClass = `sticky-note note-style-${note.styleType || "plain"} ${
    showEditBtn ? "hover-darken" : ""
  }`;

  const displayMessagePos = messagePos || hoverPosRef.current;

  return (
    <>
      <style>{styles}</style>
      <div
        className={styleClass}
        style={style}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMoveOnNote}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* EDIT BUTTON */}
        {showEditBtn && !isEditing && (
          <button
            className="edit-note-btn"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              enterEditMode();
            }}
          >
            <Pencil size={16} />
          </button>
        )}

        {/* TITLE */}
        {note.title && <div className="note-title">{note.title}</div>}

        {/* PHOTO */}
        {note.photo && <img src={note.photo} alt="" className="note-photo" />}

        {/* CONTENT (if exists) */}
        {note.html && (
          <div
            className={`sticky-note-content ${isEditing ? "editing" : ""}`}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
            ref={contentRef}
            onKeyUp={saveSelection}
            onMouseUp={saveSelection}
            onInput={saveSelection}
            dangerouslySetInnerHTML={{ __html: note.html }}
          />
        )}

        {/* CAPTION */}
        {note.caption && <div className="note-caption">{note.caption}</div>}

        {/* DELETE BUTTON */}
        {!isEditing && (
          <button
            className="delete-note-btn"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setNotes(notes.filter((n) => n.id !== note.id));
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* TOOLBAR WHEN EDITING */}
      {isEditing && (
        <div
          className="note-toolbar-wrapper"
          style={{ transform: `translate(${note.x}px, ${note.y + 190}px)` }}
        >
          <div className="text-style-toolbar">
            <button
              type="button"
              className="text-style-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand("bold")}
            >
              <strong>B</strong>
            </button>

            <button
              type="button"
              className="text-style-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand("italic")}
            >
              <i>I</i>
            </button>

            <button
              type="button"
              className="text-style-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyCommand("underline")}
            >
              <u>U</u>
            </button>

            <button
              type="button"
              className="text-style-btn done-btn"
              onMouseDown={(e) => e.preventDefault()}
              onClick={exitEditMode}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* OVERLAP MESSAGE */}
      {message && displayMessagePos && (
        <div
          className="overlap-message"
          style={{
            position: "fixed",
            left: displayMessagePos.x,
            top: displayMessagePos.y,
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "0.75rem",
            pointerEvents: "none",
            zIndex: 9999,
            whiteSpace: "nowrap",
          }}
        >
          {message}
        </div>
      )}
    </>
  );
}