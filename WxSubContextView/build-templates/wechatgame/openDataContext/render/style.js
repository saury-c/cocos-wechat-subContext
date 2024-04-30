// 不建议改固定值, 因为我不会写css, 目前都是写死的, 如果改成相对位置, 可能会导致ui显示位置不是很准确

module.exports = {
    bgColor:{
        backgroundColor: "#DBF3FF",
        width: '100%',
        height: '100%',
    },
 
    // 列表
    list: {
        width: '100%',
        height: '100%',
    },
    listItem: {
        width: '100%',
        height: '20%',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    bottomLine: {
        position: 'absolute',
        bottom: '5',
        left: '10',
        width: '93%',
        height: '2',
        backgroundColor: '#B7D9F3'
    },

    // 玩家信息
    avatarContainer: {
        width: 62,
        height: 62,
        marginLeft: '12'
    },
    avatarBg: {
        width: 62,
        height: 62,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 6,
    },
    nickname: {
        width: 160,
        height: 22,
        fontSize: 25,
        lineHeight: 25,
        fontWeight: 'bold',
        color: '#48519C',
        textAlign: 'left',
        marginLeft: '4',
    },

    // 按钮
    btnContainer: {
        width: 100,
        height: 38,
        // backgroundColor: "#3Ff0FF",
        marginLeft: '16',
    },
    btnSp: {
        width: 93,
        height: 37.353,
    },
    btnText: {
        width: 43,
        height: 22,
        marginLeft: 26,
        marginTop: 9,
    },



    // 没有数据展示用
    noData: {
        width: '100%',
        height: '100%',
        marginTop: 200,
    },
    noDataTxt: {
        width: "100%",
        fontSize: 25,
        lineHeight: 25,
        fontWeight: 'bold',
        color: '#48519C',
        textAlign: 'center',
    },
    noDataTxt2: {
        width: "100%",
        fontSize: 25,
        lineHeight: 25,
        fontWeight: 'bold',
        color: '#48519C',
        textAlign: 'center',
        marginTop: 40,
    },


};