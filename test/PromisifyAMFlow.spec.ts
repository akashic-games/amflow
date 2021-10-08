import { promisifyAMFlow, PromisifiedAMFlow } from "../src/auxiliary/PromisifyAMFlow";
import { MockAmflow} from "./helpers/src/MockAMFlow";
import * as pl from "@akashic/playlog";

describe("PromisifyAMFlow", () => {
	it("promisifyAMFlow", () => {
		const promisifiedAMFlow = promisifyAMFlow(new MockAmflow());

		expect(promisifiedAMFlow.open).toBeDefined();
		expect(promisifiedAMFlow.close).toBeDefined();
		expect(promisifiedAMFlow.authenticate).toBeDefined();
		expect(promisifiedAMFlow.onTick).toBeDefined();
		expect(promisifiedAMFlow.offTick).toBeDefined();
		expect(promisifiedAMFlow.onEvent).toBeDefined();
		expect(promisifiedAMFlow.offEvent).toBeDefined();
		expect(promisifiedAMFlow.getTickList).toBeDefined();
		expect(promisifiedAMFlow.putStartPoint).toBeDefined();
		expect(promisifiedAMFlow.getStartPoint).toBeDefined();
		expect(promisifiedAMFlow.putStorageData).toBeDefined();
		expect(promisifiedAMFlow.getStartPoint).toBeDefined();
		expect(promisifiedAMFlow.sendTick).toBeDefined();
		expect(promisifiedAMFlow.sendEvent).toBeDefined();
	});

	it("Function open ", async () => {
		const promisifiedAMFlow = promisifyAMFlow(new MockAmflow());
		let cnt = 0;
		const calledFunc = (): void => void cnt++;

		await promisifiedAMFlow.open("0")
			.then(() => calledFunc());
		expect(cnt).toBe(1);

		let errMsg = "";
		await promisifiedAMFlow.open("testId") // 引数が数値にパースできなければモックでエラーとしている
			.then(() => calledFunc())
			.catch ((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("open-error");
	});

	it("Function close ", async () => {
		const promisifiedAMFlow = promisifyAMFlow(new MockAmflow());

		let errMsg = "";
		await promisifiedAMFlow.close() // モックで必ずエラーとなるようになっている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("close-error");
	});

	it("Function authenticate ", async () => {
		const promisifiedAMFlow = promisifyAMFlow(new MockAmflow());
		let permission;

		await promisifiedAMFlow.authenticate("0")
			.then((perm) => permission = perm);
		expect(permission).toEqual({
			writeTick: true,
			readTick: false,
			subscribeTick: false,
			sendEvent: false,
			subscribeEvent: true,
			maxEventPriority: 3
		});

		let errMsg = "";
		await promisifiedAMFlow.authenticate("token") // 引数が数値にパースできなければモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("authenticate-error");
	});

	it("Function sendTick ", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		const tick: pl.Tick = [1, [[32, 0, "foo", {}]]];
		promisifiedAMFlow.sendTick(tick);
		expect(mockAmflow.logs.length).toBe(1);
		expect(mockAmflow.logs[0]).toBe(JSON.stringify(tick));
	});

	it("Function onTick and offTick ", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		const tickHandler = (_tick: pl.Tick): void => {};
		promisifiedAMFlow.onTick(tickHandler);
		expect(mockAmflow.onTickHandlers.length).toBe(1);
		expect(mockAmflow.onTickHandlers[0]).toBe(tickHandler);

		promisifiedAMFlow.offTick(tickHandler);
		expect(mockAmflow.onTickHandlers.length).toBe(0);
	});

	it("Function sendEvent", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		const event: pl.Event = [32, 0, "zoo", { some: "data" }];
		promisifiedAMFlow.sendEvent(event);
		expect(mockAmflow.logs.length).toBe(1);
		expect(mockAmflow.logs[0]).toBe(JSON.stringify(event));
	});

	it("Function onEvent and offEvent ", () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		const eventHandler = (_event: pl.Event): void => {}
		promisifiedAMFlow.onEvent(eventHandler);
		expect(mockAmflow.onEventHandlers.length).toBe(1);
		expect(mockAmflow.onEventHandlers[0]).toBe(eventHandler);

		promisifiedAMFlow.offEvent(eventHandler);
		expect(mockAmflow.onEventHandlers.length).toBe(0);
	});

	it("Function getTickList ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		let result;
		const opts = {begin: 0, end: 10};
		await promisifiedAMFlow.getTickList(opts)
			.then((tick) => result = tick);
		expect(result).toEqual([0, 10, []]);
		expect(mockAmflow.logs[0]).toBe(`${opts.begin},${opts.end}`);

		let errMsg = "";
		await promisifiedAMFlow.getTickList({begin: 11, end: 15}) // 引数 begin が10以上ならモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getTickList-error");
	});

	it("Function getTickList (deprecated)", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		let result;
		await promisifiedAMFlow.getTickList(0, 10)
			.then((tick) => result = tick);
		expect(result).toEqual([0, 10, []]);
		expect(mockAmflow.logs[0]).toBe("0,10");

		let errMsg = "";
		await promisifiedAMFlow.getTickList(11, 15) // 引数 begin が10以上ならモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getTickList-error");
	});

	it("Function putStartPoint ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);
		let cnt = 0;
		const calledFunc = (): void => void cnt++;

		const startPoint = { frame: 0, data: { foo: false }, timestamp: 100 };
		await promisifiedAMFlow.putStartPoint(startPoint)
			.then(() => calledFunc());
		expect(cnt).toBe(1);
		expect(mockAmflow.logs[0]).toBe(JSON.stringify(startPoint));

		let errMsg = "";
		await promisifiedAMFlow.putStartPoint({ frame: 1, data: { foo: false }, timestamp: 100 }) // frame が 0 以外ならモックでエラーとしている
			.then(() => calledFunc())
			.catch((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("putStartPoint-error");
	});

	it("Function getStartPoint ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		let result;
		await promisifiedAMFlow.getStartPoint({frame: 0})
			.then((startPoint) => result = startPoint);

		expect(mockAmflow.logs[0]).toBe("getStartPoint");
		expect(result).toEqual({ frame: 0, data: { foo: false }, timestamp: 100 });

		let errMsg = "";
		await promisifiedAMFlow.getStartPoint({ frame: 1 }) // frame が 0 以外ならモックでエラーとしている
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getStartPoint-error");
	});

	it("Function putStorageData ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);
		let cnt = 0;
		const calledFunc = () => cnt++;

		const arg = { region: 0, regionKey: "test"};
		const value =  { data: "value"};
		await promisifiedAMFlow.putStorageData(arg, value, {})
			.then(() => calledFunc());
		expect(cnt).toBe(1);
		expect(mockAmflow.logs[0]).toBe("putStorageData");

		let errMsg = "";
		arg.region = 1; // region が 0 以外ならモックでエラーとしている
		await promisifiedAMFlow.putStorageData(arg, value, {})
			.then(() => calledFunc())
			.catch((e) => errMsg = e.message);
		expect(cnt).toBe(1);
		expect(errMsg).toBe("putStorageData-error");
	});

	it("Function getStorageData ", async () => {
		const mockAmflow = new MockAmflow();
		const promisifiedAMFlow = promisifyAMFlow(mockAmflow);

		let result;
		const key = { region: 0, regionKey: "test" };
		await promisifiedAMFlow.getStorageData( [key])
			.then((value: pl.StorageData[] | undefined) => result = value);

		expect(mockAmflow.logs[0]).toBe("getStorageData");
		expect(result).toEqual([{readKey: {region: 0, regionKey: "test"}, values: [{data: 1}]}]);

		let errMsg = "";
		key.region = 1; // region が 0 以外ならモックでエラーとしている
		await promisifiedAMFlow.getStorageData([key])
			.catch((e) => errMsg = e.message);
		expect(errMsg).toBe("getStorageData-error");
	});
})
