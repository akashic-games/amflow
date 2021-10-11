import * as pl from "@akashic/playlog";
import { AMFlow, GetStartPointOptions, GetTickListOptions, Permission, StartPoint } from "../../../lib";

const PERMISSION_ACTIVE = {
	writeTick: true,
	readTick: false,
	subscribeTick: false,
	sendEvent: false,
	subscribeEvent: true,
	maxEventPriority: 3
};

export class MockAmflow implements AMFlow {
	logs: string[] = [];

	onTickHandlers: ((tick: pl.Tick) => void)[] = [];
	onEventHandlers: ((event: pl.Event) => void)[] = [];

	constructor() {}

	open(playId: string, callback?: (error: Error | null) => void): void {
		if (!callback) return;
		if (isNaN(Number.parseInt(playId, 10))) {
			return callback(new Error("open-error"));
		}
		callback(null);
	}

	close(callback?: (error: Error | null) => void): void {
		if (callback)
			callback(new Error("close-error"));
	}

	authenticate(token: string, callback: (error: Error | null, permission?: Permission) => void): void {
		if (isNaN(Number.parseInt(token, 10))) {
			return callback(new Error("authenticate-error"));
		}
		callback(null, PERMISSION_ACTIVE);
	}

	sendTick(tick: pl.Tick): void {
		// this.logs.push(tick.join(','));
		this.logs.push(JSON.stringify(tick));
	}

	onTick(handler: (tick: pl.Tick) => void): void {
		this.onTickHandlers.push(handler);
	}

	offTick(handler: (tick: pl.Tick) => void): void {
		this.onTickHandlers = this.onTickHandlers.filter(h => h !== handler);
	}

	sendEvent(event: pl.Event): void {
		this.logs.push(JSON.stringify(event));
	}

	onEvent(handler: (event: pl.Event) => void): void {
		this.onEventHandlers.push(handler);
	}

	offEvent(handler: (event: pl.Event) => void): void {
		this.onEventHandlers = this.onEventHandlers.filter(h => h !== handler);
	}

	getTickList(
		optsOrBegin: number | GetTickListOptions,
		endOrCallback: number | ((error: Error | null, tickList?: pl.TickList) => void),
		callbackOrUndefined?: (error: Error | null, tickList?: pl.TickList) => void
	): void {
		let opts: GetTickListOptions;
		let callback: ((error: Error | null, tickList?: pl.TickList) => void);

		if (typeof optsOrBegin === "number") {
			// NOTE: optsOrBegin === "number" であれば必ず amflow@2 以前の引数だとみなしてキャストする
			opts = {
				begin: optsOrBegin,
				end: endOrCallback as number
			};
			callback = callbackOrUndefined as (error: Error | null, tickList?: pl.TickList) => void;
		} else {
			// NOTE: optsOrBegin !== "number" であれば必ず amflow@3 以降の引数だとみなしてキャストする
			opts = optsOrBegin;
			callback = endOrCallback as (error: Error | null, tickList?: pl.TickList) => void;
		}

		this.logs.push(`${opts.begin},${opts.end}`);
		if (opts.begin >= 10) {
			return callback(new Error("getTickList-error"));
		}

		const tickList: pl.TickList = [opts.begin, opts.end, []];
		callback(null, tickList);
	}

	putStartPoint(startPoint: StartPoint, callback: (error: Error | null) => void): void {
		this.logs.push(JSON.stringify(startPoint));
		callback(startPoint.frame !== 0 ? new Error("putStartPoint-error") : null);

	}

	getStartPoint(opts: GetStartPointOptions, callback: (error: Error | null, startPoint?: StartPoint) => void): void {
		this.logs.push("getStartPoint");
		if(opts.frame === 0) {
			callback(null, { frame: 0, data: { foo: false }, timestamp: 100 });
		} else {
			callback(new Error("getStartPoint-error"));
		}
	}

	putStorageData(key: pl.StorageKey, _value: pl.StorageValue, _options: any, callback: (err: Error | null) => void): void {
		this.logs.push("putStorageData");
		if (key.region === 0) {
			callback(null);
		} else {
			callback(new Error("putStorageData-error"));
		}
	}

	getStorageData(keys: pl.StorageReadKey[], callback: (error: Error | null, values?: pl.StorageData[]) => void): void {
		this.logs.push("getStorageData");
		if (keys[0].region === 0) {
			const data: pl.StorageData[] = [{
				readKey: {
					region: 0,
					regionKey: "test"
				},
				values: [{
					data: 1
				}]
			}];
			callback(null, data);
		} else {
			callback(new Error("getStorageData-error"));
		}
	}
}
