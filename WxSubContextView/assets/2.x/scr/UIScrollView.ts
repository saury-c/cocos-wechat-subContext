
import { _decorator, Component, Node as ccNode, ScrollView, UITransform, instantiate, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 脚本支持传入大量数据，实际上只用一定量的item循环显示
 * 使用实例
 * 将脚本拖动至任意node（建议拖动到使用的ScrollView）
 * 挂载上scrollView和itemTemplate
 * import
    import { UIScrollView } from './component/UIScrollView';

 * code
    this.scrollView_Src = ScrollView.getComponent(UIScrollView); 
    var data = { cbUpdate: this.updateItem.bind(this) };
    this.scrollView_Src.init(data);
    var listData = [] //传入服务端数据
    this.scrollView_Src.setScrollListData(listData);

* updateItem
    updateItem(item : ccNode,data : any) : void {}
*/
interface SVNeedData {
    cbUpdate: (item: ccNode, data: any) => void; // Item的自定义函数
}

@ccclass('UIScrollView')
export class UIScrollView extends Component {

    @property spacing = 0; //item之间的间隔
    @property bufferZone = 0; //每个item位置超过该数值变化,不填写则为scrollView高度/宽度的一半+itemTemplate高度/宽度(不可少于一半+item高宽，totalCount越大可设置越大)
    @property totalCount = 0; //可展示item的总数,不填写则自动计算scrollView可容纳的item数目 + 4
    @property topSpacing = 0; //初始化时第一个item离顶点的距离,需小于item高度的1/2
    @property({ type: ScrollView, displayName: "scrollView" }) scrollView: ScrollView;
    @property({ type: ccNode, displayName: "item" }) itemTemplate: ccNode;

    cbUpdate = null; // item的设置函数
    items = []; // 保存全部item的数组
    updateTimer = 0;
    updateInterval = 0.2; //更新检测的频率
    lastContentPosY = 0; //记录上下滑动的偏差量
    lastContentPosX = 0; //记录左右滑动的偏差量
    isInitSuccess = false; //是否初始化该组件开始使用
    listData = []; //传入的数值数组
    itemNums = 0;
    isVertical = true;  //true : 组件为上下滑动  false : 组件为左右滑动

    //外部调用init，即初始化组件，开始使用
    public init(param: SVNeedData): void {
        if (!this.scrollView) {
            console.warn("请挂载scrollView组件到脚本上");
            return;
        }
        if (!this.itemTemplate) {
            console.warn("请挂载itemTemplate组件到脚本上");
            return;
        }
        if ((this.scrollView.vertical && this.scrollView.horizontal) || (!this.scrollView.vertical && !this.scrollView.horizontal)) {
            console.warn("请只设置垂直方向或者水平方向");
            return;
        } else {
            this.isVertical = this.scrollView.vertical
        }

        let scrollViewSize = this.scrollView.getComponent(UITransform)
        let scrollViewHeightWidth = this.isVertical ? scrollViewSize.height : scrollViewSize.width

        let itemSize = this.itemTemplate.getComponent(UITransform)
        let itemHeightWidth = this.isVertical ? itemSize.height : itemSize.width
        if (itemHeightWidth == 0) {
            console.warn("itemHeightWidth can't set zero");
            return;
        }

        if (this.bufferZone < scrollViewHeightWidth / 2 + itemHeightWidth) {
            this.bufferZone = scrollViewHeightWidth / 2 + itemHeightWidth
        }

        var canSeeNum = Math.ceil(scrollViewHeightWidth / itemHeightWidth)
        if (this.totalCount < canSeeNum + 4) {
            this.totalCount = canSeeNum + 4
        }

        if (param.cbUpdate) {
            this.cbUpdate = param.cbUpdate; //itemId 需要在update重新复制， 因为因负数或者index > lenth的情况
        }

        this.items = [];
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.itemTemplate.active = false;

        this.lastContentPosY = 0;
        this.lastContentPosX = 0;

        if (this.topSpacing > itemHeightWidth / 2) {
            this.topSpacing = itemHeightWidth / 2
        }
        this.initialize();
        this.isInitSuccess = true;
    }

    private initialize(): void {
        if (this.isVertical) {
            for (let i = 0; i < this.totalCount; ++i) {
                let item = instantiate(this.itemTemplate);
                this.scrollView.content.addChild(item);
                var y = -item.getComponent(UITransform).height * (0.5 + i) - this.spacing * (i + 1) - this.topSpacing;
                item.setPosition(0, y)
                item["resetXY"] = y;
                this.items.push(item);
            }
        } else {
            for (let i = 0; i < this.totalCount; ++i) {
                let item = instantiate(this.itemTemplate);
                this.scrollView.content.addChild(item);
                var x = item.getComponent(UITransform).width * (0.5 + i) + this.spacing * (i + 1) + this.topSpacing;
                item.setPosition(x, 0)
                item["resetXY"] = x;
                this.items.push(item);
            }
        }

    }

    //执行cbUpdate设置item样式
    private setItem(item: ccNode, index: number): void {
        var list = this.listData;
        if (index >= list.length || index < 0) {
            return;
        }
        item["itemID"] = index;
        var data = list[index];
        item["info"] = data;
        if (this.cbUpdate) {
            this.cbUpdate(item, data)
        }
    }

    //获取Item在content的具体位置
    private getPositionInView(item: ccNode): Vec3 {
        let worldPos = item.parent.getComponent(UITransform).convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    //listData ：传入数据的数量 , isneedNosort : true--不需要更改item位置，默认为false
    public setScrollListData(listData: any[], isneedNosort?: boolean): void {// 是否重置itemID
        this.listData = listData;
        this.setScrollHeight(listData.length, isneedNosort)
    }

    //itemNums ：传入数据的数量 , isneedNosort : true--不需要scrollToTop，默认为false
    public setScrollHeight(itemNums: number, isneedNosort?: boolean): void {// 是否重置itemID
        if (!this.scrollView) {
            return;
        }
        if (this.isVertical) {
            this.scrollView.content.getComponent(UITransform).height = itemNums * (this.itemTemplate.getComponent(UITransform).height + this.spacing) + this.spacing + this.topSpacing; // get total content height
        } else {
            this.scrollView.content.getComponent(UITransform).width = itemNums * (this.itemTemplate.getComponent(UITransform).width + this.spacing) + this.spacing + this.topSpacing; // get total content Width
        }

        //不需要更改item位置
        if (isneedNosort) {
            if (this.itemNums != undefined && itemNums == this.itemNums) {
                for (var i = 0; i < this.items.length; i++) {
                    let item: ccNode = this.items[i];
                    if (i < itemNums) {
                        this.setItem(item, item["itemID"]);
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                }
                return
            } else {
                this.itemNums = itemNums > 0 ? itemNums : undefined
            }
        }

        //每次更新数据将多余的item隐藏
        for (var i = 0; i < this.items.length; i++) {
            let item: ccNode = this.items[i];
            item.active = false;
        }
        for (var i = 0; i < this.items.length && i < itemNums; i++) {
            var item: ccNode = this.items[i];
            if (item["itemID"] >= 0) {
                let resetXY = item["resetXY"];
                let x = this.isVertical ? item.position.x : resetXY
                let y = this.isVertical ? resetXY : item.position.y
                item.setPosition(x, y)
            }

            item["itemID"] = i;
            this.setItem(item, item["itemID"]);
            item.active = true;
        }

        if (!isneedNosort) {
            if (this.isVertical) {
                this.scrollView.scrollToTop(0.1);
            } else {
                this.scrollView.scrollToLeft(0.1);
            }
        }

    }

    update(dt) {
        //没初始化返回
        if (!this.isInitSuccess) return;
        this.updateTimer += dt;
        //每次更新间隔
        if (this.updateTimer < this.updateInterval) return;
        this.updateTimer = 0;
        if (this.isVertical) {
            this.updateVertical();
        } else {
            this.updateHorizontal();
        }
    }

    //更新上下滑动需要更改的Item
    updateVertical() {
        let items = this.items;
        let buffer = this.bufferZone;
        let isDown = this.scrollView.content.position.y < this.lastContentPosY; // 记录上下滑动方向
        let offset = (this.itemTemplate.getComponent(UITransform).height + this.spacing) * items.length;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isDown) {
                if (viewPos.y < -buffer && items[i].position.y + offset < 0) {
                    items[i].setPosition(items[i].position.x, items[i].position.y + offset)
                    let itemId = items[i]["itemID"] - items.length;
                    if (itemId >= this.listData.length || itemId < 0) {
                        break;
                    }
                    items[i]["itemID"] = itemId;
                    this.setItem(items[i], itemId);
                }
            } else {
                if (viewPos.y > buffer && items[i].position.y - offset > -this.scrollView.content.getComponent(UITransform).height) {
                    items[i].setPosition(items[i].position.x, items[i].position.y - offset)
                    let itemId = items[i]["itemID"] + items.length;
                    if (itemId >= this.listData.length || itemId < 0) {
                        break;
                    }
                    items[i]["itemID"] = itemId;
                    this.setItem(items[i], itemId);
                }
            }
        }
        this.lastContentPosY = this.scrollView.content.position.y;
    }

    //更新左右滑动需要更改的Item
    updateHorizontal() {
        let items = this.items;
        let buffer = this.bufferZone;
        let isRight = this.scrollView.content.position.x > this.lastContentPosX; // 记录左右滑动方向
        let offset = (this.itemTemplate.getComponent(UITransform).width + this.spacing) * items.length;
        for (let i = 0; i < items.length; ++i) {
            let viewPos = this.getPositionInView(items[i]);
            if (isRight) {
                if (viewPos.x > buffer && items[i].position.x - offset > 0) {
                    items[i].setPosition(items[i].position.x - offset, items[i].position.y)
                    let itemId = items[i]["itemID"] - items.length;
                    if (itemId >= this.listData.length || itemId < 0) {
                        break;
                    }
                    items[i]["itemID"] = itemId;
                    this.setItem(items[i], itemId);
                }
            } else {
                if (viewPos.x < -buffer && items[i].position.x + offset < this.scrollView.content.getComponent(UITransform).width) {
                    items[i].setPosition(items[i].position.x + offset, items[i].position.y)
                    let itemId = items[i]["itemID"] + items.length;
                    if (itemId >= this.listData.length || itemId < 0) {
                        break;
                    }
                    items[i]["itemID"] = itemId;
                    this.setItem(items[i], itemId);
                }
            }
        }
        this.lastContentPosX = this.scrollView.content.position.x;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
