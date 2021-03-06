export interface Permission {
	/**
	 * Tickを記録する権限。
	 * プレイを(進めて)記録するのに十分な能力。
	 * (ただし実際になんらかのストレージに保存されるかどうかは、各AMFlow実装に委ねられる。)
	 *
	 * `AMFLow#authenticate()` によって得られたこの値が真である場合、AMFlowの次のメソッドを呼び出すことができる。
	 * * `sendTick()`
	 * * `putStartPoint()`
	 * * `putStorageData()`
	 * * `getStorageData()`
	 *
	 * 偽である場合、上記のメソッドは例外を送出するか、またはコールバックにエラーを渡す。
	 */
	writeTick: boolean;

	/**
	 * Tickを読み込む権限。
	 * 記録済みのプレイのログを取得し、そのプレイを再現するのに十分な能力。
	 *
	 * `AMFLow#authenticate()` によって得られたこの値が真である場合、AMFlowの次のメソッドを呼び出すことができる。
	 * * `getTicks()`
	 * * `getStartPoint()`
	 *
	 * 偽である場合、上記のメソッドはコールバックにエラーを渡す。
	 */
	readTick: boolean;

	/**
	 * リアルタイムに発行されるTickを受信する権限。
	 *
	 * `AMFLow#authenticate()` によって得られたこの値が真である場合、AMFlowの次のメソッドを呼び出すことができる。
	 * * `onTick()`
	 *
	 * 偽である場合、上記のメソッドは例外を送出する。
	 */
	subscribeTick: boolean;

	/**
	 * イベントを送信する権限。
	 *
	 * `AMFLow#authenticate()` によって得られたこの値が真である場合、AMFlowの次のメソッドを呼び出すことができる。
	 * * `sendEvent()`
	 *
	 * 偽である場合、上記のメソッドは例外を送出する。
	 */
	sendEvent: boolean;

	/**
	 * 送信されたイベントを受信する権限。
	 *
	 * `AMFLow#authenticate()` によって得られたこの値が真である場合、AMFlowの次のメソッドを呼び出すことができる。
	 * * `onEvent()`
	 *
	 * 偽である場合、上記のメソッドは例外を送出する。
	 */
	subscribeEvent: boolean;

	/**
	 * 送信できるイベントに指定できる最大優先度。
	 *
	 * `sendEvent()` で送信するイベントの優先度がこの値を上回っている場合、この値で上書きする必要がある。
	 *
	 */
	maxEventPriority: number;
}
