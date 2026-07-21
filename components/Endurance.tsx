"use client";

import React from "react";

/* ------------------------------------------------------------------ */
/*  Helper sub-components                                               */
/* ------------------------------------------------------------------ */

function Sides({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="side" />
      ))}
    </>
  );
}

function Hatch() {
  return (
    <div className="hatch">
      <span />
      <span />
      <span />
    </div>
  );
}

function Nozzle() {
  return (
    <div className="nozzle">
      {Array.from({ length: 15 }).map((_, i) => (
        <span key={i} />
      ))}
      <div />
    </div>
  );
}

/** Module type-1: 8 sides + window (5 sides) + cuboid.hole (6 sides + span) */
function ModuleType1() {
  return (
    <div className="module type-1">
      <Sides count={8} />
      <div className="window">
        <Sides count={5} />
      </div>
      <div className="cuboid hole">
        <Sides count={6} />
        <span />
      </div>
    </div>
  );
}

/** Module type-2: 8 sides + cuboid.hole (6 sides + 3 nozzles) */
function ModuleType2() {
  return (
    <div className="module type-2">
      <Sides count={8} />
      <div className="cuboid hole">
        <Sides count={6} />
        <Nozzle />
        <Nozzle />
        <Nozzle />
      </div>
    </div>
  );
}

/** Cylinder with 10 sides */
function Cylinder({ port = false }: { port?: boolean }) {
  return (
    <div className={`cylinder${port ? " port" : ""}`}>
      {port
        ? Array.from({ length: 10 }).map((_, i) =>
            i === 1 ? (
              <div key={i} className="side ring" />
            ) : (
              <div key={i} className="side" />
            )
          )
        : Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="side" />
          ))}
      {port && <Hatch />}
    </div>
  );
}

/** Radius cylinder — variable sides based on rc index */
function RadiusCylinder({ rc }: { rc: number }) {
  const hasRing = rc === 0 || rc === 6 || rc === 9;
  const hasRingDark = rc === 6 || rc === 9;
  const hatch1 = rc === 0 || rc === 6 || rc === 9;
  const hatch2 = rc === 6 || rc === 9;

  return (
    <div className="cylinder">
      {/* First side: ring or plain */}
      {hasRing ? <div className="side ring" /> : <div className="side" />}
      {/* Second side: ring-dark or plain */}
      {hasRingDark ? (
        <div className="side ring-dark" />
      ) : (
        <div className="side" />
      )}
      {/* 8 more regular sides */}
      <Sides count={8} />
      {hatch1 && <Hatch />}
      {hatch2 && <Hatch />}
    </div>
  );
}

/** Radius end-cylinder: first side is ring, rest plain, then hatch */
function RadiusEndCylinder() {
  return (
    <div className="cylinder">
      <div className="side ring" />
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="side" />
      ))}
      <Hatch />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Endurance Component                                            */
/* ------------------------------------------------------------------ */

export default function Endurance() {
  const PORT_CYLINDERS = new Set([3, 5, 9, 11]);

  return (
    <div className="spacecraft-wrapper">
      {/* 400 cam divs — used for CSS :active engine-on trick */}
      {Array.from({ length: 400 }).map((_, i) => (
        <div key={i} className="cam" />
      ))}

      <div className="content">
        <div className="endurance">

          {/* ======================== MODULES ======================== */}
          <div className="modules">

            {/* MOD-1: type-1 */}
            <div className="group mod-1">
              <ModuleType1 />
            </div>

            {/* MOD-2: type-2 */}
            <div className="group mod-2">
              <ModuleType2 />
            </div>

            {/* MOD-3: type-1.type-3 + type-2.type-3 */}
            <div className="group mod-3">
              <div className="module type-1 type-3">
                <Sides count={8} />
                <div className="window">
                  <Sides count={5} />
                </div>
                <div className="cuboid hole">
                  <Sides count={6} />
                  <span />
                </div>
              </div>
              <div className="module type-2 type-3">
                <Sides count={8} />
              </div>
            </div>

            {/* MOD-4: type-2 */}
            <div className="group mod-4">
              <ModuleType2 />
            </div>

            {/* MOD-5, 6, 7: type-1 */}
            {[5, 6, 7].map((m) => (
              <div key={m} className={`group mod-${m}`}>
                <ModuleType1 />
              </div>
            ))}

            {/* MOD-8: type-2 */}
            <div className="group mod-8">
              <ModuleType2 />
            </div>

            {/* MOD-9: type-1.type-3 (no window, no type-2.type-3) */}
            <div className="group mod-9">
              <div className="module type-1 type-3">
                <Sides count={8} />
                <div className="cuboid hole">
                  <Sides count={6} />
                  <span />
                </div>
              </div>
            </div>

            {/* MOD-10: type-2 */}
            <div className="group mod-10">
              <ModuleType2 />
            </div>

            {/* MOD-11, 12: type-1 */}
            {[11, 12].map((m) => (
              <div key={m} className={`group mod-${m}`}>
                <ModuleType1 />
              </div>
            ))}
          </div>

          {/* ======================== CYLINDERS ======================== */}
          <div className="cylinders">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((c) => (
              <div key={c} className={`group cyl-${c}`}>
                {/* First cylinder in every group */}
                <div className="cylinder">
                  <Sides count={10} />
                </div>
                {/* Second cylinder: port for c=3,5,9,11; otherwise plain */}
                {PORT_CYLINDERS.has(c) ? (
                  <Cylinder port />
                ) : (
                  <div className="cylinder">
                    <Sides count={10} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ======================== CHAINS ======================== */}
          <div className="chains">
            {Array.from({ length: 24 }, (_, i) => i + 1).map((ch) => (
              <div key={ch} className={`group cha-${ch}`}>
                <div className="cuboid chain">
                  <Sides count={6} />
                </div>
              </div>
            ))}
          </div>

          {/* ======================== RADIUS ======================== */}
          <div className="radius">
            <div className="group">
              {/* 12 radius cylinders */}
              {Array.from({ length: 12 }, (_, rc) => (
                <RadiusCylinder key={rc} rc={rc} />
              ))}

              {/* 4 chain cuboids */}
              {Array.from({ length: 4 }).map((_, cc) => (
                <div key={cc} className="cuboid chain">
                  <Sides count={10} />
                </div>
              ))}

              {/* 2 end cylinders */}
              <RadiusEndCylinder />
              <RadiusEndCylinder />
            </div>
          </div>

        </div>{/* .endurance */}
      </div>{/* .content */}
    </div>/* .spacecraft-wrapper */
  );
}
