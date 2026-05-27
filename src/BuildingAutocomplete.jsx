// BuildingAutocomplete.jsx
// Searchable building picker for the FairRent Canada submission form.
//
// Renters can:
//   - Type to search across building names, aliases, addresses, neighbourhoods
//   - Pick a known building from the dropdown
//   - Choose "Other building or address" to enter a custom name freely
//   - Choose "I prefer not to say" to skip
//
// Search handles spelling variations automatically (Relevé/Releve, SoHo/Soho,
// St-Laurent/St Laurent, Dow's Lake/Dows Lake, etc.) via the normalize step
// in buildingData.js — no manual alias entry needed for accent/punctuation
// variations.
//
// Props:
//   value           { mode, id, text }   current selection
//   onChange        fn(next)             called with updated value
//   neighbourhoodKey                     building-side hood key for ranking boost
//   placeholder     string               default placeholder for the input

import { useEffect, useRef, useState } from "react";
import {
  searchBuildings,
  getBuildingById,
  VANCOUVER_NEIGHBOURHOODS,
} from "./buildingData";

const CSS = `
  .ba-wrap { position: relative; }
  .ba-input {
    width: 100%; padding: 10px 36px 10px 12px;
    border: 1px solid var(--border, #e3e6ea); background: var(--white, #fff);
    color: var(--t1, #0d1418); font-size: 14px; border-radius: 6px;
    font-family: inherit; appearance: none; -webkit-appearance: none;
  }
  .ba-input::placeholder { color: var(--t4, #9aa4af); }
  .ba-input:focus { outline: 2px solid var(--accent, #0e7c3a); outline-offset: 1px; border-color: var(--accent, #0e7c3a); }
  .ba-clear {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    background: none; border: none; cursor: pointer; padding: 4px 6px;
    font-size: 16px; color: var(--t3, #6a7682); line-height: 1; border-radius: 4px;
  }
  .ba-clear:hover { background: #f4f5f7; color: var(--t1, #0d1418); }

  .ba-pop {
    position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 30;
    background: #fff; border: 1px solid var(--border, #e3e6ea); border-radius: 8px;
    box-shadow: 0 6px 20px rgba(15, 22, 28, 0.10);
    max-height: min(420px, 60vh); overflow-y: auto; padding: 4px 0;
    -webkit-overflow-scrolling: touch; overscroll-behavior: contain;
  }
  .ba-pop-empty { padding: 14px 16px; font-size: 13px; color: var(--t3, #6a7682); line-height: 1.5; }
  .ba-item {
    width: 100%; display: block; text-align: left; background: none; border: none;
    padding: 10px 14px; font-family: inherit; cursor: pointer; line-height: 1.35;
    color: var(--t1, #0d1418);
  }
  .ba-item:hover, .ba-item.is-active { background: #f4f6f8; }
  .ba-item-name { font-size: 14px; font-weight: 600; }
  .ba-item-meta { font-size: 12px; color: var(--t3, #6a7682); margin-top: 2px; }
  .ba-divider { height: 1px; background: var(--border-soft, #eef0f3); margin: 4px 0; }

  .ba-action {
    width: 100%; display: block; text-align: left; background: none; border: none;
    padding: 10px 14px; font-family: inherit; cursor: pointer; font-size: 13px;
    font-weight: 600; color: var(--t2, #3b4753); line-height: 1.4;
  }
  .ba-action:hover, .ba-action.is-active { background: #f4f6f8; color: var(--accent, #0e7c3a); }

  .ba-other-input { margin-top: 8px; }

  .ba-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 3px 8px; border-radius: 3px; font-size: 11px; font-weight: 600;
    background: #f4f6f8; color: var(--t2, #3b4753);
    border: 1px solid var(--border, #e3e6ea);
  }

  @media (max-width: 640px) {
    .ba-input { font-size: 16px; padding: 12px 36px 12px 12px; }
    .ba-item, .ba-action { padding: 12px 16px; }
    .ba-pop { max-height: min(360px, 50vh); }
  }
`;

const SAFE_VALUE = { mode: "", id: "", text: "" };

export default function BuildingAutocomplete({
  value = SAFE_VALUE,
  onChange,
  neighbourhoodKey = null,
  placeholder = "Search building name or address",
}) {
  const v = { ...SAFE_VALUE, ...(value || {}) };
  const [query, setQuery]   = useState("");
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef             = useRef(null);
  const inputRef            = useRef(null);

  // What to show in the input field based on current selection
  const selectedBuilding = v.mode === "select" ? getBuildingById(v.id) : null;
  const displayValue =
    v.mode === "select" && selectedBuilding
      ? (selectedBuilding.address
          ? `${selectedBuilding.name} - ${selectedBuilding.address}`
          : selectedBuilding.name)
      : v.mode === "skip"
      ? "I prefer not to say"
      : "";  // "other" mode uses its own text input below

  const matches = open ? searchBuildings(query, neighbourhoodKey, 12) : [];
  const totalRows = matches.length + 2; // +2 for "Other" and "Skip"

  // Click outside closes the popover
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  function commit(next) {
    setOpen(false);
    setQuery("");
    setActive(0);
    onChange?.(next);
  }

  function pickBuilding(id) {
    commit({ mode: "select", id, text: "" });
  }
  function pickOther() {
    commit({ mode: "other", id: "", text: v.mode === "other" ? v.text : "" });
    // Focus the free-text input on next tick
    setTimeout(() => {
      const el = wrapRef.current?.querySelector(".ba-other-input input");
      if (el) el.focus();
    }, 0);
  }
  function pickSkip() {
    commit({ mode: "skip", id: "", text: "" });
  }
  function clearSelection() {
    commit({ mode: "", id: "", text: "" });
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function onKeyDown(e) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(a => (a + 1) % Math.max(1, totalRows));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(a => (a - 1 + Math.max(1, totalRows)) % Math.max(1, totalRows));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active < matches.length) {
        pickBuilding(matches[active].id);
      } else if (active === matches.length) {
        pickOther();
      } else if (active === matches.length + 1) {
        pickSkip();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // When the user types into the search box, the previous selection is cleared
  function onSearchChange(e) {
    const next = e.target.value;
    setQuery(next);
    setActive(0);
    setOpen(true);
    // If a building was selected, typing starts a fresh search — clear it
    if (v.mode === "select" || v.mode === "skip") {
      onChange?.({ mode: "", id: "", text: "" });
    }
  }

  // When in "other" mode, render a free-text input
  if (v.mode === "other") {
    return (
      <div className="ba-wrap" ref={wrapRef}>
        <style>{CSS}</style>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span className="ba-pill">Other building</span>
          <button
            type="button"
            onClick={clearSelection}
            style={{ background: "none", border: "none", color: "var(--t3, #6a7682)", fontSize: 12, cursor: "pointer", padding: 0, textDecoration: "underline" }}
          >
            Search list instead
          </button>
        </div>
        <input
          className="ba-input"
          type="text"
          placeholder="Enter building name or address"
          value={v.text || ""}
          onChange={e => onChange?.({ mode: "other", id: "", text: e.target.value })}
          maxLength={200}
          autoFocus
        />
      </div>
    );
  }

  return (
    <div className="ba-wrap" ref={wrapRef}>
      <style>{CSS}</style>
      <input
        ref={inputRef}
        className="ba-input"
        type="text"
        placeholder={placeholder}
        value={displayValue || query}
        onChange={onSearchChange}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="ba-listbox"
        role="combobox"
      />
      {(displayValue || query) && (
        <button
          type="button"
          className="ba-clear"
          onClick={clearSelection}
          aria-label="Clear building"
        >
          ×
        </button>
      )}

      {open && (
        <div className="ba-pop" id="ba-listbox" role="listbox">
          {matches.length === 0 ? (
            <div className="ba-pop-empty">
              {query
                ? "No buildings match. Try a different spelling, or pick \"Other building or address\" below."
                : "Start typing a building name or address."}
            </div>
          ) : (
            matches.map((b, i) => {
              const hood = VANCOUVER_NEIGHBOURHOODS[b.neighbourhood];
              const meta = [
                b.address,
                hood?.name || b.neighbourhood,
              ].filter(Boolean).join(" - ");
              return (
                <button
                  key={b.id}
                  type="button"
                  className={"ba-item" + (active === i ? " is-active" : "")}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pickBuilding(b.id)}
                  role="option"
                  aria-selected={active === i}
                >
                  <div className="ba-item-name">{b.name}</div>
                  {meta && <div className="ba-item-meta">{meta}</div>}
                </button>
              );
            })
          )}
          <div className="ba-divider" />
          <button
            type="button"
            className={"ba-action" + (active === matches.length ? " is-active" : "")}
            onMouseEnter={() => setActive(matches.length)}
            onClick={pickOther}
            role="option"
            aria-selected={active === matches.length}
          >
            + Other building or address
          </button>
          <button
            type="button"
            className={"ba-action" + (active === matches.length + 1 ? " is-active" : "")}
            onMouseEnter={() => setActive(matches.length + 1)}
            onClick={pickSkip}
            role="option"
            aria-selected={active === matches.length + 1}
          >
            I prefer not to say
          </button>
        </div>
      )}
    </div>
  );
}
