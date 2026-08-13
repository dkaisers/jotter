import { writable, get } from 'svelte/store';
import { settings, type ChimeId } from './theme';
import { workspace } from './store';
import { setActiveSpace, updateTodo } from './operations';

export interface TimerRef {
	spaceId: string;
	columnId: string;
	cardId: string;
	todoId: string;
}

export interface TimerToast {
	id: number;
	body: string;
	ref: TimerRef;
}

/** Wall clock, ticked once a second so countdown pills stay live. */
export const now = writable(Date.now());

/** In-app toasts shown when timers end while the tab is focused (stacked). */
export const toasts = writable<TimerToast[]>([]);

let toastSeq = 0;

function pushToast(body: string, ref: TimerRef) {
	const t: TimerToast = { id: ++toastSeq, body, ref };
	toasts.update((list) => {
		const next = [...list, t];
		return next.length > 5 ? next.slice(next.length - 5) : next;
	});
}

/** todoId whose timer popover is open (at most one at a time). */
export const openTimerId = writable<string | null>(null);

// ---- countdown helpers ----

export function formatRemaining(ms: number): string {
	// floor to whole seconds first so a stale clock (up to ~1s behind) can't
	// push a fresh timer up a minute (5:00.9 → 6)
	const totalMin = Math.max(0, Math.ceil(Math.floor(ms / 1000) / 60));
	const h = Math.floor(totalMin / 60);
	const m = totalMin % 60;
	return `${h}:${String(m).padStart(2, '0')}`;
}

// ---- timer operations ----

export function startTimer(ref: TimerRef, minutes: number) {
	if (typeof window !== 'undefined' && 'Notification' in window) {
		if (Notification.permission === 'default') void Notification.requestPermission();
	}
	updateTodo(ref.spaceId, ref.columnId, ref.cardId, ref.todoId, {
		timer: { endsAt: Date.now() + minutes * 60000 }
	});
}

export function clearTimer(ref: TimerRef) {
	updateTodo(ref.spaceId, ref.columnId, ref.cardId, ref.todoId, { timer: undefined });
}

/** Switches to the todo's space and briefly highlights it. */
export function focusTodo(ref: TimerRef) {
	setActiveSpace(ref.spaceId);
	setTimeout(() => {
		const el = document.querySelector(`[data-todo-id="${CSS.escape(ref.todoId)}"]`);
		if (!el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		el.classList.add('flash-highlight');
		setTimeout(() => el.classList.remove('flash-highlight'), 1600);
	}, 100);
}

// ---- chimes (Web Audio, no assets) ----

let audio: AudioContext | null = null;

function getCtx(): AudioContext | null {
	if (typeof window === 'undefined') return null;
	try {
		if (!audio) audio = new AudioContext();
		if (audio.state === 'suspended') void audio.resume();
		return audio;
	} catch {
		return null;
	}
}

function tone(
	c: AudioContext,
	opts: { freq: number; start: number; dur: number; gain: number; type?: OscillatorType }
) {
	const osc = c.createOscillator();
	const g = c.createGain();
	osc.type = opts.type ?? 'sine';
	osc.frequency.value = opts.freq;
	const t0 = c.currentTime + opts.start;
	g.gain.setValueAtTime(0.0001, t0);
	g.gain.exponentialRampToValueAtTime(opts.gain, t0 + 0.015);
	g.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.dur);
	osc.connect(g);
	g.connect(c.destination);
	osc.start(t0);
	osc.stop(t0 + opts.dur + 0.05);
}

export function playChime(kind: ChimeId) {
	if (kind === 'none') return;
	const c = getCtx();
	if (!c) return;
	try {
		if (kind === 'ping') {
			tone(c, { freq: 2200, start: 0, dur: 0.45, gain: 0.12 });
		} else if (kind === 'boom') {
			tone(c, { freq: 180, start: 0, dur: 1.1, gain: 0.35 });
			tone(c, { freq: 112, start: 0.03, dur: 1.25, gain: 0.3 });
		} else if (kind === 'bubbles') {
			tone(c, { freq: 660, start: 0, dur: 0.35, gain: 0.15 });
			tone(c, { freq: 880, start: 0.12, dur: 0.35, gain: 0.15 });
			tone(c, { freq: 1100, start: 0.24, dur: 0.4, gain: 0.13 });
		}
	} catch {
		// audio unavailable, ignore
	}
}

// ---- ticker & cross-tab dedup ----

interface LiveTimer extends TimerRef {
	text: string;
	endsAt: number;
}

/**
 * Timers discovered while still in the future. Past timers are only ever
 * "discovered" by a freshly opened tab if they were started before the app was
 * closed, in which case they show as due but never fire.
 */
const live = new Map<string, LiveTimer>();

function iterateTimers(fn: (ref: TimerRef, endsAt: number) => void) {
	for (const space of get(workspace).spaces) {
		for (const col of space.columns) {
			for (const card of col.cards) {
				if (card.type !== 'todo') continue;
				for (const todo of card.todos) {
					if (!todo.timer) continue;
					fn(
						{
							spaceId: space.id,
							columnId: col.id,
							cardId: card.id,
							todoId: todo.id
						},
						todo.timer.endsAt
					);
				}
			}
		}
	}
}

function sync() {
	const present = new Set<string>();
	const ts = Date.now();
	iterateTimers((ref, endsAt) => {
		present.add(ref.todoId);
		const prev = live.get(ref.todoId);
		if (prev) {
			if (prev.endsAt !== endsAt) live.set(ref.todoId, { ...ref, endsAt, text: todoText(ref) });
		} else if (endsAt > ts) {
			live.set(ref.todoId, { ...ref, endsAt, text: todoText(ref) });
		}
	});
	for (const id of [...live.keys()]) {
		if (!present.has(id)) live.delete(id);
	}
}

function todoText(ref: TimerRef): string {
	let text = '';
	for (const space of get(workspace).spaces) {
		for (const col of space.columns) {
			for (const card of col.cards) {
				if (card.type !== 'todo') continue;
				for (const todo of card.todos) {
					if (todo.id === ref.todoId) text = todo.text;
				}
			}
		}
	}
	return text;
}

async function fireIfDue() {
	const ts = Date.now();
	for (const [todoId, timer] of live) {
		if (timer.endsAt > ts) continue;
		live.delete(todoId);
		void notify(timer);
	}
}

/**
 * Shows one notification/toast per expired timer, exactly once across tabs.
 * Whoever wins the per-timer Web Lock is the notifier; the rest stand down.
 */
async function notify(timer: LiveTimer) {
	if (typeof navigator !== 'undefined' && navigator.locks) {
		let won = false;
		await navigator.locks.request(
			`jotter:timer:${timer.todoId}:${timer.endsAt}`,
			{ ifAvailable: true },
			async () => {
				won = true;
				await doNotify(timer);
			}
		);
		if (!won) return;
	} else {
		await doNotify(timer);
	}
}

async function doNotify(timer: LiveTimer) {
	const visible = typeof document !== 'undefined' && document.visibilityState === 'visible';
	const canNotify =
		typeof window !== 'undefined' &&
		'Notification' in window &&
		Notification.permission === 'granted';
	if (visible || !canNotify) {
		pushToast(timer.text, timer);
		if (visible) playChime(get(settings).timerChime);
	} else {
		try {
			const n = new Notification("Time's up", { body: timer.text, tag: timer.todoId });
			n.onclick = () => {
				window.focus();
				n.close();
				focusTodo(timer);
			};
		} catch {
			pushToast(timer.text, timer);
		}
	}
	// the timer fired; it stays "due" until the user clears/restarts it or marks
	// the todo done — nothing auto-clears it
}

let running = false;

export function startTicker() {
	if (running || typeof window === 'undefined') return;
	running = true;
	const tick = () => {
		now.set(Date.now());
		sync();
		void fireIfDue();
	};
	tick();
	setInterval(tick, 1000);
	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') tick();
	});
}
