/**
 * ビルドテスト
 */

import * as playlog from "@akashic/playlog";
import * as AMFlow from "../lib";

enum Status {
	open,
	closed
}

function createAMFlowError(name: string, message: string): AMFlow.AMFlowError {
	var error = <AMFlow.AMFlowError> new Error(message);
	error.name = name;
	return error;
}

class MockSocket {
	connect(_url: string, callback?: (error: Error | null) => void): void {
		if (callback) {
			callback(null);
		}
	}
	close(callback?: (error: Error | null) => void): void {
		if (callback) {
			callback(null);
		}
	}
	send(_message: Buffer): void {
		// NOP
	}
}

class MockClient implements AMFlow.AMFlow {
	private status: Status;
	private url: string;
	private socket: MockSocket;

	private onTickHandlers: ((tick: playlog.Tick) => void)[];
	private onEventHandlers: ((event: playlog.Event) => void)[];

	constructor(url: string) {
		this.status = Status.closed;
		this.url = url;
		this.socket = new MockSocket();

		this.onTickHandlers = [];
		this.onEventHandlers = [];
	}
	open(_playId: string, callback?: (error: Error | null) => void): void {
		if (this.status !== Status.closed) {
			throw createAMFlowError("InvalidStatus", "not closed");
		}
		this.socket.connect(this.url, callback);
	}
	close(callback?: (error: Error | null) => void): void {
		if (this.status === Status.open) {
			this.socket.close(callback);
		}
		this.status = Status.closed;
	}
	authenticate(_token: string, callback: (error: Error | null, permission?: AMFlow.Permission) => void): void {
		callback(null, {
			writeTick: true,
			readTick: true,
			subscribeTick: true,
			sendEvent: true,
			subscribeEvent: true,
			maxEventPriority: 1
		});
		callback(new Error("error"));
	}
	sendTick(tick: playlog.Tick): void {
		if (this.status !== Status.open) {
			throw createAMFlowError("InvalidStatus", "session closed");
		}
		this.socket.send(this.encodeTick(tick));
	}
	onTick(handler: (tick: playlog.Tick) => void): void {
		this.onTickHandlers.push(handler);
	}
	offTick(handler: (event: playlog.Tick) => void): void {
		var handlers: ((event: playlog.Tick) => void)[] = [];
		this.onTickHandlers.forEach((registered) => {
			if (registered !== handler) {
				handlers.push(registered);
			}
		});
		this.onTickHandlers = handlers;
	}
	sendEvent(event: playlog.Event): void {
		if (this.status !== Status.open) {
			throw createAMFlowError("InvalidStatus", "session closed");
		}
		this.socket.send(this.encodeEvent(event));
	}
	onEvent(handler: (event: playlog.Event) => void): void {
		this.onEventHandlers.push(handler);
	}
	offEvent(handler: (event: playlog.Event) => void): void {
		var handlers: ((event: playlog.Event) => void)[] = [];
		this.onEventHandlers.forEach((registered) => {
			if (registered !== handler) {
				handlers.push(registered);
			}
		});
		this.onEventHandlers = handlers;
	}
	getTickList(
		_optsOrBegin: number | AMFlow.GetTickListOptions,
		_endOrCallback: number | ((error: Error | null, tickList?: playlog.TickList) => void),
		_callback?: (error: Error | null, tickList?: playlog.TickList) => void
	): void {
		throw createAMFlowError("NotImplemented", "MockClient#getTickList is not implemented.");
	}
	putStartPoint(_startPoint: AMFlow.StartPoint, _callback: (error: Error | null) => void): void {
		throw createAMFlowError("NotImplemented", "MockClient#putStartPoint is not implemented.");
	}
	getStartPoint(_opts: AMFlow.GetStartPointOptions, _callback: (error: Error | null, startPoint?: AMFlow.StartPoint) => void): void {
		throw createAMFlowError("NotImplemented", "MockClient#getStartPoint is not implemented.");
	}
	putStorageData(_key: playlog.StorageKey, _value: playlog.StorageValue, _options: any, _callback: (err: Error | null) => void): void {
		throw createAMFlowError("NotImplemented", "MockClient#putStorageData is not implemented.");
	}
	getStorageData(_keys: playlog.StorageReadKey[], _callback: (error: Error | null, values?: playlog.StorageData[]) => void): void {
		throw createAMFlowError("NotImplemented", "MockClient#getStorageData is not implemented.");
	}
	private encodeTick(_tick: playlog.Tick): Buffer {
		return new Buffer("dummy");
	}
	private encodeEvent(_event: playlog.Event): Buffer {
		return new Buffer("dummy");
	}
	private decodeTick(_tick: Buffer): playlog.Tick {
		return [1];
	}
	private decodeEvent(_event: Buffer): playlog.Event {
		return [1, 3, "100"];
	}

}

// callback args null/省略 check
const client = new MockClient("http://debug/url.arg");
client.getTickList = (_begin: number, _end: number, callback: (error: Error | null, tickList?: playlog.TickList) => void): void => {
	callback(null, [0, 1]);
	callback(new Error("error"));
};

client.putStartPoint = (_startPoint: AMFlow.StartPoint, callback: (error: Error | null) => void): void => {
	callback(new Error("error"));
	callback(null);
};

client.getStartPoint = (
	_opts: AMFlow.GetStartPointOptions,
	callback: (error: Error | null, startPoint?: AMFlow.StartPoint) => void
): void => {
	const startPoint = { frame: 1, timestamp: 2, data: null };
	callback(new Error("error"));
	callback(null, startPoint);
};

client.putStorageData =(
	_key: playlog.StorageKey,
	_value: playlog.StorageValue,
	_options: any,
	callback: (err: Error|null) => void
): void => {
	callback(new Error("error"));
	callback(null);
};

client.getStorageData = (
	_keys: playlog.StorageReadKey[],
	callback: (error: Error | null, values?: playlog.StorageData[]) => void
): void => {
	callback(new Error("error"));
	const data: playlog.StorageData = {
		readKey: { region: 1, regionKey: "rKey" },
		values: [{ data: 12345 }]
	};
	callback(null, [data]);
};
