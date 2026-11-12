import { useEffect, useMemo, useRef, useState } from "react";
import { FaArrowDown, FaArrowUpFromBracket, FaCalendar, FaMagnifyingGlass, FaMapPin, FaPen, FaPlus, FaTrash, FaXmark } from "react-icons/fa6";
import styles from "./styles.module.css";

const storageKey = "fieldnotes-travel-memories-v1";
const initialMemories = [
    { id: "lisbon", title: "Rain on the tiled roofs", city: "Lisbon", country: "Portugal", year: 2025, note: "We ducked into a tiny bakery as the afternoon shower passed. The espresso was short, the walk home was slow.", x: 46, y: 41 },
    { id: "kyoto", title: "The lanterns came on", city: "Kyoto", country: "Japan", year: 2024, note: "One street turned gold as evening arrived. We found a quiet noodle shop just around the corner.", x: 86, y: 42 },
    { id: "vancouver", title: "A quiet morning by the water", city: "Vancouver", country: "Canada", year: 2025, note: "Coffee in hand, we watched the ferry leave the harbor while the mountains disappeared into cloud.", x: 16, y: 30 },
    { id: "mexico", title: "A table in Coyoacán", city: "Mexico City", country: "Mexico", year: 2023, note: "A long lunch turned into an even longer conversation. The market was still buzzing when we left.", x: 25, y: 54 },
    { id: "copenhagen", title: "Bikes in the blue hour", city: "Copenhagen", country: "Denmark", year: 2022, note: "We crossed the bridge with a basket of peaches and nowhere particular to be.", x: 52, y: 28 },
    { id: "cairo", title: "Tea before the museum", city: "Cairo", country: "Egypt", year: 2024, note: "Mint tea, a shaded table, and a little more time than the map said we needed.", x: 58, y: 53 },
];

const currentYear = new Date().getFullYear();
const readMemories = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(storageKey));
        if (Array.isArray(saved)) {
            const seenIds = new Set();
            return saved.flatMap((memory) => {
                if (!memory || typeof memory !== "object" || Array.isArray(memory)) return [];
                const { id, title, city, country, year, note, x, y } = memory;
                if (typeof id !== "string" || !id || seenIds.has(id)
                    || typeof title !== "string" || !title.trim() || title.length > 64
                    || typeof city !== "string" || !city.trim() || city.length > 40
                    || typeof country !== "string" || !country.trim() || country.length > 40
                    || !Number.isInteger(year) || year < 1900 || year > currentYear + 1
                    || typeof note !== "string" || !note.trim() || note.length > 240
                    || typeof x !== "number" || !Number.isFinite(x) || x < 5 || x > 95
                    || typeof y !== "number" || !Number.isFinite(y) || y < 9 || y > 90) return [];
                seenIds.add(id);
                return [{ id, title: title.trim(), city: city.trim(), country: country.trim(), year, note: note.trim(), x, y }];
            });
        }
    } catch {
        // Use the example memories if local data is unavailable.
    }
    return initialMemories;
};
const sortMemories = (items) => [...items].sort((a, b) => b.year - a.year || a.city.localeCompare(b.city));

const WorldIllustration = () => (
    <svg className={styles.worldIllustration} viewBox="0 0 1100 560" role="presentation" aria-hidden="true" preserveAspectRatio="none">
        <rect width="1100" height="560" fill="#e3ebdf" />
        <g className={styles.mapGrid}>
            <path d="M0 112H1100M0 224H1100M0 336H1100M0 448H1100M183 0V560M366 0V560M550 0V560M733 0V560M916 0V560" />
            <ellipse cx="550" cy="278" rx="510" ry="244" />
        </g>
        <g className={styles.landShapes}>
            <path d="M78 95 123 56 193 51 247 74 282 115 269 144 245 163 237 196 211 213 196 247 171 274 139 256 123 225 94 208 78 173 53 144Z" />
            <path d="m219 250 25 7 24 32-4 32-20 24-4 42-19 39-17 54-20 31-13-21 7-39-13-35 9-38-7-43 17-38 5-32Z" />
            <path d="m449 112 26-26 48 2 22 18 33 1 17 22-19 20-33-3-22 22-31-5-15-20-27 2-16-13Z" />
            <path d="m480 182 33-22 45 7 26 32 20 38-11 46-20 36-18 49-27 44-20-18-7-43-22-32 5-38-19-31Z" />
            <path d="m570 119 29-36 67-19 59 13 41-14 88 18 42 35 61 20 22 37-28 24-61-7-41 25-49-5-21 27-35 4-28-32-39 9-41-14-35 18-46-20-9-43Z" />
            <path d="m902 326 28-23 49 5 30 22-8 29-34 12-12 27-38 1-19-28-23-8Z" />
            <path d="m102 305 16 1 11 15-9 12-21-6Z" />
            <path d="m315 114 17-8 17 12-10 16-20-3Z" />
            <path d="m392 135 16-7 12 9-7 13-17-2Z" />
            <path d="m646 388 13-5 9 8-8 10-15-3Z" />
        </g>
        <g className={styles.mapLabels}>
            <text x="105" y="320">PACIFIC OCEAN</text><text x="383" y="323">ATLANTIC OCEAN</text><text x="843" y="279">PACIFIC OCEAN</text><text x="737" y="500">INDIAN OCEAN</text>
        </g>
    </svg>
);

const MemoryMap = () => {
    const [memories, setMemories] = useState(() => readMemories());
    const [selectedId, setSelectedId] = useState(() => readMemories()[0]?.id ?? null);
    const [query, setQuery] = useState("");
    const [yearFilter, setYearFilter] = useState("All years");
    const [dialog, setDialog] = useState(null);
    const [form, setForm] = useState({ title: "", city: "", country: "", year: String(currentYear), note: "", x: 50, y: 48 });
    const cancelRef = useRef(null);
    const dialogRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        try { localStorage.setItem(storageKey, JSON.stringify(memories)); } catch { /* Current memories remain usable if browser storage is full. */ }
    }, [memories]);

    useEffect(() => {
        if (!dialog) return undefined;
        const previousFocus = document.activeElement;
        cancelRef.current?.focus();
        const onKeyDown = (event) => {
            if (event.key === "Escape") setDialog(null);
            if (event.key === "Tab") {
                const focusable = [...dialogRef.current.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)")].filter((element) => element.offsetParent !== null);
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
                else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => { window.removeEventListener("keydown", onKeyDown); previousFocus?.focus?.(); };
    }, [dialog]);

    const years = useMemo(() => [...new Set(memories.map(({ year }) => year))].sort((a, b) => b - a), [memories]);
    const visibleMemories = useMemo(() => sortMemories(memories.filter((memory) => {
        const text = `${memory.title} ${memory.city} ${memory.country} ${memory.note}`.toLowerCase();
        return text.includes(query.toLowerCase()) && (yearFilter === "All years" || String(memory.year) === yearFilter);
    })), [memories, query, yearFilter]);
    const selectedMemory = visibleMemories.find((memory) => memory.id === selectedId) ?? visibleMemories[0] ?? null;

    const openAdd = (position = { x: 50, y: 48 }) => {
        setForm({ title: "", city: "", country: "", year: String(currentYear), note: "", ...position });
        setDialog({ kind: "add" });
    };
    const openEdit = (memory) => {
        setForm({ title: memory.title, city: memory.city, country: memory.country, year: String(memory.year), note: memory.note, x: memory.x, y: memory.y });
        setDialog({ kind: "edit", memory });
    };
    const saveMemory = (event) => {
        event.preventDefault();
        const year = Number(form.year);
        if (!form.title.trim() || !form.city.trim() || !form.country.trim() || !Number.isInteger(year) || year < 1900 || year > currentYear + 1 || !form.note.trim()) return;
        const entry = { ...form, id: dialog.kind === "edit" ? dialog.memory.id : crypto.randomUUID(), title: form.title.trim(), city: form.city.trim(), country: form.country.trim(), year, note: form.note.trim() };
        if (dialog.kind === "edit") setMemories((current) => current.map((memory) => memory.id === entry.id ? entry : memory));
        else setMemories((current) => [entry, ...current]);
        setSelectedId(entry.id);
        setQuery("");
        setYearFilter("All years");
        setDialog(null);
    };
    const deleteSelectedMemory = () => {
        const deletedId = dialog.memory.id;
        setMemories((current) => current.filter((memory) => memory.id !== deletedId));
        setSelectedId((current) => current === deletedId ? memories.find((memory) => memory.id !== deletedId)?.id ?? null : current);
        setDialog(null);
    };
    const handleMapClick = (event) => {
        if (event.target.closest("button")) return;
        const bounds = mapRef.current.getBoundingClientRect();
        const x = Math.max(5, Math.min(95, ((event.clientX - bounds.left) / bounds.width) * 100));
        const y = Math.max(9, Math.min(90, ((event.clientY - bounds.top) / bounds.height) * 100));
        openAdd({ x, y });
    };
    const exportMemories = () => {
        const file = new Blob([JSON.stringify(sortMemories(memories), null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = "fieldnotes-memories.json";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const closeDialog = () => setDialog(null);
    const onOverlayMouseDown = (event) => { if (event.target === event.currentTarget) closeDialog(); };

    return (
        <div className={styles.memoryPage}>
            <section className={styles.pageHeading}>
                <div><p className={styles.pageContext}><FaMapPin aria-hidden="true" /> TRAVEL MEMORY MAP</p><h1>Trips end. <span>Stories stay.</span></h1><p className={styles.intro}>Pin the places you still talk about.</p></div>
                <div className={styles.headingNote}><span className={styles.headingDot} /> {memories.length} {memories.length === 1 ? "memory" : "memories"} on your map</div>
            </section>

            <div className={styles.workspace}>
                <section className={styles.mapPanel} id="map" aria-labelledby="map-heading">
                    <div className={styles.mapPanelHeader}><div><h2 id="map-heading">Your memory map</h2><p>Click the map to leave a new pin</p></div><button className={styles.exportButton} onClick={exportMemories}><FaArrowUpFromBracket aria-hidden="true" /> Export</button></div>
                    <div className={styles.mapCanvas} ref={mapRef} onClick={handleMapClick} role="group" aria-label="Illustrated world map. Click a place to add a memory.">
                        <WorldIllustration />
                        {visibleMemories.map((memory) => <button key={memory.id} className={`${styles.mapPin} ${selectedMemory?.id === memory.id ? styles.selectedPin : ""}`} style={{ left: `${memory.x}%`, top: `${memory.y}%` }} onClick={(event) => { event.stopPropagation(); setSelectedId(memory.id); }} aria-label={`${memory.city}, ${memory.country}, ${memory.year}: ${memory.title}`} aria-pressed={selectedMemory?.id === memory.id} title={`${memory.city}, ${memory.country}`}><FaMapPin aria-hidden="true" /></button>)}
                        <div className={styles.mapScale}><span /><span>WORLD MEMORY MAP · SCHEMATIC</span></div>
                    </div>
                    <div className={styles.mapPanelFooter}><div className={styles.mapLegend}><span className={styles.legendPin}><FaMapPin aria-hidden="true" /></span><span>Saved memory</span><span className={styles.legendSelected} /> <span>Selected</span></div><p>Select a pin to revisit its note</p></div>
                </section>

                <aside className={styles.memoryPanel} id="memories" aria-labelledby="memories-heading">
                    <div className={styles.memoryPanelHeader}><div><p className={styles.panelLabel}>YOUR TRAVEL JOURNAL</p><h2 id="memories-heading">Memories</h2></div><button className={styles.addButton} onClick={() => openAdd()} aria-label="Add a memory"><FaPlus aria-hidden="true" /> <span>Add</span></button></div>
                    <div className={styles.filters}>
                        <label className={styles.searchField}><FaMagnifyingGlass aria-hidden="true" /><span className={styles.visuallyHidden}>Search memories</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search places or notes" aria-label="Search memories" /></label>
                        <label className={styles.yearFilter}><FaCalendar aria-hidden="true" /><span className={styles.visuallyHidden}>Filter memories by year</span><select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)} aria-label="Filter memories by year"><option>All years</option>{years.map((year) => <option key={year}>{year}</option>)}</select><FaArrowDown aria-hidden="true" /></label>
                    </div>
                    <p className={styles.resultsLine}>{visibleMemories.length} {visibleMemories.length === 1 ? "place" : "places"} {query || yearFilter !== "All years" ? "found" : "saved"}</p>
                    <div className={styles.memoryList}>
                        {visibleMemories.length ? visibleMemories.map((memory) => <button className={`${styles.memoryCard} ${selectedMemory?.id === memory.id ? styles.selectedMemory : ""}`} key={memory.id} onClick={() => setSelectedId(memory.id)} aria-pressed={selectedMemory?.id === memory.id}>
                            <span className={styles.memoryYear}>{memory.year}</span><span className={styles.memoryCardText}><strong>{memory.title}</strong><span>{memory.city}, {memory.country}</span></span><FaMapPin className={styles.cardPin} aria-hidden="true" />
                        </button>) : <div className={styles.emptyState}><strong>No matching memories</strong><span>Try another search or clear the year filter.</span><button onClick={() => { setQuery(""); setYearFilter("All years"); }}>Show all places</button></div>}
                    </div>
                    {selectedMemory && <article className={styles.selectedDetail} aria-live="polite">
                        <div className={styles.detailLocation}><span><FaMapPin aria-hidden="true" /> {selectedMemory.city}, {selectedMemory.country}</span><span>{selectedMemory.year}</span></div>
                        <h3>{selectedMemory.title}</h3><p>{selectedMemory.note}</p>
                        <div className={styles.detailActions}><button onClick={() => openEdit(selectedMemory)}><FaPen aria-hidden="true" /> Edit memory</button><button onClick={() => setDialog({ kind: "delete", memory: selectedMemory })} aria-label={`Delete ${selectedMemory.title}`}><FaTrash aria-hidden="true" /> Delete</button></div>
                    </article>}
                    <p className={styles.storageNote}>Your memories are saved only in this browser.</p>
                </aside>
            </div>

            {dialog && <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
                {dialog.kind === "delete" ? <section ref={dialogRef} className={styles.dialog} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
                    <span className={styles.dialogIcon}><FaTrash aria-hidden="true" /></span><h2 id="dialog-title">Remove this memory?</h2><p id="dialog-description">“{dialog.memory.title}” in {dialog.memory.city} will be removed from your map and journal.</p><div className={styles.dialogActions}><button ref={cancelRef} className={styles.cancelButton} onClick={closeDialog}>Keep memory</button><button className={styles.deleteButton} onClick={deleteSelectedMemory}>Remove memory</button></div>
                </section> : <form ref={dialogRef} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onSubmit={saveMemory}>
                    <div className={styles.dialogHeader}><div><p className={styles.panelLabel}>{dialog.kind === "edit" ? "UPDATE YOUR JOURNAL" : "ADD TO YOUR JOURNAL"}</p><h2 id="dialog-title">{dialog.kind === "edit" ? "Edit memory" : "Save a travel memory"}</h2><p>Keep the details you want to remember.</p></div><button type="button" className={styles.closeButton} aria-label="Close dialog" onClick={closeDialog}><FaXmark aria-hidden="true" /></button></div>
                    <label className={styles.formField}>Memory title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="A moment worth keeping" maxLength="64" required /></label>
                    <div className={styles.formGrid}><label className={styles.formField}>City<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} placeholder="Lisbon" maxLength="40" required /></label><label className={styles.formField}>Country<input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Portugal" maxLength="40" required /></label></div>
                    <div className={styles.formGrid}><label className={styles.formField}>Year<input type="number" value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} min="1900" max={currentYear + 1} required /></label><p className={styles.pinPlacement}><FaMapPin aria-hidden="true" /> Pin position saved on map</p></div>
                    <label className={styles.formField}>Your note<textarea value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="What do you remember most?" rows="3" maxLength="240" required /></label>
                    <div className={styles.dialogActions}><button ref={cancelRef} type="button" className={styles.cancelButton} onClick={closeDialog}>Cancel</button><button type="submit" className={styles.saveButton}>{dialog.kind === "edit" ? "Save changes" : "Add memory"}</button></div>
                </form>}
            </div>}
        </div>
    );
};

export default MemoryMap;
