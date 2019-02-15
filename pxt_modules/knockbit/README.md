# knockbit

Control micro:bit by wechat app. The Tiny version.

## Feature

- Designed for wechat(Mini Program) knockbit over microbit
- Show Image with yourself.
- Play music by key.
- Transmit messages between microbit and knockbit.
- Do more thing with the message block.enjoy!

## Log

2018-11-28 此版本是最小版本的蓝牙控制，(tiny)
1、只保留了microbit基本功能，neopixel和robotbit等都作为附加包加载
2、增加了蓝牙连接时，蓝牙断开时的额外命令，可以用来初始化/清理状态
3、增加了读取传感器的功能，同样在小程序中增加了对应模块
4、修复了按键音乐播放的一个小bug

// 2018-10-07 makecode的substr默认长度10？是否是bug呢
// 2018-11-04 makecode.microbit.org v1.0 似乎对自动解析回调类还是有bug

## License

MIT

## Supported targets

* for PXT/microbit
(The metadata above is needed for package search.)

