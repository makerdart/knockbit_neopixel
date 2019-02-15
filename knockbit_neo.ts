
namespace knockbit {
    let pixelCount = 0;

    //% blockId=knock_init_neopixel
    //% block="初始化LED |LED个数 %ledCount"
    export function init_neopixel(ledCount: number) {
        pixelCount = ledCount;
        sendSuperMessage("lnp" + pixelCount);  // 设置lnp（neopixels数量）
    }

    let splitString = (splitOnChar: string, input: string) => {
        let result: string[] = []
        let count: number = 0
        let startIndex = 0
        for (let index = 0; index < input.length; index++) {
            if (input.charAt(index) == splitOnChar) {
                result[count] = input.substr(startIndex, index - startIndex)
                startIndex = index + 1
                count = count + 1
            }
        }
        if (startIndex != input.length)
            result[count] = input.substr(startIndex, input.length - startIndex)
        return result;
    }

    //% blockId=knock_neopixel_showLed
    //% block="显示LED" | Strip %strip| 参数 %args"
    export function showLed(strip: neopixel.Strip, args: string) {
        //basic.showString(arg);
        if (strip == null || pixelCount == 0)
            return;

        if (args[0] == '-') { // 返回pixel灯数量
            bluetooth.uartWriteString("lnp" + pixelCount)
            return;
        }

        // 前6位rgb颜色，后面的是LED位置
        let ledstr = args.substr(6, args.length - 6);
        let rgb = parseInt("0x" + args.substr(0, 6));
        let leds = splitString("|", ledstr);
        //basic.showNumber(leds.length);
        for (let i = 0; i < leds.length; i++) {
            strip.setPixelColor(parseInt(leds[i]), rgb);
        }
        strip.show();
    }

    //% blockId=knock_neopixel_clearLed
    //% block="关闭LED" | Strip %strip"
    export function clearLed(strip: neopixel.Strip) {
        if (strip != null) {    // 断开蓝牙时关闭led灯
            for (let i = 0; i < pixelCount; i++)
                strip.setPixelColor(i, 0);
            strip.show();
        }
    }
}