knockbit.onCmdReceived("alm", function ({ cmd, args }) {
    switch (args) {
        case "0":
            break;
        default:
            music.playTone(523, 50)
            music.playTone(988, 50)
            music.playTone(523, 50)
            music.playTone(988, 50)
            music.playTone(523, 50)
            music.playTone(988, 50)
            break;
    }
})
knockbit.onCmdReceived("mp3", function ({ cmd, args }) {
	
})
// autohandle message
knockbit.init(true)
