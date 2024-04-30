const style = require('./render/style');
const template = require('./render/template');
const Layout = require('./engine').default;

let __env = GameGlobal.wx || GameGlobal.tt || GameGlobal.swan;
let sharedCanvas = __env.getSharedCanvas();
let sharedContext = sharedCanvas.getContext('2d');

// 渲染的数据
export let dataDemo = [
    /*
    {
        avatarUrl: "https://wx.qlogo"
        nickname: "秋刀鱼"
        openid: "xxx"
    },
    */
];


/** 监听主域发的消息 */
let first = {};
let box = {};
__env.onMessage((res) => {
    console.warn("监听主域消息", res);
    if (first.width==null) {
        if (res.event == "viewport" && res.type == 'engine') {
            first = res;

            //! test
            Layout.updateViewPort(first);
            getSelfInfo();
        }
    }
    if (res.type == "Refresh") {
        if (!res.box) { return; }
        box = res.box;

        Layout.updateViewPort({
            x: res.box.x,
            y: res.box.y,
            width: first.width || res.box.width,
            height: first.height || res.box.height,
        });
        getSelfInfo();
    } else if (res.type == "Clear") {
        Layout.updateViewPort({
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        });
    }
});


function getSelfInfo() {
    const WxUserOpenid = "WxUserOpenid"; // 拉取数据用的固定存储key
    wx.getUserCloudStorage({
        keyList: [WxUserOpenid],
        success(res) {
            console.log("获取自己的信息", res);
            //[data 1] 拿自己的openid
            let myselfOpenId = "";
            for (const v of res.KVDataList) {
                if (v.key == "WxUserOpenid") {
                    myselfOpenId = v.value.replace(/"/g, '');
                    break;
                }
            }
            //[data 2]
            getFriendInfo(myselfOpenId);
        }
    });
}

function getFriendInfo(myselfOpenId) {
    // 展示列表, 顺便通过 openid 过滤掉自己
    const WxFriendRoomInviteJoin = "WxFriendRoomInviteJoin"; // 拉取数据用的固定存储key
    wx.getFriendCloudStorage({
        keyList: [WxFriendRoomInviteJoin],
        success(res) {
            // console.log("开放域请求返回:", res); 
            let datas = [];
            dataDemo = [];
            for (const v of res.data) {
                if (!v || v.openid == myselfOpenId) { continue; }
                datas.push({
                    openid: v.openid,
                    nickname: v.nickname,
                    avatarUrl: v.avatarUrl,
                    KVDataList: v.KVDataList[0]
                });
            }
            dataDemo = dataDemo.concat(datas);
            //[data 3] 进行展示
            draw();
        },
        fail(err) {
            console.error("获取好友的开放数据失败", err)
        },
        complete(res) {
            console.log("获取好友数据流程结束", res, "\t最终计算出的数据:", dataDemo);
        }
    });
}


// 进行渲染
function draw() {
    Layout.clear();
    Layout.init(template(), style);
    Layout.layout(sharedContext);
    // 事件绑定
    dataDemo.forEach((v, i) => {
        let temp = Layout.getElementsById("btnContainer" + i)[0];
        if (!temp) { return; }
        temp.on('click', () => {
            console.log(`点击了第 ${i} 个按钮`, v);
            wx.shareMessageToFriend({
                openId: v.openid,
                title: "快来加入我的房间一起玩吧",
                imageUrl: "",
                imageUrlId: "uvShRx1GSyy0OZKil",
            });
        });
    });


}
