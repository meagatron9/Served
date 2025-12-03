import { useState, useRef, useEffect } from "react";
import { Palette, X } from "lucide-react";
import StickyNote from "../Components/StickyNote.jsx";
import "./Dashboard.css";

export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [color, setColor] = useState("#fff59d");
  const [styleType, setStyleType] = useState("plain");
  const [showOptions, setShowOptions] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Note fields
  const [noteTitle, setNoteTitle] = useState("");
  const [notePhoto, setNotePhoto] = useState("");
  const [noteCaption, setNoteCaption] = useState("");

  const fileInputRef = useRef(null);

  // Load notes from localStorage on component mount
  useEffect(() => {
    console.log('Loading notes from localStorage...');
    const savedNotes = localStorage.getItem('dashboardNotes');
    console.log('Saved notes:', savedNotes);
    if (savedNotes && savedNotes !== 'undefined' && savedNotes !== 'null') {
      try {
        const parsedNotes = JSON.parse(savedNotes);
        console.log('Parsed notes:', parsedNotes);
        if (Array.isArray(parsedNotes) && parsedNotes.length > 0) {
          console.log('Setting notes state with:', parsedNotes);
          setNotes(parsedNotes);
        }
      } catch (error) {
        console.error('Failed to load notes from localStorage:', error);
      }
    } else {
      console.log('No saved notes found or invalid data');
    }
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    console.log('Saving notes to localStorage:', notes);
    try {
      localStorage.setItem('dashboardNotes', JSON.stringify(notes));
      console.log('Save successful! Verify:', localStorage.getItem('dashboardNotes'));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [notes]);

  const PALETTE_OPTIONS = [
    { id: "yellow", type: "color", value: "#fff59d" },
    { id: "pink", type: "color", value: "#ffd1dc" },
    { id: "blue", type: "color", value: "#cce5ff" },
    { id: "green", type: "color", value: "#d4f8d4" },
    { id: "lined", type: "style", value: "lined" },
    { id: "grid", type: "style", value: "grid" },
    { id: "none", type: "style", value: "plain" },
  ];

  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNotePhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function addNote() {
    // Validate required fields
    if (!noteTitle.trim()) {
      alert("Please add a title!");
      return;
    }
    if (!notePhoto) {
      alert("Please upload a photo!");
      return;
    }
    if (!noteCaption.trim()) {
      alert("Please add a caption!");
      return;
    }

    // Calculate position for new note (spread them out)
    const columnIndex = notes.length % 4;
    const rowIndex = Math.floor(notes.length / 4);
    
    const newNote = {
      id: Date.now(),
      title: noteTitle,
      photo: notePhoto,
      caption: noteCaption,
      color,
      styleType,
      rotation: (Math.random() * 4 - 2).toFixed(2),
      shadowDepth: Math.floor(Math.random() * 3) + 2,
      zIndex: 1,
      x: columnIndex * 200,
      y: rowIndex * 200,
    };

    setNotes([...notes, newNote]);

    // Clear form and close modal
    setNoteTitle("");
    setNotePhoto("");
    setNoteCaption("");
    setShowCreateModal(false);
  }

  function closeModal() {
    setShowCreateModal(false);
    setNoteTitle("");
    setNotePhoto("");
    setNoteCaption("");
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header with Post Button */}
      <div className="header-section">
        <h1 className="main-title">What's on Your Plate?</h1>
        <button className="post-button" onClick={() => setShowCreateModal(true)}>
          + Post
        </button>
      </div>

      {/* Create Note Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Post</h2>
              <button className="close-button" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <p className="required-text">* Required fields</p>

            <div className="form-fields">
              <div className="form-field">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  maxLength={30}
                />
              </div>

              <div className="form-field">
                <label>Image *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <button
                  className={`upload-button ${notePhoto ? "uploaded" : ""}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {notePhoto ? "✓ Image Uploaded" : "📷 Click to Upload Image"}
                </button>
                {notePhoto && (
                  <div className="image-preview">
                    <img src={notePhoto} alt="Preview" />
                    <button className="remove-image" onClick={() => setNotePhoto("")}>
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="form-field">
                <label>Caption *</label>
                <input
                  type="text"
                  placeholder="Enter caption"
                  value={noteCaption}
                  onChange={(e) => setNoteCaption(e.target.value)}
                  maxLength={50}
                />
              </div>

              <div className="form-actions">
                <div className="color-wrapper">
                  <button
                    className="style-button"
                    onClick={() => setShowOptions(!showOptions)}
                  >
                    <Palette size={18} />
                    Style
                  </button>

                  {showOptions && (
                    <div className="color-arc">
                      {PALETTE_OPTIONS.map((opt, index) => {
                        const radius = 60;
                        const angleDeg = -140 + index * (360 / PALETTE_OPTIONS.length);
                        const angleRad = (angleDeg * Math.PI) / 180;
                        const xPos = Math.cos(angleRad) * radius;
                        const yPos = Math.sin(angleRad) * radius;

                        const isColor = opt.type === "color";
                        const classes = ["option-dot", isColor ? "color-dot" : "style-dot"];
                        if (!isColor) classes.push(`style-${opt.value}`);

                        return (
                          <button
                            key={opt.id}
                            className={classes.join(" ")}
                            style={{
                              transform: `translate(${xPos}px, ${yPos}px) translate(-50%, -50%)`,
                              backgroundColor: isColor ? opt.value : "white",
                            }}
                            onClick={() => {
                              if (isColor) setColor(opt.value);
                              else setStyleType(opt.value);
                              setShowOptions(false);
                            }}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <button className="submit-button" onClick={addNote}>
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pinterest-style Board */}
      <div className="pinterest-board">
        {notes.map((note) => (
          <StickyNote key={note.id} note={note} notes={notes} setNotes={setNotes} />
        ))}
      </div>

      {notes.length === 0 && (
        <div className="empty-board">
          <p className="empty-title">Your board is empty</p>
          <p className="empty-subtitle">Click "+ Post" to add your first post!</p>
        </div>
      )}
    </div>
  );
}