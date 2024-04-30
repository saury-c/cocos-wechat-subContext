import { _decorator, assetManager, Component, find, Label, Node, Sprite, SpriteFrame, Texture2D, UIOpacity } from 'cc';
import { NWxSubContext, WxSubContext } from './WxSubContext';
const { ccclass, property } = _decorator;

@ccclass('Item')
export class Item extends Component {

    @property(Sprite) headIcon: Sprite = null;
    @property(Label) lab_name: Label = null;
    @property(Node) btn_invite: Node = null;

    data: NWxSubContext.UserGameData;
    parent: WxSubContext;

    protected onLoad(): void {
        this.btn_invite.on(Node.EventType.TOUCH_END, () => {
            const data = this.data;
            NWxSubContext.shareMessageToFriend({ id: data.openid, title: "快来加入", "url": "??" });
        });
    }

    init(data: NWxSubContext.UserGameData, parent: WxSubContext) {
        this.data = data;
        this.parent = parent;

        this.setUserAvatar(data.avatarUrl);
        this.lab_name.string = this.cutStrLength(data.nickname, 6);
        this.getComponent(UIOpacity).opacity = 255;
    }


    /**
     * 截取字符串
     * @param str  需要截断的字符串
     * @param len  保留的长度，汉字占用 2
     * @param suffix  添加的后缀，默认为 ...
     */
    private cutStrLength(str: string, len: number = 12, suffix: string = "..."): string {
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
                    return s.substring(0, s.length - 1) + suffix;   // 不使用 s.length - 2, 是因为加多3个点长度我考虑进去了
                }
            }
        }
        return s;
    }

    //更新头像图像
    private setUserAvatar(url: string) {
        if (!url) { return; }
        assetManager.loadRemote(url, { ext: "png" }, (err, texture: Texture2D) => {
            if (this.data.avatarUrl != url) { return; }
            if (!err && texture) {
                let spf = new SpriteFrame();
                spf.texture = texture;
                this.headIcon.spriteFrame = spf;
            }
        });
    }


}


