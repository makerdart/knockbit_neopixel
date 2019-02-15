//% color=#3062dB weight=96 icon="\uf294" block="KNOCKBIT"
namespace knockbit {

    let terminator = "\n";  // 传输终结符

    let BluetoothConnected: boolean = false; // 蓝牙已连接

    // 连接蓝牙后进行初始化
    function setupApp() {
        //sendSuperMessage("mod" + "microbit");// 设置库类型
        ledOnBoard("llp");  // 板载led 5*5状态
    }

    let CMD_HANDLERS: LinkedKeyHandlerList = null;  // 自定义命令处理器

    class LinkedKeyHandlerList {
        key: string;
        // microbit中的callbak最多支持3个参数
        callback: (container: Message) => void;
        next: LinkedKeyHandlerList
    }

    class VoidHandle {
        callback: () => void;
    }

    // class LinkedIdHandlerList {
    //     id: number;
    //     callback: () => void;
    //     next: LinkedIdHandlerList
    // }

    let messageContainer = new Message;

    /**
    * setMode 
    * @param mode The mode; eg: "microbit"
    */
    //% blockId=knock_setMode
    //% block="设置模式 |模式 %mode"
    export function setMode(mode: string) {
        sendSuperMessage("mod" + mode);
    }

    /**
     * onCmdReceived 
     * @param cmd The cmd; eg: "---"
     * @param callback 
     */
    //% mutate=objectdestructuring
    //% mutateText="message"
    //% mutateDefaults="cmd,args"
    //% blockId=knock_onCmdReceived
    //% block="当收到蓝牙数据时 |命令 %cmd"
    export function onCmdReceived(cmd: string, callback: (message: Message) => void) {
        let newHandler = new LinkedKeyHandlerList()
        newHandler.callback = callback;
        newHandler.key = cmd;
        newHandler.next = CMD_HANDLERS;
        CMD_HANDLERS = newHandler;
    }


    let onBluetoothConnectedHandler: VoidHandle = null;
    //% blockId=knock_onBluetoothConnected
    //% block="当蓝牙连接成功时"
    export function onBluetoothConnected(callback: () => void) {
        onBluetoothConnectedHandler = new VoidHandle()
        onBluetoothConnectedHandler.callback = callback;
    }

    let onBluetoothDisconnectedHandler: VoidHandle = null;
    //% blockId=knock_onBluetoothDisconnectedHandler
    //% block="当蓝牙断开连接时"
    export function onBluetoothDisconnected(callback: () => void) {
        onBluetoothDisconnectedHandler = new VoidHandle();
        onBluetoothDisconnectedHandler.callback = callback;
    }

    function handleMessage(cmd: string, arg: string) {
        switch (cmd) {    // 1开启自动发送，0关闭自动发送
            case "str": // 显示消息
                basic.showString(arg);
                break;
            case "rst": // 重启
                control.reset();
                break;
            case "img": // 显示图案
                basic.showIcon(parseInt(arg));
                ledOnBoard("llp");// 回发板载led信息给敲比特
                break;
            case "lob": // led on-board 板载 5*5led
                ledOnBoard(arg);
                break;
            case "msc":// music // 直接播放频率
                playMusic(arg);
                break;
            // 2018-11-3 新增读取板载传感器
            case "lll": // 光强度
                sendSuperMessage(cmd + input.lightLevel());
                break;
            case "acc": // 加速度计
                sendSuperMessage(cmd + arg + input.acceleration(parseInt(arg)));
                break;
            case "com": // 磁力计（电子罗盘）
                sendSuperMessage(cmd + arg + input.magneticForce(parseInt(arg)));
                break;
            case "tem": // 温度计
                sendSuperMessage(cmd + input.temperature());
                break;
            case "set": // 初始化小程序
                setupApp();
            default:    // 未知的消息
                break;
        }
    }

    let toneStartTime = 0;
    let tonebeat = 125;
    let currentDuration = 4;
    function playMusic(msg: string) {
        let cmd = msg.substr(0, 4);
        let arg = msg.substr(4, msg.length - 4);
        let frequency = arg;
        switch (cmd) {
            case "play":
                if (arg.length > 5) {
                    frequency = arg.substr(0, 4);
                    let duration = parseInt(arg.substr(5, 1));
                    currentDuration = duration > 0 ? duration : currentDuration;
                }
                music.playTone(parseInt(frequency), currentDuration * tonebeat);
                break;
            case "ring":
                //if (tonebeat > 0)   // 等于0的时候放开就停止演奏
                //    basic.pause(tonebeat * currentDuration - (input.runningTime() - toneStartTime) % tonebeat);
                if (arg.length > 5) {
                    frequency = arg.substr(0, 4);
                    let duration = parseInt(arg.substr(5, 1));
                    currentDuration = duration > 0 ? duration : currentDuration;
                }
                toneStartTime = input.runningTime();
                music.ringTone(parseInt(frequency));
                break;
            case "rest":
                if (tonebeat > 0)   // 等于0的时候放开就停止演奏
                    basic.pause(tonebeat * currentDuration - (input.runningTime() - toneStartTime) % tonebeat);
                music.rest(1);
                break;
            case "beat":
                tonebeat = parseInt(arg) >= 0 ? parseInt(arg) : tonebeat;
                break;
            case "dura":
                currentDuration = parseInt(arg) >= 0 ? parseInt(arg) : currentDuration;
                //basic.showNumber(currentDuration);
                break;
        }
    }


    //% blockId=knock_getLedPlots
    //% block="读取led5*5状态，按位组成一个整数返回"
    function getLedPlots(): number {
        let plots = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 5; j++) {
                plots = plots * 2;
                if (led.point(i, j)) {
                    plots += 1;
                }
            }
        }
        return plots;
    }

    function ledOnBoard(msg: string) {
        let cmd = msg.substr(0, 3);
        let arg = msg.substr(3, msg.length - 3);
        switch (cmd) {
            case "llp": // 读取板载led5*5状态
                bluetooth.uartWriteString("llp" + getLedPlots())
                break;
            case "slp":   // 设置板载led一点
                let x = parseInt(arg.substr(0, 1))
                let y = parseInt(arg.substr(1, 1))
                let b = arg.substr(2, 1)
                if (b == "1") {
                    led.plot(x, y); // 点亮
                    //led.plotBrightness(x, y, brightness); 0~255亮度
                }
                else {
                    led.unplot(x, y); // 关闭
                }
                bluetooth.uartWriteString("llp" + getLedPlots())
                break;
        }
    }

    //% blockId=knock_isBluetoothConnected
    //% block="蓝牙连接已连接"
    export function isBluetoothConnected(): boolean {
        return BluetoothConnected;
    }

    /**
     * Handles any incoming message
     */
    function handleIncomingUARTData(auto: boolean) {
        let msg = bluetooth.uartReadUntil(terminator)

        if (msg.length < 3) return;// 非法命令（以后再处理）
        let cmd = msg.substr(0, 3);
        let args = msg.substr(3, msg.length - 3);

        let handlerToExamine = CMD_HANDLERS;

        messageContainer.cmd = cmd;
        messageContainer.args = args;

        //analyzeCmd(cmd, arg);
        //messageContainer = arg;
        if (handlerToExamine == null) { //empty handler list
            //basic.showString("nohandler")
            if (auto) {   //handle message with auto handler
                handleMessage(cmd, args);
            }
        }
        else {
            let handled = false;

            while (handlerToExamine != null) {
                if (handlerToExamine.key == cmd) {
                    handlerToExamine.callback(messageContainer)
                    handled = true;
                }
                //2018-10-18新增
                //系统保留回显命令，用于输出敲比特发送过来的完整命令
                else if (handlerToExamine.key == "---") {
                    handlerToExamine.callback(messageContainer)
                    handled = true;
                }

                handlerToExamine = handlerToExamine.next
            }

            if (!handled && auto) {   //handle message with auto handler
                handleMessage(cmd, args);
            }
        }
    }
    /**
      * init microbit
      * @param id The id; eg: 1
    */
    //% blockId=knock_sendUserMessage
    //% block="发送用户消息 |id（0~9） %id | 消息（最大长度17） %msg"
    export function sendUserMessage(id: number, msg: string) {
        if (BluetoothConnected) {
            bluetooth.uartWriteString("ud" + (id % 10).toString() + msg.substr(0, 17));
        }
    }

    //% blockId=knock_sendSuperMessage
    //% block="发送超级消息 | 消息（最大长度20） %msg"
    export function sendSuperMessage(msg: string) {
        if (BluetoothConnected) {
            bluetooth.uartWriteString(msg.substr(0, 20));
        }
    }
    /**
      * init microbit
      * @param autoHandle auto handle message. eg: true
      */
    //% blockId=knock_init
    //% block="初始化 |自动处理消息 %autoHandle"
    export function init(autoHandle: boolean) {
        bluetooth.startUartService();
        bluetooth.onUartDataReceived(terminator, () => {
            handleIncomingUARTData(autoHandle);
            basic.pause(10);
        })

        bluetooth.onBluetoothConnected(() => {
            BluetoothConnected = true
            basic.showIcon(IconNames.Diamond)
            music.playTone(523, 50) // 调整音调，和前端演示代码一致
            music.playTone(698, 50)
            music.playTone(988, 50)
            basic.pause(10)
            if (onBluetoothConnectedHandler != null) {
                onBluetoothConnectedHandler.callback();
            }
        })
        bluetooth.onBluetoothDisconnected(() => {
            BluetoothConnected = false
            // basic.showIcon(IconNames.SmallDiamond)
            // if (strip != null) {    // 断开蓝牙时关闭led灯
            //     for (let i = 0; i < pixelPort; i++)
            //         strip.setPixelColor(i, 0);
            //     strip.show();
            // }
            music.playTone(988, 50)
            music.playTone(698, 50)
            music.playTone(523, 50)
            basic.pause(10)
            if (onBluetoothConnectedHandler != null) {
                onBluetoothConnectedHandler.callback();
            }
        })

        // 初始化完成，等待蓝牙连接
        basic.showLeds(`
                        . . # # .
                        # . # . #
                        . # # # .
                        # . # . #
                        . . # # .
                        `)
        // if (pixelCount > 0) {
        //     strip = neopixel.create(pixelPort, pixelCount, NeoPixelMode.RGB);
        //     for (let i = 0; i < pixelPort; i++) // 初始化所有灯为关闭
        //         strip.setPixelColor(i, 0);
        //     strip.show();
        // }
    }

}