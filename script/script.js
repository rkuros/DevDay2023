
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
    const CANVAS_WIDTH = 1000;
    /**
     * canvas の高さ
     * @type {number}
     */
    const CANVAS_HEIGHT = 800;
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
    const COLUMN_SPACE = 30;
     /**
     * ゲームで利用するカードの列間のスペース
     * @type {number}
     */
    const ROW_SPACE = 30;
    /**
     * 爆発エフェクトの最大個数
     * @type {number}
     */
    const EXPLOSION_MAX_COUNT = 10;
    /**
     * Cognito Identity Pool ID
     * @type {number}
     */
    const IDENTITYPOOLID = 'ap-northeast-1:8fb75855-967f-4b01-aea4-4eb49a1f15fc';
     /**
      * 背景を流れる星の個数
      * @type {number}
      */
     const BACKGROUND_STAR_MAX_COUNT = 130;
     /**
      * 背景を流れる星の最大サイズ
      * @type {number}
      */
     const BACKGROUND_STAR_MAX_SIZE = 3;
     /**
      * 背景を流れる星の最大速度
      * @type {number}
      */
     const BACKGROUND_STAR_MAX_SPEED = 4;
    
 
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
     * Charenging中のカード保存
     * @type {Array<card>}
     */
    let charengeCardNum = null;
    /**
     * 爆発エフェクトのインスタンスを格納する配列
     * @type {Array<Explosion>}
     */
    let explosionArray = [];
    /**
     * 自分の得点
     * @type {Array<Explosion>}
     */
    let myScore = 0;
    /**
     * 相手の得点
     * @type {Array<Explosion>}
     */
    let enemyScore = 0;
    /**
     * スコアの位置
     * @type {Array<Explosion>}
     */
    let scoreX = 300;
    let scoreY = 780;
    /**
     * Cognitoインスタンス用
     * @type {Array<Explosion>}
     */
    let cognitoidentity = null;
    /**
     * Cognito Identity
     * @type {Array<Explosion>}
     */
    let identityId = null;
    let accessKeyId = null;
    let secretKey = null;
    let sessionToken = null;
    /**
     * 効果音再生のための Sound クラスのインスタンス
     * @type {Sound}
     */
    let bgm = null;
    let flipsound = null;
    /**
     * 流れる星のインスタンスを格納する配列
     * @type {Array<BackgroundStar>}
     */
    let backgroundStarArray = [];
    /**
     * ユーザーのコンポーネントを格納する
     * @type {Array<BackgroundStar>}
     */
    let user = null;

    let matchFlag = 1;

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
        // canvas の大きさを設定
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;

        // ユーザーがクリック操作を行った際に初めてオーディオ関連の処理を開始する
        bgm = new Sound();
        flipsound = new Sound();
        // 音声データを読み込み、準備完了してから初期化処理を行う
        bgm.load('./sound/clearsky.mp3', (error) => {
            // もしエラーが発生した場合はアラートを表示して終了する
            if(error != null){
                alert('ファイルの読み込みエラーです');
                return;
            }
        });
        flipsound.load('./sound/open.mp3', (error) => {
            // もしエラーが発生した場合はアラートを表示して終了する
            if(error != null){
                alert('ファイルの読み込みエラーです');
                return;
            }
        });

        // 期化処理を行う
        initialize();
        // インスタンスの状態を確認する
        loadCheck();

    }, false);

    /**
     * canvas やコンテキストを初期化する
     */
    function initialize(){

        // シーンを初期化する
        scene = new SceneManager();

        // 画像のパスのリストを取得
        imageGet();

        // 爆発エフェクトを初期化する
        for(i = 0; i < EXPLOSION_MAX_COUNT; ++i){
            explosionArray[i] = new Explosion(ctx, 150.0, 20, 50.0, 1.0);
            // 爆発エフェクト発生時に効果音を再生できるよう設定する
            explosionArray[i].setSound(flipsound);
        }

        // 流れる星を初期化する
        for(i = 0; i < BACKGROUND_STAR_MAX_COUNT; ++i){
            // 星の速度と大きさはランダムと最大値によって決まるようにする
            let size  = 1 + Math.random() * (BACKGROUND_STAR_MAX_SIZE - 1);
            let speedX = getRandomInt(-5,5);
            let speedY = getRandomInt(-5,5);
            if(speedX === 0 && speedY === 0){
                speedX = 2;
            }
            // 星のインスタンスを生成する
            backgroundStarArray[i] = new BackgroundStar(ctx, size, speedX, speedY);
            // 星の初期位置
            backgroundStarArray[i].set(CANVAS_WIDTH/2, CANVAS_HEIGHT/2-10);
        }

        // ユーザページのコンポーネント初期化
        user = new Card(ctx, 150, 200, 200, 220, picture[generateRandomInt(3)+CARD_COUNT/2+1]);

        // Amazon Cognito 認証情報プロバイダーを初期化します
        AWS.config.region = 'ap-northeast-1'; // リージョン
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: IDENTITYPOOLID,
        });
        cognitoidentity = new AWS.CognitoIdentity();
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
            ctx.font = 'bold 50px sans-serif';
            util.drawText('pressEnter', 300, 300, 'red', CANVAS_WIDTH/2);

            // Enterでシーンを card に変更する
            if(window.isKeyDown.key_Enter === true && keyUp === true){
                // Cognito Identity IDの取得
                let params = {
                    IdentityPoolId: IDENTITYPOOLID, /* required */
                    /*AccountId: 'STRING_VALUE',
                    Logins: {
                      '<IdentityProviderName>': 'STRING_VALUE',
                      /* '<IdentityProviderName>': ... 
                    }*/
                };
                cognitoidentity.getId(params, function(err, data) {
                    if(err){
                        // an error occurred
                        console.log(err, err.stack);
                    } 
                    else{
                        // successful response
                        identityId = data['IdentityId'];
                        console.log(data);
                    }         
                });

                keyUp = false;
            }

            if(identityId !== null){
                // 一時的なIAMクレデンシャルの取得
                params = {
                    IdentityId: identityId, /* required */
                    /*CustomRoleArn: 'STRING_VALUE',
                    Logins: {
                      '<IdentityProviderName>': 'STRING_VALUE',
                      /* '<IdentityProviderName>': ... 
                    }*/
                };
                cognitoidentity.getCredentialsForIdentity(params, function(err, data) {
                    if(err){
                        // an error occurred
                        console.log(err, err.stack);
                    }else{
                        // successful response
                        console.log(data);
                        accessKeyId = data['Credentials']['AccessKeyId'];
                        secretKey = data['Credentials']['SecretKey'];
                        sessionToken = data['Credentials']['SessionToken'];
                    }
                });

                activeScene = 'userpage';
                scene.use(activeScene);
                // BGM再生
                bgm.playloop();
            }
        });
        // ユーザーページ
        scene.add('userpage', (time) => {
            ctx.font = 'bold 30px sans-serif';
            util.drawText('user 1', 100, 340, 'white', CANVAS_WIDTH);
            ctx.font = 'bold 20px sans-serif';
            util.drawText('accessKeyId: '+accessKeyId, 300, 150, 'red', CANVAS_WIDTH);
            util.drawText('secretKey: '+secretKey, 300, 200, 'red', CANVAS_WIDTH);
            util.drawText('sessionToken: '+sessionToken, 300, 250, 'red', CANVAS_WIDTH);
            ctx.font = 'bold 70px sans-serif';
            util.drawText('Game Start', 300, 680, 'Cyan', CANVAS_WIDTH);
            ctx.font = 'bold 30px sans-serif';
            util.drawText('press M', 440, 720, 'Cyan', CANVAS_WIDTH);


            // Mでシーンを card に変更する
            if(window.isKeyDown.key_m === true && keyUp === true){
                activeScene = 'matching';
                scene.use(activeScene);
                keyUp = false;
            }

            // ユーザページのコンポーネント表示
            user.update();
            
        });
        // マッチングシーン
        scene.add('matching', (time) => {
            // 背景エフェクトの状態を更新する
            backgroundStarArray.map((v) => {
                v.update();
            }); 

            // 点滅する待機文字
            ctx.font = 'bold 50px sans-serif';
            ctx.globalAlpha = Math.abs(Math.sin((Date.now() - time)/1000));
            util.drawText('Now Matching...', 300, 350, 'yellow', CANVAS_WIDTH/2);
            ctx.globalAlpha = 1.0;

            // WebSocketのコネクションを確立
            if (matchFlag === 1){
                initializeWSconnection('ws://43.207.52.1:9002?playerSessionId=test');
                matchFlag = 0;
            }

            // メッセージを受信してstartなら後続処理
            wsConnection.onmessage = function(e) {
                message = JSON.parse(e.data);            
                console.log(message);
                if(message['status'] === "start"){
                    picture[CARD_COUNT/2] = message['picture'];
                }
                // カードの初期化
                let cardNum = 0;
                for(i = 0; i < COLUMN_COUNT; ++i){
                    for(j = 0; j < ROW_COUNT; ++j){
                        cardArray[cardNum] = new Card(ctx, j*(ROW_SPACE+CARD_WIDTH)+(ROW_SPACE/2+CARD_WIDTH/2)+140, i*(COLUMN_SPACE+CARD_HEIGHT)+(COLUMN_SPACE/2+CARD_HEIGHT/2)+20, CARD_WIDTH, CARD_HEIGHT, picture[CARD_COUNT/2]);
                        if(cardNum === CARD_COUNT){
                            break;
                        }else{
                            cardNum += 1;
                        }
                    }
                }
            }
            
            // 7 秒経過したらシーンを card に変更する
            if(time > 7.0){
                activeScene = 'choose';
                scene.use(activeScene);

                // ゲーム時のメッセージ受信イベントを定義
                wsConnection.onmessage = function(e) {
                    message = JSON.parse(e.data);            
                    console.log(message);
                    cardArray[message.card].setImagePath(message['picture']);
                    cardArray[message.card].setState(true);

                    // エフェクトの発生
                    for(let i = 0; i < explosionArray.length; ++i){
                        // 発生していない爆発エフェクトがあれば対象の位置に生成する
                        if(explosionArray[i].life !== true){
                            let y = cardArray[message.card].position.getY();
                            let x = cardArray[message.card].position.getX();
                            explosionArray[i].set(x, y);
                            break;
                        }
                    }

                    // スコアの更新
                    myScore = message.your_score;
                    enemyScore = message.opponent_score;
                    
                    if(message['status'] === "challenging"){
                        //選んだ１枚目をキャッシュ
                        charengeCardNum = message['card'];
                    }else{
                        // シーンをstopに変更
                        activeScene = 'stop';
                        scene.use(activeScene);
                    }
                }
                // BGM停止
                bgm.stop();
            }
        });
        // カード選択ページ
        scene.add('choose', (time) => {
            // 自分が選択者かの確認
            if(message['your_turn'] === true){
                // カーソルのイベントチェック
                cursorUpdate();
                // Submitのチェック
                challengeSubmit();

                // 背景エフェクトの状態を更新する
                backgroundStarArray.map((v) => {
                    v.update();
                });                

                // カードを更新する
                cardArray.map((v) => {
                    v.update();
                });

                // スコアを更新
                updatePoint(ctx, util, myScore, enemyScore, scoreX, scoreY, CANVAS_WIDTH/2);
                util.drawCircle(scoreX-30, scoreY-11, 17, color='cyan');

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
        // 相手がカードを選んでいるときのシーン
        scene.add('wait', (time) => {
            if(message['your_turn'] === false){
                ctx.font = 'bold 150px sans-serif';
                util.drawText('Chosing wait', 150, 150, 'black', CANVAS_WIDTH/2);

                // 背景エフェクトの状態を更新する
                backgroundStarArray.map((v) => {
                    v.update();
                });

                // カードを更新する
                cardArray.map((v) => {
                    v.update();
                });

                // スコアを更新
                updatePoint(ctx, util, myScore, enemyScore, scoreX, scoreY, CANVAS_WIDTH/2);
                util.drawCircle(scoreX+220, scoreY-11, 17, color='cyan');

                // ゲーム終了判定
                if(openCardNum === CARD_COUNT){
                    activeScene = 'end';
                    scene.use(activeScene);
                }
            }else{
                
            }
        });
        // 結果待機シーン
        scene.add('stop', (time) => {
            // 1 秒経過したらシーンを choose に変更する
            if(time > 1.4){
                // Success ならカードのオープンになったカードの枚数を表示
                if(message['status'] === "Success"){
                    openCardNum += 2;
                }
                // 失敗していたらカードを裏に戻す
                if(message['status'] === "Failed"){
                    cardArray[message.card].setImagePath(picture[CARD_COUNT/2]);
                    cardArray[message.card].setState(false);
                    cardArray[charengeCardNum].setImagePath(picture[CARD_COUNT/2]);
                    cardArray[charengeCardNum].setState(false);
                }
                // シーンを変更する
                activeScene = 'choose';
                scene.use(activeScene);
            }
            
            // 背景エフェクトの状態を更新する
            backgroundStarArray.map((v) => {
                v.update();
            });
            // カードを更新する
            cardArray.map((v) => {
                v.update();
            });
            // スコアを更新
            updatePoint(ctx, util, myScore, enemyScore, scoreX, scoreY, CANVAS_WIDTH/2);

            if(message['status'] === "Success"){
                ctx.font = 'bold 60px sans-serif';
                util.drawText('SUCCESS', 380, 400, 'yellow', CANVAS_WIDTH/2);
            }else{
                ctx.font = 'bold 60px sans-serif';
                util.drawText('FAILED', 400, 400, 'yellow', CANVAS_WIDTH/2);
            }
        });
        // ゲーム終了シーン
        scene.add('end', (time) => {
            // 背景エフェクトの状態を更新する
            backgroundStarArray.map((v) => {
                v.update();
            });                
            // 爆発エフェクトの状態を更新する
            explosionArray.map((v) => {
                v.update();
            });
            // スコアを更新
            updatePoint(ctx, util, myScore, enemyScore, scoreX, scoreY, CANVAS_WIDTH/2);

            ctx.font = 'bold 70px sans-serif';
            util.drawText('Game Over', 300, 80, 'white', CANVAS_WIDTH);
            ctx.font = 'bold 50px sans-serif';
            util.drawText('press Q', 410, 460, 'red', CANVAS_WIDTH/2);

            if(myScore >= enemyScore){
                ctx.font = 'bold 150px sans-serif';
                util.drawText('WIN', 350, 400, 'Yellow', CANVAS_WIDTH/2);
            }else{
                ctx.font = 'bold 150px sans-serif';
                util.drawText('LOSE', 300, 400, 'Yellow', CANVAS_WIDTH/2);
            }

            // Qでシーンを userpage に変更する
            if(window.isKeyDown.key_q === true && keyUp === true){
                activeScene = 'userpage';
                scene.use(activeScene);
                keyUp = false;
                // BGM再生
                bgm.playloop();
                wsConnection.close();
                matchFlag = 1;
                openCardNum = 0;
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
        picture[9] = './image/d.jpg';
        picture[10] = './image/e.jpg';
        picture[11] = './image/f.jpg';
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
    }

    /**
     * カードをSubmitする関数
     */
    function challengeSubmit(){
        // カードを決定
        if(window.isKeyDown.key_Enter === true){
            // カードの状態が裏ならエンター処理
            if(cardArray[cursorNum].getState() === false){
                // 選択したカードをサーバーに送信
                let submitMessage = {"card": cursorNum};
                console.log("Submit"+JSON.stringify(submitMessage));
                wsConnection.send(JSON.stringify(submitMessage));
            }
        }
    }

    /**
     * WebSocketへの接続処理
     */
    function initializeWSconnection(ip){
        // WebSocketのコネクションを確立
        wsConnection = new WebSocket(ip);
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
        /*wsConnection.onmessage = function(e) {
            message = JSON.parse(e.data);            
            console.log(message);
            console.log(message['card']);
        }*/
    }

    /**
     * 描画処理を行う
     */
    function render(){
        // グローバルなアルファを必ず 1.0 で描画処理を開始する
        ctx.globalAlpha = 1.0;
        // 描画前に画面全体を不透明な明るいグレーで塗りつぶす
        util.drawRect(0, 0, canvas.width, canvas.height, '#111122');
        // 現在までの経過時間を取得する（ミリ秒を秒に変換するため 1000 で除算）
        let nowTime = (Date.now() - startTime) / 1000;

        // シーンを更新する
        scene.update();
    
        // 爆発エフェクトの状態を更新する
        explosionArray.map((v) => {
            v.update();
        });

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
    function getRandomInt(min, max) {
        //min = Math.ceil(min);
        //max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
      }
})();
