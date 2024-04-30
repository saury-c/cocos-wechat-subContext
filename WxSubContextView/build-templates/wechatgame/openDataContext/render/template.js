const temp = require("./../index");

// 上述模板经过模板引擎编译成版本函数，可通过 olado.github.io/doT/index.html 在线获得
function anonymous() {
    let arr = temp.dataDemo;
    let out =
        `<view class="noData">
            <text class="noDataTxt" value="暂无数据"> </text>
            <text class="noDataTxt2" value="快叫上好友一起来玩吧"> </text>
        </view>`;
    if (arr.length > 0) {
        out = `<view class="bgColor" id="container"> <scrollview class="list" scrollY="true">
            ${arr.map((item, index) => {
            return `<view class="listItem">
                        <view class="avatarContainer"> 
                            <image class="avatarBg" src="openDataContext/render/spf/avatar_bg.png">
                                <image class="avatar" src="${item.avatarUrl}"></image>
                            </image>
                        </view>
                        <text class="nickname" value="${cutStrLength(item.nickname, 10, "...")}"></text>
                        <view class="btnContainer" id="btnContainer${index}">
                            <image class="btnSp" src="openDataContext/render/spf/btn.png">
                                <image class="btnText" src="openDataContext/render/spf/txt_invite.png"></image>
                            </image>
                        </view>
                        <view class="bottomLine"></view>
                    </view>`
        })}
        </scrollview></view>`;
    }
    return out;

}


/**
 * 截取字符串
 * @param str  需要截断的字符串
 * @param len  保留的长度，汉字占用 2
 * @param suffix  添加的后缀，默认为 ...
 */
function cutStrLength(str, len = 12, suffix) {
    if (str == null || str?.length == null) {
        return "";
    }
    //length属性读出来的汉字长度为1
    if (str.length * 2 <= len) {
        return str;
    }
    var strlen = 0;
    var s = "";
    for (var i = 0; i < str.length; i++) {
        s = s + str.charAt(i);
        if (str.charCodeAt(i) > 128) {
            strlen = strlen + 2;
            if (strlen >= len) {
                return s.substring(0, s.length - 1) + suffix;
            }
        } else {
            strlen = strlen + 1;
            if (strlen >= len) {
                return s.substring(0, s.length - 1) + suffix; // 不使用 s.length - 2, 是因为加多3个点长度我考虑进去了
            }
        }
    }
    return s;
}

module.exports = anonymous;