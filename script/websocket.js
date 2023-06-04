/**
 * Websocket Connectionを管理するためのクラス
 */
class WebSocket {
    /**
     * @constructor
     */
    constructor(){
        /**
         * コネクションインスタンスを格納するためのオブジェクト
         * @type {object}
         */
        this.connection = null;
    }

    // セッションを開始する
    openChannel(){
        console.log("コネクションを開始しします。");
        this.connection = new WebSocket('ws');

        //コネクションが接続された時の動き
        this.connection.onopen = function(e) {
            console.log("コネクションを開始しました。");
            return(this.connection);
        };
        
       //エラーが発生したされた時の動き
        this.connection.onerror = function(error) {
            console.log("エラーが発生しました。");
            return(null);
        };
    }

    // セッションを終了する
    closeChannel(){
        this.connection.close();
        console.log("コネクションを終了しました。");
    }

    // メッセージを送信する
    sendMessage(message){
        this.connection.send(message);
        console.log("メッセージを送信しました。");
    }

    // メッセージを受信する
    getMessage(){

    }

    /**
     * シーンを更新する
     */
    update(){
        // シーンがアクティブになってからの経過時間（秒）
        let activeTime = (Date.now() - this.startTime) / 1000;
        // 経過時間を引数に与えて updateFunction を呼び出す
        this.activeScene(activeTime);
        // シーンを更新したのでカウンタをインクリメントする
        ++this.frame;
    }
}