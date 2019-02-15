// tests go here; this will not be compiled when this package is used as a library
knockbit.onCmdReceived("lnp", function ({ cmd, args }) {
    knockbit.showLed(strip, args)   // lnp消息是设置led灯颜色和开关，此命令需要手动输入
})
knockbit.onCmdReceived("set", function ({ cmd, args }) {
    knockbit.setMode("neo") // 设置模式，带led灯
    knockbit.init_neopixel(4)   // 设置led灯数量4
})
let strip: neopixel.Strip = null
// 初始化knockbit，参数为true开启自动处理消息，否则需用参考手册使用onCmdReceived处理所有消息
knockbit.init(true)
// 初始化neopixel led
strip = neopixel.create(DigitalPin.P16, 4, NeoPixelMode.RGB)
