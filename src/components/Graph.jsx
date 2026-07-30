import { useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react';
import { ARCHETYPES, buildEdges } from '../data';
import './Graph.css';

const TYPE_ORDER = ['alpha', 'beta', 'omega'];
const TYPE_LABEL = { alpha: 'Alpha', beta: 'Beta', omega: 'Omega' };
const TYPE_COLOR = { alpha: '#f87171', beta: '#60a5fa', omega: '#4ade80' };

const { edges, selfLoops } = buildEdges();

function crossColumnPath(rectA, rectB) {
  const left = rectA.cx <= rectB.cx ? rectA : rectB;
  const right = rectA.cx <= rectB.cx ? rectB : rectA;
  const x1 = left.right;
  const y1 = left.cy;
  const x2 = right.left;
  const y2 = right.cy;
  const midX = x1 + (x2 - x1) / 2;
  return `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
}

function sameColumnPath(rectA, rectB, bulge) {
  const top = rectA.cy <= rectB.cy ? rectA : rectB;
  const bottom = rectA.cy <= rectB.cy ? rectB : rectA;
  const x = bulge >= 0 ? Math.max(top.right, bottom.right) : Math.min(top.left, bottom.left);
  const y1 = top.cy;
  const y2 = bottom.cy;
  const cx = x + bulge;
  return `M ${x} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x} ${y2}`;
}

function selfLoopPath(rect) {
  const x1 = rect.cx - rect.width * 0.18;
  const x2 = rect.cx + rect.width * 0.18;
  const y = rect.top;
  return `M ${x1} ${y} C ${x1 - 30} ${y - 34}, ${x2 + 30} ${y - 34}, ${x2} ${y}`;
}

export default function Graph() {
  const containerRef = useRef(null);
  const cardRefs = useRef({});
  const [rects, setRects] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const next = {};
    for (const archetype of ARCHETYPES) {
      const el = cardRefs.current[archetype.id];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[archetype.id] = {
        left: r.left - containerRect.left,
        right: r.right - containerRect.left,
        top: r.top - containerRect.top,
        bottom: r.bottom - containerRect.top,
        cx: r.left - containerRect.left + r.width / 2,
        cy: r.top - containerRect.top + r.height / 2,
        width: r.width,
      };
    }
    setRects(next);
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  const columns = useMemo(() => {
    const grouped = { alpha: [], beta: [], omega: [] };
    for (const archetype of ARCHETYPES) grouped[archetype.type].push(archetype);
    return grouped;
  }, []);

  const columnOf = useMemo(() => {
    const map = {};
    ARCHETYPES.forEach((a) => {
      map[a.id] = TYPE_ORDER.indexOf(a.type);
    });
    return map;
  }, []);

  const neighborSet = useMemo(() => {
    if (!selectedId) return null;
    const set = new Set([selectedId]);
    edges.forEach(({ a, b }) => {
      if (a === selectedId) set.add(b);
      if (b === selectedId) set.add(a);
    });
    if (selfLoops.includes(selectedId)) set.add(selectedId);
    return set;
  }, [selectedId]);

  const ready = Object.keys(rects).length === ARCHETYPES.length;

  let betaBulgeToggle = 0;

  return (
    <div className="graph-wrap">
      <header className="graph-header">
        <h1>Omegaverse Compatibility Map</h1>
        <p>Tap an archetype to see who it's compatible with. Tap again to clear.</p>
        <a
          className="quiz-button"
          href="https://www.quotev.com/quiz/15192538/Accurate-Omegaverse-Quiz-100-Guarantee"
          target="_blank"
          rel="noopener noreferrer"
        >
          Take the Quiz
        </a>
      </header>

      <div className="graph-container" ref={containerRef} onClick={() => setSelectedId(null)}>
        <svg className="graph-svg" width="100%" height="100%">
          {ready &&
            edges.map(({ a, b }) => {
              const rectA = rects[a];
              const rectB = rects[b];
              if (!rectA || !rectB) return null;
              const isActive = selectedId !== null && (a === selectedId || b === selectedId);
              const colA = columnOf[a];
              const colB = columnOf[b];
              let d;
              if (colA === colB) {
                let bulge = 60;
                if (colA === 0) bulge = -60;
                else if (colA === 1) {
                  bulge = betaBulgeToggle % 2 === 0 ? -60 : 60;
                  betaBulgeToggle += 1;
                }
                d = sameColumnPath(rectA, rectB, bulge);
              } else {
                d = crossColumnPath(rectA, rectB);
              }
              return (
                <path
                  key={`${a}-${b}`}
                  d={d}
                  className={`edge ${isActive ? 'edge-active' : ''} ${selectedId && !isActive ? 'edge-dim' : ''}`}
                />
              );
            })}
          {ready &&
            selfLoops.map((id) => {
              const rect = rects[id];
              if (!rect) return null;
              const isActive = selectedId === id;
              return (
                <path
                  key={`loop-${id}`}
                  d={selfLoopPath(rect)}
                  className={`edge ${isActive ? 'edge-active' : ''} ${selectedId && !isActive ? 'edge-dim' : ''}`}
                />
              );
            })}
        </svg>

        <div className="columns">
          {TYPE_ORDER.map((type) => (
            <div className="column" key={type}>
              <h2 className="column-title" style={{ color: TYPE_COLOR[type] }}>
                {TYPE_LABEL[type]}
              </h2>
              <div className="column-cards">
                {columns[type].map((archetype) => {
                  const isSelected = selectedId === archetype.id;
                  const isNeighbor = neighborSet && neighborSet.has(archetype.id);
                  const dimmed = selectedId && !isNeighbor;
                  return (
                    <div
                      key={archetype.id}
                      ref={(el) => {
                        cardRefs.current[archetype.id] = el;
                      }}
                      className={`card ${isSelected ? 'card-selected' : ''} ${dimmed ? 'card-dim' : ''}`}
                      style={{ borderColor: TYPE_COLOR[type] }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedId((prev) => (prev === archetype.id ? null : archetype.id));
                      }}
                    >
                      <div className="card-header">
                        <div className="card-name" style={{ color: TYPE_COLOR[type] }}>
                          {archetype.name}
                        </div>
                        <div className="card-count">{archetype.people.length}</div>
                      </div>
                      {archetype.people.length > 0 ? (
                        <ul className="card-people">
                          {archetype.people.map((person) => (
                            <li key={person}>{person}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="card-empty">No results yet</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
