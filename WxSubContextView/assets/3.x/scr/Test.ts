import { _decorator, Canvas, Component, Label, Node, NodeEventType, screen, Size, Tween, tween, UITransform, Vec3, view } from 'cc';
const { ccclass, property } = _decorator;

declare const wx;

@ccclass('NewComponent')
export class NewComponent extends Component {

    @property(Node) modeNode: Node;
    @property(Node) subNode: Node;

    @property(Node) atom: Node;
    @property(Node) atom2: Node;
    @property(Node) atom3: Node;
    @property(Label) label: Label;

    start() {
        // 获取的是你在编辑器中设计的分辨率，也就是canvas 组件下设置的设计分辨率。
        const getDesignResolutionSize = view.getDesignResolutionSize()
        // 获取各种手机、pad上的屏幕分辨率，也就是硬件分辨率。
        const windowSize = screen.windowSize;
        // 获取的是 visibleSize 的基础上乘以各种适配策略下的缩放比例后的分辨率。
        const getVisibleSizeInPixel = view.getVisibleSizeInPixel()
        // 返回视图窗口可见区域尺寸
        const getVisibleSize = view.getVisibleSize()
        console.warn({ getDesignResolutionSize, windowSize, getVisibleSizeInPixel, getVisibleSize })


        let flag = true;
        this.atom.on(NodeEventType.TOUCH_END, () => {
            this.showAni(flag);
            flag = !flag;
        });
        this.atom2.on(NodeEventType.TOUCH_END, () => {
            // this.subNode.setPosition(new Vec3(this.subNode.position.x, this.subNode.position.y, Math.random()))

            const box = this.subNode.getComponent(UITransform).getBoundingBoxToWorld();
            //
            const scaleX = view.getScaleX();
            const scaleY = view.getScaleY();
            const devicePixelRatio = screen.devicePixelRatio;
            // const devicePixelRatio = view.getDevicePixelRatio();
            // 设计尺寸
            const designSize = view.getDesignResolutionSize();
            // canvas 画布的尺寸
            const vireportRect = view.getViewportRect();
            // Cocos 实际的场景在 Canvas 画布中的偏移，比如按照 fixWidth 的适配规则而屏幕有比较长的话，最终渲染出来屏幕上下是有黑边的，这里计算的就是黑边的大小
            const offsetY = (vireportRect.height - (designSize.height * scaleY)) / 2;
            const offsetX = (vireportRect.width - (designSize.width * scaleX)) / 2;
            if (wx != null) {
                wx.getOpenDataContext().postMessage({
                    type: "Refresh", // Refresh展示 Clear清除掉避免点击触发
                    box: {
                        x: ((box.x * scaleX) + offsetX) / devicePixelRatio,     // 这个准
                        y: (box.y * scaleY + offsetY) / devicePixelRatio,       // 这个准
                        width: box.width * scaleX / devicePixelRatio,
                        height: box.height * scaleY / devicePixelRatio,
                    }
                });
            }
        });
        this.atom3.on(NodeEventType.TOUCH_END, () => {
            wx.getOpenDataContext().postMessage({
                type: "Clear", // Refresh展示 Clear清除掉避免点击触发
            });
        });

    }

    //出现/关闭动画
    showAni(isShow: boolean) {
        Tween.stopAllByTarget(this.modeNode);
        let pos = this.modeNode.getPosition()
        if (isShow) {
            this.modeNode.setPosition(new Vec3(0, pos.y, 1));
            let endPos = new Vec3(0 - 300, pos.y, 1);
            tween(this.modeNode).to(0.3, { position: endPos }, { easing: 'sineOut' }).start();
            this.label.string = "show";
        } else {
            tween(this.modeNode)
                .to(0.3, { position: new Vec3(0, pos.y, 1) }, { easing: 'sineIn' })
                .start()
            this.label.string = "hide";
        }
    }
}


