import { _decorator, Component, Node, ScrollView } from 'cc';
import { UIScrollView } from './UIScrollView';
import { Item } from './Item';
const { ccclass, property } = _decorator;

declare const wx;
const WxFriendRoomInviteJoin = "WxFriendRoomInviteJoin";

@ccclass('WxSubContext')
export class WxSubContext extends Component {

    list: UIScrollView;
    node_tips_empty: Node;

    onLoad() {
        this.node_tips_empty = this.node.getChildByName("node_tips_empty");
        this.list = this.node.getComponent(UIScrollView);
        this.list.init({ cbUpdate: this.updateItem.bind(this) });
        wx.onMessage((message: any) => {
            console.log("监听到主域发送的消息", message)
            if (message?.type == "Fresh") {
                this.showList();
            }
        });

        this.showList();
    }

    private updateItem(item: Node, data: NWxSubContext.UserGameData): void {
        const index = item["itemId"];
        item.getComponent(Item).init(data, this);
    }

    private async showList() {
        const userData = await NWxSubContext.getFriendOpenData(WxFriendRoomInviteJoin);
        console.warn("子域拉取到的数据", userData)
        if (!userData) { return; }
        this.list.setScrollListData(userData);
        this.node_tips_empty.active = userData.length == 0;
    }

}


export namespace NWxSubContext {

    class KVData {
        key: string;
        value: string;
        constructor(key: string, val: any) {
            this.key = key;
            this.value = JSON.stringify(val);
        }
    }

    /**
     * 存储用户数据的数据结构
     *  key: UserGameData[]. 数组内的 KVDataList 为自定义数据
     *  例如 好友key: UserGameData[].   排行榜key: UserGameData[]
     * 
     */
    export interface UserGameData {
        avatarUrl: string;
        nickname: string;
        openid: string;
        KVDataList: KVData[];
    }

    /** 可能会玩这个游戏的好友 struct */
    export interface FriendsData {
        avatarUrl: string;
        nickname: string;
        openid: string;
    }


    /** [开放域限定]获取好友的开放数据, 需要自行转换数据(JSON.parse) */
    export function getFriendOpenData(key: string): Promise<UserGameData[]> {
        return new Promise((resolve, reject) => {
            wx.getFriendCloudStorage({
                keyList: [key],
                success(res: { data: UserGameData[] }) {
                    console.warn("开放域请求返回:", res);
                    let datas: UserGameData[] = [];
                    for (const v of res?.data ?? []) {
                        if (!v) { continue; }
                        datas.push(v);
                    }
                    resolve(datas);
                },
                fail() {
                    console.log("获取好友的开放数据失败")
                    resolve([]);
                }
            });

        });
    }


    /** 获取可能对游戏感兴趣的未注册的好友名单。每次调用最多可获得 5 个好友，此接口只能在开放数据域中使用 */
    export function getPotentialFriendList(): Promise<FriendsData[]> {
        return new Promise((resolve, reject) => {
            wx.getPotentialFriendList({
                success(res: { list: FriendsData[] }) {
                    let list = res.list || [];
                    let datas: FriendsData[] = [];
                    for (const d of list) { datas.push(d); }
                    resolve(datas);
                },
                fail() {
                    console.log("获取好友的开放数据失败")
                    resolve([]);
                }
            });

        });
    }

    /*
     * 给指定的好友分享游戏信息，该接口只可在开放数据域下使用。接收者打开之后，
     * 可以用 wx.modifyFriendInteractiveStorage 传入参数 quiet=true 发起一次无需弹框确认的好友互动 
     */
    export function shareMessageToFriend({ id, title, url }: { id: string, title: string, url: string }) {
        wx.shareMessageToFriend({
            openId: id,
            title: title,
            imageUrl: url,
            imageUrlId: "uvShRx1GSyy0OZKil",
        })
    }


}

