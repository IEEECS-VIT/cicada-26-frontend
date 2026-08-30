import { useAdmin } from '../AdminContext';
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Radio,
} from 'lucide-react';

export default function RoundsTab() {
  const {
    rounds,
    challenges,
    handleOpenCreateRound,
    handleOpenEditRound,
    handleOpenDeleteRound,
    handleReorderRound,
  } = useAdmin();

  const sortedRounds = [...rounds].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

  const challengeCountFor = (round) => challenges.filter((c) =>
    c.raw?.round_id ? c.raw.round_id === round.id : (c.round || 1) === (round.order_number || 1)
  ).length;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-orbitron text-sm tracking-[0.28em] text-starlight">ROUNDS</h2>
          <p className="mt-1 text-sm text-copper/80">Order, activation, and story fragments for every round.</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateRound}
          className="inline-flex items-center gap-2 border border-accretion bg-accretion px-4 py-2.5 font-orbitron text-[10px] tracking-[0.2em] text-black hover:bg-accretion-bright"
        >
          <Plus className="h-4 w-4" />
          NEW ROUND
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sortedRounds.map((round, idx) => {
          const fragment = round.story_fragment && typeof round.story_fragment === 'object' ? round.story_fragment : {};
          return (
            <div key={round.id} className="flex flex-col justify-between border border-accretion/20 bg-black/45 p-6 backdrop-blur-sm transition hover:border-accretion/50">
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <p className="font-rajdhani text-[11px] tracking-[0.28em] text-accretion">
                    ROUND {round.order_number}
                  </p>
                  <span className={`font-rajdhani text-[11px] tracking-[0.22em] ${
                    round.is_active === false ? 'text-red-300' : 'text-emerald-300'
                  }`}>
                    {round.is_active === false ? 'INACTIVE' : 'ACTIVE'}
                  </span>
                </div>

                <h3 className="mb-5 flex items-center gap-2 font-orbitron text-lg tracking-[0.08em] text-starlight">
                  <Layers className="h-4 w-4 shrink-0 text-accretion" />
                  {round.name || `Round ${round.order_number}`}
                </h3>

                <div className="mb-4 border-t border-accretion/15 pt-4 text-sm">
                  <div className="mb-1 font-rajdhani text-[11px] tracking-[0.22em] text-copper">CHALLENGES</div>
                  <div className="flex items-center gap-2 text-accretion">
                    <span className="font-orbitron">{challengeCountFor(round)}</span>
                    <span className="text-xs text-copper/70">assigned</span>
                  </div>
                </div>

                <div className="mb-4 border-t border-accretion/15 pt-4 text-sm">
                  <div className="mb-2 flex items-center gap-1.5 font-rajdhani text-[11px] tracking-[0.22em] text-copper">
                    <Radio className="h-3 w-3 text-accretion/60" />
                    STORY FRAGMENT
                  </div>
                  {fragment.title || fragment.content ? (
                    <div className="space-y-1">
                      {fragment.title && (
                        <p className="font-orbitron text-xs tracking-[0.12em] text-starlight">{fragment.title}</p>
                      )}
                      {fragment.header && (
                        <p className="font-rajdhani text-[10px] tracking-[0.2em] text-accretion/70">{fragment.header}</p>
                      )}
                      {fragment.content && (
                        <p className="text-xs leading-relaxed text-starlight/70 line-clamp-3">{fragment.content}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-copper/50">No fragment recorded for this round.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 border-t border-accretion/15 pt-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEditRound(round)}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-accretion/40 py-2 font-rajdhani text-[11px] tracking-[0.18em] text-accretion hover:bg-accretion/10"
                  >
                    <Edit className="h-3 w-3" />
                    EDIT
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenDeleteRound(round)}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-copper/25 py-2 font-rajdhani text-[11px] tracking-[0.18em] text-copper hover:border-red-400/50 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                    DELETE
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleReorderRound(round.id, -1)}
                    disabled={idx === 0}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-copper/25 py-2 font-rajdhani text-[11px] tracking-[0.16em] text-copper hover:border-accretion hover:text-accretion disabled:cursor-not-allowed disabled:opacity-30"
                    title="Move round up"
                  >
                    <ArrowUp className="h-3 w-3" />
                    MOVE UP
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorderRound(round.id, 1)}
                    disabled={idx === sortedRounds.length - 1}
                    className="flex flex-1 items-center justify-center gap-1.5 border border-copper/25 py-2 font-rajdhani text-[11px] tracking-[0.16em] text-copper hover:border-accretion hover:text-accretion disabled:cursor-not-allowed disabled:opacity-30"
                    title="Move round down"
                  >
                    <ArrowDown className="h-3 w-3" />
                    MOVE DOWN
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}