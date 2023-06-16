
/**
 * 座標を管理するためのクラス
 */
class Position {
    /**
     * @constructor
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     */
    constructor(x, y){
        /**
         * X 座標
         * @type {number}
         */
        this.x = x;
        /**
         * Y 座標
         * @type {number}
         */
        this.y = y;
    }

    /**
     * 値を設定する
     * @param {number} [x] - 設定する X 座標
     * @param {number} [y] - 設定する Y 座標
     */
    set(x, y){
        if(x != null){this.x = x;}
        if(y != null){this.y = y;}
    }
    getX(){
        return(this.x);
    }
    getY(){
        return(this.y);
    }
}

/**
 * キャラクター管理のための基幹クラス
 */
class Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {number} life - キャラクターのライフ（生存フラグを兼ねる）
     * @param {string} imagePath - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, life, imagePath){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = ctx;
        /**
         * @type {Position}
         */
        this.position = new Position(x, y);
        /**
         * @type {Position}
         */
        this.vector = new Position(0.0, -1.0);
        /**
         * @type {number}
         */
        this.angle = 270 * Math.PI / 180;
        /**
         * @type {number}
         */
        this.width = w;
        /**
         * @type {number}
         */
        this.height = h;
        /**
         * @type {number}
         */
        this.life = life;
        /**
         * @type {boolean}
         */
        this.ready = false;
        /**
         * @type {Image}
         */
        this.image = new Image();
        this.image.addEventListener('load', () => {
            // 画像のロードが完了したら準備完了フラグを立てる
            this.ready = true;
        }, false);
        this.image.src = imagePath;
    }

    /**
     * 進行方向を設定する
     * @param {number} x - X 方向の移動量
     * @param {number} y - Y 方向の移動量
     */
    setVector(x, y){
        // 自身の vector プロパティに設定する
        this.vector.set(x, y);
    }

    /**
     * 進行方向を角度を元に設定する
     * @param {number} angle - 回転量（ラジアン）
     */
    setVectorFromAngle(angle){
        // 自身の回転量を設定する
        this.angle = angle;
        // ラジアンからサインとコサインを求める
        let sin = Math.sin(angle);
        let cos = Math.cos(angle);
        // 自身の vector プロパティに設定する
        this.vector.set(cos, sin);
    }

    /**
     * 画像のPathを再設定する
     * @param {number} angle - 回転量（ラジアン）
     */
    setImagePath(newImgagePath){
        this.image.src = newImgagePath;
    } 

    setSize(newWidth, newHeight){
        this.width = newWidth;
        this.height = newHeight;
    }

    /**
     * キャラクターを描画する
     */
    draw(){
        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            this.position.x - offsetX,
            this.position.y - offsetY,
            this.width,
            this.height
        );
    }

    /**
     * 自身の回転量を元に座標系を回転させる
     */
    rotationDraw(){
        // 座標系を回転する前の状態を保存する
        this.ctx.save();
        // 自身の位置が座標系の中心と重なるように平行移動する
        this.ctx.translate(this.position.x, this.position.y);
        // 座標系を回転させる（270 度の位置を基準にするため Math.PI * 1.5 を引いている）
        this.ctx.rotate(this.angle - Math.PI * 1.5);

        // キャラクターの幅を考慮してオフセットする量
        let offsetX = this.width / 2;
        let offsetY = this.height / 2;
        // キャラクターの幅やオフセットする量を加味して描画する
        this.ctx.drawImage(
            this.image,
            -offsetX, // 先に translate で平行移動しているのでオフセットのみ行う
            -offsetY, // 先に translate で平行移動しているのでオフセットのみ行う
            this.width,
            this.height
        );

        // 座標系を回転する前の状態に戻す
        this.ctx.restore();
    }
}

/**
 * カードのクラス
 */
class Card extends Character {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} x - X 座標
     * @param {number} y - Y 座標
     * @param {number} w - 幅
     * @param {number} h - 高さ
     * @param {Image} image - キャラクター用の画像のパス
     */
    constructor(ctx, x, y, w, h, imagePath){
        // 継承元の初期化
        super(ctx, x, y, w, h, 0, imagePath);

        // カーソルが自分のカードを選択されているかどうか
        this.isCursor = false;

        // カードが開かれたかどうか
        this.state = false; // close=false

        // オリジナルの幅と高さを保存
        this.originalWidth = w;
        this.originalHeight = h;
    }

    /**
     * カーソルの状態をセットする
     */
    setCursor(cursorState){
        this.isCursor = cursorState;
    }

    /**
     * カードの状態をセットする
     */
    setState(cardState){
        this.state = cardState;
    }
    /**
     * カードの状態をゲットする
     */
    getState(){
        return(this.state);
    }
    

    /**
     * キャラクターの状態を更新し描画を行う
     */
    update(){
        // 現時点のタイムスタンプを取得する
        let justTime = Date.now();

        // カードが選択状態にあるかチェック
        if(this.isCursor === true){
            // 選択状態にあるならカードサイズを変更
            this.setSize(this.originalWidth*1.11, this.originalHeight*1.11);
        }else{
            this.setSize(this.originalWidth, this.originalHeight);
        }

        // 自機キャラクターを描画する
        this.draw();

        // 念の為グローバルなアルファの状態を元に戻す
        this.ctx.globalAlpha = 1.0;
    }
}

/**
 * 爆発エフェクトクラス
 */
class Explosion {
    /**
     * @constructor
     * @param {CanvasRenderingContext2D} ctx - 描画などに利用する 2D コンテキスト
     * @param {number} radius - 爆発の広がりの半径
     * @param {number} count - 爆発の火花の数
     * @param {number} size - 爆発の火花の大きさ（幅・高さ）
     * @param {number} timeRange - 爆発が消えるまでの時間（秒単位）
     * @param {string} [color='#ff1166'] - 爆発の色
     */
    constructor(ctx, radius, count, size, timeRange, color = '#ff1166'){
        /**
         * @type {CanvasRenderingContext2D}
         */
        this.ctx = ctx;
        /**
         * 爆発の生存状態を表すフラグ
         * @type {boolean}
         */
        this.life = false;
        /**
         * 爆発を fill する際の色
         * @type {string}
         */
        this.color = color;
        /**
         * 自身の座標
         * @type {Position}
         */
        this.position = null;
        /**
         * 爆発の広がりの半径
         * @type {number}
         */
        this.radius = radius;
        /**
         * 爆発の火花の数
         * @type {number}
         */
        this.count = count;
        /**
         * 爆発が始まった瞬間のタイムスタンプ
         * @type {number}
         */
        this.startTime = 0;
        /**
         * 爆発が消えるまでの時間
         * @type {number}
         */
        this.timeRange = timeRange;
        /**
         * 火花のひとつあたりの最大の大きさ（幅・高さ）
         * @type {number}
         */
        this.fireBaseSize = size;
        /**
         * 火花のひとつあたりの大きさを格納する
         * @type {Array<Position>}
         */
        this.fireSize = [];
        /**
         * 火花の位置を格納する
         * @type {Array<Position>}
         */
        this.firePosition = [];
        /**
         * 火花の進行方向を格納する
         * @type {Array<Position>}
         */
        this.fireVector = [];
        /**
         * サウンド再生のための Sound クラスのインスタンス
         * @type {Sound}
         */
        this.sound = null;
    }

    /**
     * 爆発エフェクトを設定する
     * @param {number} x - 爆発を発生させる X 座標
     * @param {number} y - 爆発を発生させる Y 座標
     */
    set(x, y){
        // 火花の個数分ループして生成する
        for(let i = 0; i < this.count; ++i){
            // 引数を元に位置を決める
            this.firePosition[i] = new Position(x, y);
            // ランダムに火花が進む方向（となるラジアン）を決める
            let vr = Math.random() * Math.PI * 2.0;
            // ラジアンを元にサインとコサインを生成し進行方向に設定する
            let s = Math.sin(vr);
            let c = Math.cos(vr);
            // 進行方向ベクトルの長さをランダムに短くし移動量をランダム化する
            let mr = Math.random();
            this.fireVector[i] = new Position(c * mr, s * mr);
            // 火花の大きさをランダム化する
            this.fireSize[i] = (Math.random() * 0.5 + 0.5) * this.fireBaseSize;
        }
        // 爆発の生存状態を設定
        this.life = true;
        // 爆発が始まる瞬間のタイムスタンプを取得する
        this.startTime = Date.now();

        // サウンド再生の準備ができていたら、再生する
        if(this.sound != null){
            this.sound.play();
        }
    }

    /**
     * Sound クラスのインスタンスを受け取り自身のプロパティとして保持する
     */
    setSound(sound){
        this.sound = sound;
    }

    /**
     * 爆発エフェクトを更新する
     */
    update(){
        // 生存状態を確認する
        if(this.life !== true){return;}
        // 爆発エフェクト用の色を設定する
        this.ctx.fillStyle = this.color;
        this.ctx.globalAlpha = 0.5;
        // 爆発が発生してからの経過時間を求める
        let time = (Date.now() - this.startTime) / 1000;
        // 爆発終了までの時間で正規化して進捗度合いを算出する
        let ease = simpleEaseIn(1.0 - Math.min(time / this.timeRange, 1.0));
        let progress = 1.0 - ease;

        // 進捗度合いに応じた位置に火花を描画する
        for(let i = 0; i < this.firePosition.length; ++i){
            // 火花が広がる距離
            let d = this.radius * progress;
            // 広がる距離分だけ移動した位置
            let x = this.firePosition[i].x + this.fireVector[i].x * d;
            let y = this.firePosition[i].y + this.fireVector[i].y * d;
            // 進捗を描かれる大きさにも反映させる
            let s = 1.0 - progress;
            // 矩形を描画する
            this.ctx.fillRect(
                x - (this.fireSize[i] * s) / 2,
                y - (this.fireSize[i] * s) / 2,
                this.fireSize[i] * s,
                this.fireSize[i] * s
            );
        }

        // 進捗が 100% 相当まで進んでいたら非生存の状態にする
        if(progress >= 1.0){
            this.life = false;
        }
    }
}

function simpleEaseIn(t){
    return t * t * t * t;
}

// 得点の描画
function updatePoint(ctx, util, mypoint, enemypoint, x, y, width){
    ctx.font = 'bold 40px sans-serif';
    util.drawText('Your Score:  ' + mypoint, x, y, 'black', width);
    util.drawText('Enemy Score:  ' + enemypoint, x, y+160, 'black', width);
}