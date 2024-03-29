import type * as playlog from "@akashic/playlog";
import type { Permission } from "./Permission";
import type { StartPoint } from "./StartPoint";

/**
 * AMFlow#getStartPoint() のオプション。
 */
export interface GetStartPointOptions {
	/**
	 * フレーム。
	 * 指定された場合、この値よりも小さい内で最大の `frame` を持つ開始地点情報を取得する。
	 * `timestamp` と同時に指定された場合、動作は不定である。
	 */
	frame?: number;
	/**
	 * タイムスタンプ。
	 * 指定された場合、この値よりも小さい内で最大の `timestamp` を持つ開始地点情報を取得する。
	 * `frame` と同時に指定された場合、動作は不定である。
	 */
	timestamp?: number;
}

export interface GetTickListOptions {
	begin: number;
	end: number;

	/**
	 * 除外する `playlog.Event` のフラグ。
	 * この値が指定された場合、対象の `playlog.Event` を除外した `playlog.TickList` を返す。
	 * 省略時は除外しない (すべての `playlog.Event` を `playlog.TickList` に含ませる)。
	 */
	excludeEventFlags?: GetTickListExcludeEventFlags;
}

export interface GetTickListExcludeEventFlags {
	/**
	 * `playlog.EventFlags.Ignorable` フラグが有効の `playlog.Event` を除外するかどうか。真の場合は除外する。
	 * 省略時は除外しない。
	 */
	ignorable?: boolean;
}

export interface AMFlow {
	// 各メソッドの分類をカテゴリとして表す
	// カテゴリ: セッション
	/**
	 * AMFlowのセッションを開始する。
	 */
	open(playId: string, callback?: (error: Error | null) => void): void;

	/**
	 * 開始済みのAMFlowのセッションを終了する。
	 */
	close(callback?: (error: Error | null) => void): void;

	/**
	 * セッションの認証を要求する。
	 */
	authenticate(token: string, callback: (error: Error | null, permission?: Permission) => void): void;

	// カテゴリ: リアルタイム
	/**
	 * `playlog.Tick` を送信する。
	 * `playlog.Tick` に含まれる `playlog.Event` の非永続化フラグが真の場合、そのイベントは `getTickList()` から除外される。
	 */
	sendTick(tick: playlog.Tick): void;

	/**
	 * `playlog.Tick` の受信ハンドラを登録する。
	 */
	onTick(handler: (tick: playlog.Tick) => void): void;

	/**
	 * `onTick` で登録した受信ハンドラの登録を解除する。
	 */
	offTick(handler: (tick: playlog.Tick) => void): void;

	/**
	 * `playlog.Event` を送信する。
	 */
	sendEvent(event: playlog.Event): void;

	/**
	 * `playlog.Event` の受信ハンドラを登録する。
	 */
	onEvent(handler: (event: playlog.Event) => void): void;

	/**
	 * `onEvent` で登録した受信ハンドラの登録を解除する。
	 */
	offEvent(handler: (event: playlog.Event) => void): void;

	// カテゴリ: キャッシュされたデータ
	/**
	 * 保存された `playlog.Tick` のリスト `[begin, end)` を `playlog.TickList` の形式で取得する。
	 * @deprecated この引数は非推奨である。 `GetTickListOptions` を指定する方を利用すべきである。
	 */
	getTickList(begin: number, end: number, callback: (error: Error | null, tickList?: playlog.TickList) => void): void;

	/**
	 * 保存された `playlog.Tick` のリスト `[opts.begin, opts.end)` を `playlog.TickList` の形式で取得する。
	 */
	getTickList(opts: GetTickListOptions, callback: (error: Error | null, tickList?: playlog.TickList) => void): void;

	/**
	 * 開始地点情報を保存する。
	 */
	putStartPoint(startPoint: StartPoint, callback: (error: Error | null) => void): void;

	/**
	 * 保存された開始地点情報を取得する。
	 * オプションとしてフレーム番号もタイムスタンプも指定しない場合は、0フレーム目の開始地点情報を取得する。
	 * オプションを指定した場合は、条件を満たすの直近の開始地点情報を取得する。
	 */
	getStartPoint(opts: GetStartPointOptions, callback: (error: Error | null, startPoint?: StartPoint) => void): void;

	// カテゴリ: ストレージ
	/**
	 * ストレージデータを保存する。
	 */
	putStorageData(key: playlog.StorageKey, value: playlog.StorageValue, options: any, callback: (err: Error | null) => void): void;

	/**
	 * ストレージデータを取得する。
	 */
	getStorageData(keys: playlog.StorageReadKey[], callback: (error: Error | null, values?: playlog.StorageData[]) => void): void;
}
