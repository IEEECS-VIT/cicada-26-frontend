import { useAdmin } from '../AdminContext';
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Radio,
  Timer,
  Play,
  RotateCcw,
} from 'lucide-react';

function formatCountdown(seconds) {
  const total = Math.max(0, Math.floor(seconds || 0));
  const h = String(Math.floor(total / 3600)).padStart(2, '0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const s = String(total % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function RoundsTab() {
  const {
    rounds,
    challenges,
    handleOpenCreateRound,
    handleOpenEditRound,
    handleOpenDeleteRound,
    handleReorderRound,
    roundTimer,
    roundTimerMinutes,
    setRoundTimerMinutes,
    roundTimerLoading,
    handleSaveRoundTimerDuration,
    handleStartRoundTimer,
    handleResetRoundTimer,
  } = useAdmin();

  const sortedRounds = [...rounds].sort((a, b) => (a.order_number || 0) - (b.order_number || 0));

  const challengeCountFor = (round) => challenges.filter((c) =>
    c.raw?.round_id ? c.raw.round_id === round.id : (c.round || 1) === (round.order_number || 1)
  ).length;

  const durationSecs = roundTimer?.round_duration_seconds ?? 3 * 60 * 60;
  const startedAt = roundTimer?.round_started_at;
  const isRunning = Boolean(roundTimer?.is_running ?? (startedAt && (new Date(startedAt).getTime() + durationSecs * 1000) > Date.now()));

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

      {/* Round Timer control */}
      <div className="mb-8 border border-accretion/30 bg-black/50 p-6 backdrop-blur-sm">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-orbitron text-xs tracking-[0.24em] text-accretion">
              <Timer className="h-4 w-4" />
              ROUND TIMER
            </p>
            <p className="mt-2 text-sm text-copper/80">
              One shared 3-hour countdown per round. It is anchored server-side, so it keeps counting
              for participants even after they reload the page.
            </p>
          </div>
          <div className="text-right">
            <p className="font-orbitron text-2xl tracking-[0.12em] text-starlight tabular-nums">
              {formatCountdown(roundTimer?.remaining_seconds ?? durationSecs)}
            </p>
            <p className={`mt-1 font-rajdhani text-[10px] tracking-[0.24em] ${isRunning ? 'text-emerald-300' : 'text-copper/60'}`}>
              {isRunning ? 'RUNNING' : 'STOPPED'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 border-t border-accretion/15 pt-5 lg:grid-cols-2">
          <form onSubmit={handleSaveRoundTimerDuration} className="flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="round-duration-minutes" className="mb-1 block font-rajdhani text-[10px] tracking-[0.22em] text-copper">
                DURATION (MINUTES)
              </label>
              <input
                id="round-duration-minutes"
                type="number"
                min="1"
                step="1"
                value={roundTimerMinutes}
                onChange={(e) => setRoundTimerMinutes(e.target.value)}
                className="w-36 border border-accretion/40 bg-black px-3 py-2 font-orbitron text-sm text-starlight outline-none focus:border-accretion"
              />
            </div>
            <button
              type="submit"
              disabled={roundTimerLoading}
              className="inline-flex items-center gap-2 border border-accretion/60 px-4 py-2.5 font-rajdhani text-[11px] tracking-[0.18em] text-accretion hover:bg-accretion/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              SAVE DURATION
            </button>
          </form>

          <div className="flex flex-wrap gap-3 lg:justify-end">
            <button
              type="button"
              onClick={handleStartRoundTimer}
              disabled={roundTimerLoading}
              className="inline-flex items-center gap-2 border border-emerald-400/40 px-4 py-2.5 font-rajdhani text-[11px] tracking-[0.18em] text-emerald-300 hover:bg-emerald-400/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Play className="h-3.5 w-3.5" />
              START ROUND
            </button>
            <button
              type="button"
              onClick={handleResetRoundTimer}
              disabled={roundTimerLoading}
              className="inline-flex items-center gap-2 border border-copper/30 px-4 py-2.5 font-rajdhani text-[11px] tracking-[0.18em] text-copper hover:border-red-400/50 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              RESET TIMER
            </button>
          </div>
        </div>
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