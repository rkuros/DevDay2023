
(() => {
    /**
     * キーの押下状態を調べるためのオブジェクト
     * このオブジェクトはプロジェクトのどこからでも参照できるように
     * window オブジェクトのカスタムプロパティとして設定する
     * @global
     * @type {object}
     */
    window.isKeyDown = {};

    /**
     * canvas の幅
     * @type {number}
     */
    const CANVAS_WIDTH = 1280;
    /**
     * canvas の高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 700;
     /**
     * ゲームで利用するカード枚数
     * @type {number}
     */
    const CARD_COUNT = 16;
     /**
     * ゲームで利用するカードの幅
     * @type {number}
     */
    const CARD_WIDTH = 150;
     /**
     * ゲームで利用するカードの高さ
     * @type {number}
     */
     const CARD_HEIGHT = 150;
     /**
     * ゲームで利用するカードの行数
     * @type {number}
     */
    const COLUMN_COUNT = 4;
     /**
     * ゲームで利用するカードの列数
     * @type {number}
     */
    const ROW_COUNT = 4;
     /**
     * ゲームで利用するカードの行間のスペース
     * @type {number}
     */
    const COLUMN_SPACE = 20;
     /**
     * ゲームで利用するカードの列間のスペース
     * @type {number}
     */
    const ROW_SPACE = 30;
    
 
    /**
     * Canvas2D API をラップしたユーティリティクラス
     * @type {Canvas2DUtility}
     */
    let util = null;
    /**
     * 描画対象となる Canvas Element
     * @type {HTMLCanvasElement}
     */
    let canvas = null;
    /**
     * Canvas2D API のコンテキスト
     * @type {CanvasRenderingContext2D}
     */
    let ctx = null;
    /**
     * シーンマネージャー
     * @type {SceneManager}
     */
    let scene = null;
    /**
     * 実行開始時のタイムスタンプ
     * @type {number}
     */
    let startTime = null;
    /**
     * カードのインスタンスを格納する配列
     * @type {Array<card>}
     */
    let cardArray = [];
    /**
     * 画像のパスを格納する配列
     * @type {Array<card>}
     */
    let picture = []; //カード枚数+1番目は裏側
    /**
     * 現在のカーソルが指すカード番号
     * @type {Array<card>}
     */
    let cursorNum = 0;
    /**
     * キーアップ判定フラグ
     * @type {Array<card>}
     */
    let keyUp = true;
    /**
     * 現在のシーン
     * @type {Array<card>}
     */
    let activeScene = 'intro';
    /**
     * WebSocketコネクション
     * @type {Array<card>}
     */
    let wsConnection = null;
    /**
     * 最新の受信メッセージ
     * @type {Array<card>}
     */
    let message = null;
    /**
     * オープンカードカウント
     * @type {Array<card>}
     */
    let openCardNum = 0;
    

    /**
     * ページのロードが完了したときに発火する load イベント
     */
    window.addEventListener('load', () => {
        // ユーティリティクラスを初期化
        util = new Canvas2DUtility(document.body.querySelector('#main_canvas'));
        // ユーティリティクラスから canvas を取得
        canvas = util.canvas;
        // ユーティリティクラスから 2d コンテキストを取得
        ctx = util.context;
        // WebSocketのコネクションを確立
        wsConnection = new WebSocket('ws://');
        console.log("コネクションを開始しします。");
            //コネクションが接続された時の動き
        wsConnection.onopen = function(e) {
            console.log("コネクションを開始しました。");
        };
            //エラーが発生したされた時の動き
        wsConnection.onerror = function(error) {
            console.log("エラーが発生しました。");
        };
        // メッセージを受信したらmessageに保存
        wsConnection.onmessage = function(e) {
            message = JSON.parse(e.data);            
            console.log(message);
            console.log(message['card']);
        }

        // 初期化処理を行う
        initialize();
        // インスタンスの状態を確認する
        loadCheck();
    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){
        let i;

        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // シーンを初期化する
        scene = new SceneManager();

        // 画像のパスのリストを取得
        imageGet();

        // カードの初期化
        let cardNum = 0;
        for(i = 0; i < COLUMN_COUNT; ++i){
            for(j = 0; j < ROW_COUNT; ++j){
                cardArray[cardNum] = new Card(ctx, j*(ROW_SPACE+CARD_WIDTH)+(ROW_SPACE/2+CARD_WIDTH/2), i*(COLUMN_SPACE+CARD_HEIGHT)+(COLUMN_SPACE/2+CARD_HEIGHT/2), CARD_WIDTH, CARD_HEIGHT, picture[CARD_COUNT/2]);

                if(cardNum === CARD_COUNT){
                    break;
                }else{
                    cardNum += 1;
                }
            }
        }
    }

    /**
     * インスタンスの準備が完了しているか確認する
     */
    function loadCheck(){
        // 準備完了を意味する真偽値
        let ready = true;

        // 同様にカードの準備状況も確認する
        cardArray.map((v) => {
            ready = ready && v.ready;
        });        

        // 全ての準備が完了したら次の処理に進む
        if(ready === true){
            // イベントを設定する
            eventSetting();
            // シーンを定義する
            sceneSetting();
            // 実行開始時のタイムスタンプを取得する
            startTime = Date.now();
            // 描画処理を開始する
            render();
        }else{
            // 準備が完了していない場合は 0.1 秒ごとに再帰呼出しする
            setTimeout(loadCheck, 100);
        }
    }

    /**
     * イベントを設定する
     */
    function eventSetting(){
        // キーの押下時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keydown', (event) => {
            // キーの押下状態を管理するオブジェクトに押下されたことを設定する
            isKeyDown[`key_${event.key}`] = true;
        }, false);
        // キーが離された時に呼び出されるイベントリスナーを設定する
        window.addEventListener('keyup', (event) => {
            // キーが離されたことを設定する
            isKeyDown[`key_${event.key}`] = false;
            keyUp = true;
        }, false);
    }

    /**
     * シーンを設定する
     */
    function sceneSetting(){
        // イントロシーン
        scene.add('intro', (time) => {
            // メッセージを受信後の挙動
            wsConnection.onmessage = function(e) {
                message = JSON.parse(e.data);            
                console.log(message);
                console.log(message['card']);
            }
            
            ctx.font = 'bold 150px sans-serif';
            util.drawText('GameStart', 150, 150, 'black', CANVAS_WIDTH/2);
            ctx.font = 'bold 50px sans-serif';
            util.drawText('pressEnter', 300, 300, 'red', CANVAS_WIDTH/2);

            // Enterでシーンを card に変更する
            if(window.isKeyDown.key_Enter === true && keyUp === true){
                activeScene = 'login';
                scene.use(activeScene);
                keyUp = false;
            }
        });
        // ログインシーン
        scene.add('login', (time) => {
            util.drawText('Login', 150, 150, 'black', CANVAS_WIDTH/2);
            // 2 秒経過したらシーンを card に変更する
            if(time > 2.0){
                activeScene = 'userpage';
                scene.use(activeScene);
            }
        });
        // ユーザーページ
        scene.add('userpage', (time) => {
            util.drawText('User Page', 150, 150, 'black', CANVAS_WIDTH/2);
            // 2 秒経過したらシーンを card に変更する
            if(time > 2.0){
                activeScene = 'matching';
                scene.use(activeScene);
            }
        });
        // マッチングシーン
        scene.add('matching', (time) => {
            util.drawText('Matching Page', 150, 150, 'black', CANVAS_WIDTH/2);
            // 2 秒経過したらシーンを card に変更する
            if(time > 2.0){
                activeScene = 'chose';
                scene.use(activeScene);
            }
        });
        // カード選択ページ
        scene.add('chose', (time) => {
            wsConnection.onmessage = function(e) {
                message = JSON.parse(e.data);            
                console.log('charange');
                console.log(message['card']);
                cardArray[message.card].setImagePath(message['picture']);
                cardArray[message.card].setState(true);
                if(message['status'] === "Success"){
                    //openCardNum += 2;
                }
                openCardNum += 1;
            } 
            // 自分が選択者かの確認
            if(message['your_turn'] === true){
                // カーソルのイベントチェック
                cursorUpdate();

                // カードを更新する
                cardArray.map((v) => {
                    v.update();
                });

                // ゲーム終了判定
                if(openCardNum === CARD_COUNT){
                    activeScene = 'end';
                    scene.use(activeScene);
                }
            }else{
                activeScene = 'wait';
                scene.use(activeScene);
            }
        });
        // カード選択結果取得待ち
        scene.add('wait', (time) => {
            // メッセージを受信後の挙動
            wsConnection.onmessage = function(e) {
                message = JSON.parse(e.data);            
                console.log('charange');
                console.log(message['card']);
                cardArray[message.card].setImagePath(message['picture']);
                cardArray[message.card].setState(true);
                if(message['status'] === "Success"){
                    //openCardNum += 2;
                }
                openCardNum += 1;
            }
            if(message['your_turn'] === false){
                ctx.font = 'bold 150px sans-serif';
                util.drawText('Chosing wait', 150, 150, 'black', CANVAS_WIDTH/2);
    
                // カードを更新する
                cardArray.map((v) => {
                    v.update();
                });

                // ゲーム終了判定
                if(openCardNum === CARD_COUNT){
                    activeScene = 'end';
                    scene.use(activeScene);
                }
            }else{
                activeScene = 'chose';
                scene.use(activeScene);
            }
        });
        // ゲーム終了シーン
        scene.add('end', (time) => {
            // カードを更新する
            cardArray.map((v) => {
                v.update();
            });

            ctx.font = 'bold 150px sans-serif';
            util.drawText('Game Over', 150, 150, 'black', CANVAS_WIDTH/2);
            ctx.font = 'bold 50px sans-serif';
            util.drawText('press Q', 300, 300, 'red', CANVAS_WIDTH/2);

            // Qでシーンを userpage に変更する
            if(window.isKeyDown.key_q === true && keyUp === true){
                activeScene = 'userpage';
                scene.use(activeScene);
                keyUp = false;
            }
        });

        // 一番最初のシーンには intro を設定する
        scene.use(activeScene);
    }

    /**
     * 画像のパスのリストを取得する//場合によってはイメージのインスタンスを別途作る必要あるかも
     */
    function imageGet(){
        picture[0] = "./image/image_1.jpeg";
        picture[1] = "./image/image_3.jpeg";
        picture[2] = "./image/image_18.jpeg";
        picture[3] = "./image/image_22.jpeg";
        picture[4] = './image/image_25.jpeg';
        picture[5] = './image/image_33.jpeg';
        picture[6] = './image/image_35.jpeg';
        picture[7] = './image/image_39.jpeg';
        picture[8] = './image/card_rear.jpeg';
    }

    /**
     * どのカードがカーソルされているか判定
     */
    function cursorUpdate(){
        let oldCursolNum = cursorNum;
        cardArray[cursorNum].setCursor(false);

        if(window.isKeyDown.key_ArrowLeft === true && keyUp === true){
            cursorNum -= 1;  // アローキーの左
            keyUp = false;
        }
        if(window.isKeyDown.key_ArrowRight === true && keyUp === true){
            cursorNum += 1;  // アローキーの右
            keyUp = false;
        }
        if(window.isKeyDown.key_ArrowUp === true && keyUp === true){
            cursorNum -= ROW_COUNT;  // アローキーの上
            keyUp = false;
        }
        if(window.isKeyDown.key_ArrowDown === true && keyUp === true){
            cursorNum += ROW_COUNT;  // アローキーの下
            keyUp = false;
        }

        // 規定外の番号になっていないかチェック
        if(cursorNum < 0 || cursorNum > (CARD_COUNT-1)){
            cursorNum = oldCursolNum;
        }

        // カーソルの番号を更新
        cardArray[cursorNum].setCursor(true);

        // カードを決定
        if(window.isKeyDown.key_Enter === true){
            // カードの状態が裏ならエンター処理
            if(cardArray[cursorNum].getState() === false){
                //cardArray[cursorNum].setImagePath(picture[Math.floor( Math.random() * (7 + 1 - 0) ) + 0]);
                //cardArray[cursorNum].setState(true);
                // 選択したカードをサーバーに送信
                let a = {"card": cursorNum};
                console.log("Submit"+JSON.stringify(a));
                wsConnection.send(JSON.stringify(a));
                // 現在のカードがオープンされた数
                //openCardNum += 1;
                // シーンをCharangeに変更
                activeScene = 'charange';
                scene.use(activeScene);
            }
        }
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#eeeeee');
        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;

        // シーンを更新する
        scene.update();

        // 恒常ループのために描画処理を再帰呼出しする
        requestAnimationFrame(render);
    }

    /**
     * 特定の範囲におけるランダムな整数の値を生成する
     * @param {number} range - 乱数を生成する範囲（0 以上 ～ range 未満）
     */
    function generateRandomInt(range){
        let random = Math.random();
        return Math.floor(random * range);
    }
})();
