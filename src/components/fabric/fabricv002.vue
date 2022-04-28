<template>
  <!---有画布 有标尺 有辅助线 （但是标尺不固定） 的组件 v0.0.2 -->
  <div :style="wrapperStyle" class="vue-ruler-wrapper" onselectstart="return false;">
    <section v-show="rulerToggle">
      <div ref="horizontalRuler" class="vue-ruler-h" @mousedown.stop="horizontalDragRuler"  >
        <span v-for="(item,index) in xScale" :key="index" :style="{left:index * 50 + 2 + 'px'}" class="n">{{ item.id }}</span>
      </div>
      <div ref="verticalRuler" class="vue-ruler-v" @mousedown.stop="verticalDragRuler" >
        <span v-for="(item,index) in yScale" :key="index" :style="{top:index * 50 + 2 + 'px'}" class="n">{{ item.id }}</span>
      </div>
      <div :style="{top:verticalDottedTop + 'px'}" class="vue-ruler-ref-dot-h" />
      <div :style="{left:horizontalDottedLeft + 'px'}" class="vue-ruler-ref-dot-v" />
      <div
              v-for="item in lineList"
              :title="item.title"
              :style="getLineStyle(item)"
              :key="item.id"
              :class="`vue-ruler-ref-line-${item.type}`"
              @mousedown="handleDragLine(item)"></div>
    </section>
    <div ref="content" class="vue-ruler-content" :style="contentStyle">
      <slot />
    </div>
    <div v-show="isDrag" class="vue-ruler-content-mask"></div>

    <div class="title">{{name}}:{{width-20}}*{{height-20}}</div>
    <canvas style="margin-left:18px; margin-top:18px;" id="canvas" :width="width-18" :height="height-18"></canvas>

  </div>
</template>

<script>
import Utils from '../../utils/utils';
import { on, off } from '../../examples/event.js'
import initAligningGuidelines  from '../../utils/guidelines';


export default {
  name: 'VueFabric',
  props: {
    position: {
      type: String,
      default: 'relative',
      validator: function (val) {
        return ['absolute', 'fixed', 'relative', 'static', 'inherit'].indexOf(val) !== -1
      }
    }, // 规定元素的定位类型
    isHotKey: {
      type: Boolean, default: false
    }, // 热键开关
    isScaleRevise: {
      type: Boolean, default: false
    }, // 刻度修正(根据content进行刻度重置)
    value: {
      type: Array,
      default: () => {
        return [] // { type: 'h', site: 50 }, { type: 'v', site: 180 }
      }
    }, // 预置参考线
    contentLayout: {
      type: Object,
      default: () => {
        return { top: 0, left: 0 }
      }
    }, // 内容部分布局
    parent: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    },
    stepLength: {
      type: Number,
      default: 50,
      validator: (val) => val % 10 === 0
    }, // 步长

    xLeft:{
      type: Number,
      default: -50,
    },
    yTop:{
      type: Number,
      default: -10,
    },

    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      size: 17,
      left_top: 18, // 内容左上填充
      windowWidth: 0, // 窗口宽度
      windowHeight: 0, // 窗口高度
      xScale: [], // 水平刻度
      yScale: [], // 垂直刻度
      topSpacing: 0, // 标尺与窗口上间距
      leftSpacing: 0, //  标尺与窗口左间距
      isDrag: false,
      dragFlag: '', // 拖动开始标记，可能值x(从水平标尺开始拖动),y(从垂直标尺开始拖动)
      horizontalDottedLeft: -999, // 水平虚线位置
      verticalDottedTop: -999, // 垂直虚线位置
      rulerWidth: 0, // 垂直标尺的宽度
      rulerHeight: 0, // 水平标尺的高度
      dragLineId: '', // 被移动线的ID
      keyCode: {
        r: 82
      }, // 快捷键参数
      rulerToggle: true, // 标尺辅助线显示开关

      name:'canvas',
      canvas:null,

      //拖拽控制滚动条
      flag:false,
      fromX:0,
      fromY:0,
      scrollLeftFrom:0,
      scrollTopFrom:0,
    };
  },
  created () {

  },
  beforeMount(){

  },
  mounted () {
    on(document.getElementById('parentBox'), 'mousedown', this.scolldown)  //新增事件控制滚动条的
    on(document.getElementById('parentBox'), 'mousemove', this.scollmove)
    on(document.getElementById('parentBox'), 'mouseup', this.scollup)
    on(document.getElementById('parentBox'), 'mouseout', this.scollout)


    on(document, 'mousemove', this.dottedLineMove)   //标尺原来监听
    on(document, 'mouseup', this.dottedLineUp)
    on(document, 'keyup', this.keyboard)
    this.init()
    on(window, 'resize', this.windowResize)


    /* 标尺
    * --------------------------------------
    *  画布
    * */
    //console.log('mouted');

    this.canvas = new fabric.Canvas('canvas', { preserveObjectStacking: true });
    let canvas = this.canvas;
   // console.log(canvas);

    fabric.Canvas.prototype.rotationCursor = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5NzBBQTBGQ0Y4ODcxMUVBQURGNkU5NzQ3OUY4RTA5NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5NzBBQTBGREY4ODcxMUVBQURGNkU5NzQ3OUY4RTA5NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjk3MEFBMEZBRjg4NzExRUFBREY2RTk3NDc5RjhFMDk2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3MEFBMEZCRjg4NzExRUFBREY2RTk3NDc5RjhFMDk2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+QUJwRwAAAytJREFUeNrsVk1oGkEUXqVIqCRIhVICEsSTkFuwEPDaWiQ9NaQx6VGRaqCHQATBEFMKKUoLos0h4LV4aWxCbyqhEbx4CJJCwJMJRKVWxJ/EkJ/X9yabZd2oay+hhX7wsbPz3sybmTfv21UAAHdXUHJ3iL8rmEKh0CHdyASyhAQRC8gQ0izyNyCD9Lw1GeWsFxFvdDoduN1uSCQSUCqVQIxCoQChUAjMZjM5B5DTw8PDEAwG6f3Trfl6BFEgQzMzM3BwcAByaDabYLPZYHR0FJLJJOu73sdgwd65XC44Pz8XJjw+PoZYLAZ+vx+8Xi/b6enpqWBvtVqwu7vL2u12myZpywZDOCcnJ6FarbKBV1dXEI1GwWg0gkqlIgc/0qtWq2FiYgI2NjagVqt17LRer5NfvW8wxH0E7O3tCQMXFxfJEEWakCqRrxr5lBaQyWQ6gjUaDXJoyAV7gYDLy0s2iJJPiaZFdDmBRyMjI7C5udk1h2hvygX7jGADTk5OgG4i9hlFditym6ef8tcL3S7IPUklPEawRjqd5orFIjXzfP08M5lM35aXl5l9dXV1amtri8tms5xU8s7Ozuix3rfOEL8QbGWBQIDVjsj2FSGsnNrUh3yOnJLwSbdbLt3ZT8QDxM2uiiIbXR7xC8fncpvf+cOhoaGywWDgsNjpfRxtP/rJVZEPwlFAeohs67hbLpVKMVJbclSvPR4Pt7+/z62trbF3uWP8gmDHdHh4CBqNhjo1Ivs0MslzWtSvo8uEC2VjMd/UmZa7ja8QcHFxwQYtLS1R50cZ/SRpC66srAj59Pl8ZPANoiDfEYLszM3NUecHpFbiRykYR0ZI2kiuCEdHR6DX68lBP0gwm8ViYZJDIP1bWFgArVZ7o+x2pEupVMLY2BhEIhEmaQQSg/n5efLzdj2FHkfzfnZ2FiqVinA0+XyelYPdbgfaCWliuVzuUA2n00mDwz2PvE8u3mKBQzwel/3E7OzsAJ2GuC7/KBgf0IKMW61WCIfDkMvlmMiiQrCvApYAOBwO9tVGv5f95pINJtHEMDJHak6KhKwiU0gH3chB5lH8/5X754L9FmAAxKqp09gZRrsAAAAASUVORK5CYII=) 12 12, auto";
    canvas.backgroundColor = '#ffffff';
    canvas.selection = true;
    fabric.Canvas.prototype.customiseControls({
      tl: {
        action: 'scale'
      },
      tr: {
        action: 'scale'
      },
      bl: {
        action: 'scale',
      },
      br: {
        action: 'scale',
      },
     /* mb: {
          action: function(e, target) {
              console.log('e----------------',e,target);

              if(target.isType!=='font'){
                target.set({
                  width:target.width * target.scaleX,
                  height:target.height * target.scaleY,
                  scaleX:1,
                  scaleY:1,
                });
                canvas.renderAll();
              }

          },
      },*/
      mb: {
        action: 'scaleY',
      },
      mt: {
        action: 'scaleY',
      },

      mr:{
        action: 'scaleX',
      },
      ml:{
        action: 'scaleX',
      },
      mtr: {
        action: 'rotate'
      }
    });
    let that = this;
    this.canvas.controlsAboveOverlay = false;
    this.canvas.skipOffscreen = true;
    this.canvas.preserveObjectStacking = true;
    this.canvas.on('selection:created', function (options) {
      that.$emit('selection:created', options);
    });
    this.canvas.on('mouse:down', function (options) {
      that.$emit('mouse:down', options);
    });
    this.canvas.on('mouse:up', function (options) {
      that.$emit('mouse:up', options);
    });
    this.canvas.on('mouse:move', function (options) {
      that.$emit('mouse:move', options);
    });
    this.canvas.on('mouse:dblclick', function (options) {
      that.$emit('mouse:dblclick', options);
    });
    this.canvas.on('mouse:over', function (options) {
      that.$emit('mouse:over', options);
    });
    this.canvas.on('mouse:out', function (options) {
      that.$emit('mouse:out', options);
    });
    this.canvas.on('object:added', function (options) {
      that.$emit('object:added', options);
    });
    this.canvas.on('object:removed', function (options) {
      that.$emit('object:removed', options);
    });
    this.canvas.on('object:moved', function (options) {
      that.$emit('object:moved', options);
    });
    this.canvas.on('object:modified', function (options) {
      that.$emit('object:modified', options);
    });
    this.canvas.on('object:rotating', function (options) {
      that.$emit('object:rotating', options);
    });
    this.canvas.on('object:scaling', function (options) {
      that.$emit('object:scaling', options);
    });
    this.canvas.on('object:scaled', function (options) {
      that.$emit('object:scaled', options);
    });
    this.canvas.on('object:selected', function (options) {
      that.$emit('object:selected', options);
    });
    this.canvas.on('object:moving', function (options) {
      that.$emit('object:moving', options);
    });
    this.canvas.on('selection:updated', function (options) {
      that.$emit('selection:updated', options);
    });
    this.canvas.on('selection:changed', function (options) {
      that.$emit('selection:changed', options);
    });
    this.canvas.on('selection:cleared', function (options) {
      that.$emit('selection:cleared', options);
    });
    this.canvas.on('before:selection:cleared', function (options) {
      that.$emit('before:selection:cleared', options);
    });
    this.canvas.on('text:changed', function(options) {
      that.$emit('text:changed', options);
    });
    this.canvas.on('text:editing:entered',function(options){
      that.$emit('text:editing:entered', options);
    });

    this.canvas.on('before:render'),function(options){
      that.$emit('before:render',options);
    };
    this.canvas.on('after:render'),function(options){
      that.$emit('after:render',options);
    };
    this.canvas.on('dragover'),function(options){
      that.$emit('dragover',options);
    };
    this.canvas.on('dragenter'),function(options){
      that.$emit('dragenter',options);
    };
    this.canvas.on('dragleave'),function(options){
      that.$emit('dragleave',options);
    };
    this.canvas.on('drop'),function(options){
      that.$emit('drop',options);
    };

    initAligningGuidelines(canvas);   //初始化辅助线

  },

  computed: {
    wrapperStyle() {
      return {
        width : this.windowWidth + 'px',
        height : this.windowHeight + 'px',
        position: this.position
      }
    },
    contentStyle() {
      return {
        left: this.contentLayout.left + 'px',
        top: this.contentLayout.top + 'px',
        padding: this.left_top + 'px 0px 0px ' + this.left_top + 'px'
      }
    },
    lineList() {
      let hCount = 0;
      let vCount = 0;
      return this.value.map((item) => {
        const isH = item.type === 'h';
        let margin = item.type==='h'?  this.yTop :this.xLeft ;
        return {
          id: `${item.type}_${isH ? hCount++ : vCount++}`,
          type: item.type,
          title: (item.site + margin).toFixed(2) + 'px',
          [isH ? 'top' : 'left']: item.site / (this.stepLength / 50) + this.size
        }
      })
    }
  },
  watch: {
    visible: {
      handler(visible) {
        this.rulerToggle = visible;
      },
      immediate: true
    },
  },
  beforeDestroy () {
    off(document.getElementById('parentBox'), 'mousedown', this.scolldown)  //事件滚动画布监听
    off(document.getElementById('parentBox'), 'mousemove', this.scollmove)
    off(document.getElementById('parentBox'), 'mouseup', this.scollup)
    off(document.getElementById('parentBox'), 'mouseout', this.scollout)


    off(document, 'mousemove', this.dottedLineMove)  //标尺监听
    off(document, 'mouseup', this.dottedLineUp)
    off(document, 'keyup', this.keyboard)
    off(window, 'resize', this.windowResize)
  },
  methods: {
    scolldown(e){
      this.flag = false; //影响旋转，暂时关闭
      this.fromX = JSON.parse(JSON.stringify(e.clientX));
      this.fromY = JSON.parse(JSON.stringify(e.clientY));
      this.scrollLeftFrom = document.getElementById('parentBox').scrollLeft;
      this.scrollTopFrom = document.getElementById('parentBox').scrollTop;
    },
    scollmove(e){
      if(this.flag){
        var moveX = e.clientX;
        var scrollX = ((moveX - this.fromX)/1000) * this.width;  //1000 是父组件 id='parentBox'的宽

        if (scrollX > 0 ) {
          document.getElementById('parentBox').scrollLeft = this.scrollLeftFrom + scrollX;
        }
        else {
          document.getElementById('parentBox').scrollLeft = this.scrollLeftFrom + scrollX;
        }

        var moveY = e.clientY;
        var scrollY = ((moveY - this.fromY)/600) * this.height;//600 是父组件 id='parentBox'的高
        if (scrollY > 0 ) {
          document.getElementById('parentBox').scrollTop = this.scrollTopFrom + scrollY;
        }
        else {
          document.getElementById('parentBox').scrollTop = this.scrollTopFrom + scrollY;
        }
      }
    },
    scollup(e){
      this.flag = false;
    },
    scollout(e){
      this.flag = false;
    },
    /* 滚动条
    * ---------------------
    *   标尺
    * */
    init () {
      console.log(this.stepLength);
      this.box()
      this.scaleCalc()
    },
    windowResize() {
      this.xScale = []
      this.yScale = []
      this.init()
    },
    getLineStyle({type, top, left}) {
      return type === 'h' ? {top: top + 'px'} : {left: left + 'px'}
    },
    handleDragLine({type, id}) {
      return type === 'h' ? this.dragHorizontalLine(id) : this.dragVerticalLine(id)
    },
    // 获取窗口宽与高
    box () {
      if (this.isScaleRevise) { // 根据内容部分进行刻度修正
        const content = this.$refs.content
        const contentLeft = content.offsetLeft
        const contentTop = content.offsetTop
        this.getCalcRevise(this.xScale, contentLeft)
        this.getCalcRevise(this.yScale, contentTop)
      }
      if (this.parent) {
        const style = window.getComputedStyle(this.$el.parentNode, null)
        this.windowWidth = parseInt(style.getPropertyValue('width'), 10)
        this.windowHeight = parseInt(style.getPropertyValue('height'), 10)
      } else {
        this.windowWidth = document.documentElement.clientWidth - this.leftSpacing
        this.windowHeight = document.documentElement.clientHeight - this.topSpacing
      }
      /*this.rulerWidth = this.$refs.verticalRuler.clientWidth
      this.rulerHeight = this.$refs.horizontalRuler.clientHeight*/
      this.rulerWidth = this.width;
      this.rulerHeight = this.height;
      this.setSpacing()
    },
    //获取间隔
    setSpacing () {
      this.topSpacing = this.$refs.horizontalRuler.getBoundingClientRect().y //.offsetParent.offsetTop
      this.leftSpacing = this.$refs.verticalRuler.getBoundingClientRect().x// .offsetParent.offsetLeft
    },
    // 计算刻度
    scaleCalc () {
      this.getCalc(this.xScale, this.windowWidth,'x');
      this.getCalc(this.yScale, this.windowHeight,'y');
    },
    // 获取刻度方法
    getCalc (array,length, direction) {
      if(direction ==='x'){
        for (let i = this.xLeft; i < length * this.stepLength / 50; i += this.stepLength) {
          if (i % this.stepLength === 0) {
            array.push({ id: i })
          }
        }
      }else if(direction ==='y'){
        for (let i = this.yTop; i < length * this.stepLength / 50; i += this.stepLength) {
          if (i % this.stepLength === 0) {
            array.push({ id: i })
          }
        }
      }else{
        for (let i = 0; i < length * this.stepLength / 50; i += this.stepLength) {
          if (i % this.stepLength === 0) {
            array.push({ id: i })
          }
        }
      }

    },
    // 获取矫正刻度方法
    getCalcRevise (array,length) {
      for (let i = 0; i < length; i += 1) {
        if (i % this.stepLength === 0 && i + this.stepLength <= length) {
          array.push({ id: i })
        }
      }
    },
    // 生成一个参考线
    newLine (val) {
      this.isDrag = true
      this.dragFlag = val
    },
    // 虚线移动
    dottedLineMove ($event) {
     // console.log(document.getElementById('parentBox').scrollTop ,$event);
      this.setSpacing()
      switch (this.dragFlag) {
        case 'x':
          if (this.isDrag) {
            this.verticalDottedTop = $event.pageY - this.topSpacing
          }
          break
        case 'y':
          if (this.isDrag) {
            this.horizontalDottedLeft = $event.pageX - this.leftSpacing
          }
          break
        case 'h':
          if (this.isDrag) {
            this.verticalDottedTop = $event.pageY - this.topSpacing
          }
          break
        case 'v':
          if (this.isDrag) {
            this.horizontalDottedLeft = $event.pageX - this.leftSpacing
          }
          break
        default:
          break
      }
    },
    // 虚线松开
    dottedLineUp ($event) {
      this.setSpacing()
      if (this.isDrag) {
        this.isDrag = false
        const cloneList = JSON.parse(JSON.stringify(this.value));
        switch (this.dragFlag) {
          case 'x':
            cloneList.push({
              type: 'h',
              site: ($event.pageY - this.topSpacing - this.size) * (this.stepLength / 50)
            })
            this.$emit('setLine', cloneList)
            break
          case 'y':
            cloneList.push({
              type: 'v',
              site: ($event.pageX - this.leftSpacing - this.size) * (this.stepLength / 50)
            })
            this.$emit('setLine', cloneList)
            break
          case 'h':
            this.dragCalc(cloneList, $event.pageY, this.topSpacing, this.rulerHeight,'h')
            this.$emit('setLine', cloneList)
            break
          case 'v':
            this.dragCalc(cloneList, $event.pageX, this.leftSpacing, this.rulerWidth,'v')
            this.$emit('setLine', cloneList)
            break
          default:
            break
        }
        this.verticalDottedTop = this.horizontalDottedLeft = -10
      }
    },
    //移动时计算瞬间
    dragCalc (list, page, spacing, ruler, type) {
     // console.log(page - spacing < ruler,page , spacing , ruler);
      if (page - spacing > ruler) {
        let Index, id
        this.lineList.forEach((item, index) => {
          if (item.id === this.dragLineId) {
            Index = index
            id = item.id
          }
        })
        list.splice(Index, 1, {
          type: type,
          site: -600
        })
      } else {
        let Index, id
        this.lineList.forEach((item, index) => {
          if (item.id === this.dragLineId) {
            Index = index
            id = item.id
          }
        })
        list.splice(Index, 1, {
          type: type,
          site: (page  - spacing - this.size ) * (this.stepLength / 50)
        })

      }
    },
    // 水平标尺处按下鼠标
    horizontalDragRuler () {
      this.newLine('x')
    },
    // 垂直标尺处按下鼠标
    verticalDragRuler () {
      this.newLine('y')
    },
    // 水平线处按下鼠标
    dragHorizontalLine (id) {
      this.isDrag = true
      this.dragFlag = 'h'
      this.dragLineId = id
    },
    // 垂直线处按下鼠标
    dragVerticalLine (id) {
      this.isDrag = true
      this.dragFlag = 'v'
      this.dragLineId = id
    },
    // 键盘事件
    keyboard ($event) {
      if (this.isHotKey) {
        switch ($event.keyCode) {
          case this.keyCode.r:
            this.rulerToggle = !this.rulerToggle
            this.$emit('update:visible', this.rulerToggle)
            if (this.rulerToggle) {
              this.left_top = 18;
            } else {
              this.left_top = 0;
            }
            break
        }
      }
    },

    /*  标尺组件
    *  ------------------------------------------------------------------------------------
    *   画布组件
    */

    //元素不选中即置顶
    setStackingtrue(){
      this.canvas.preserveObjectStacking = true;
    },

    //获取当前活跃元素
    getEditObj () {
      let obj = this.canvas.getActiveObject();
      return obj;
    },
    //获取当前活跃元素
    getActiveObject(){
      var obj = this.canvas.getActiveObject();
      return obj;
    },
    //设置obj为当前活跃元素
    setActiveObject(obj){
      this.canvas.setActiveObject(obj);
      this.canvas.renderAll();
    },
    //单个删除 多个删除 不支持组合删除
    removeCurrentObj () {
      let obj = this.canvas.getActiveObject();
      // console.log(obj._objects);
      if(obj._objects){
        this.canvas.discardActiveObject();
        for(var i in obj._objects){
          this.canvas.remove(obj._objects[i]);
        }
      }else{
        this.canvas.remove(obj);
      }
      this.canvas.renderAll();
    },
    //删除当前活跃元素
    removecurrentObj(){
      let obj = this.canvas.getActiveObject();
      this.canvas.remove(obj);
    },
    //删除指定元素
    removeObj(obj){
      this.canvas.remove(obj);
    },
    //新增指定元素
    addObj(obj){
      this.canvas.add(obj);
      this.canvas.renderAll();
    },
    //设置整体缩放比
    setZoom(n){
      this.canvas.setZoom(n);
      this.canvas.renderAll();
    },
    //设置画布背景颜色
    setbackground(color){
      this.canvas.backgroundColor = color;
      this.canvas.renderAll();
    },
    //禁止选择
    setNomove(){
      this.canvas.selection = false;
      this.canvas.renderAll();
    },
    //取消活跃元素的选择
    discardActive () {
      this.canvas.discardActiveObject();
      this.canvas.discardActiveGroup();
      this.canvas.renderAll();
    },
    //层级移动
    moveToshow (obj,index) {
      // let obj = this.canvas.getActiveObject();
      this.canvas.moveTo(obj,index);
      this.canvas.requestRenderAll();
      this.canvas.renderAll();

    },

   /**
    * 创建矩形、 圆角矩形 、平行四边形
    * @options {
    *     id, width, height, left, top, padding, angle, scaleX,  scaleY, selectable, visible,   与原数据同名
    *     fillColor，backgroundColor, bordersColor, bordersWidth, bordersStyle,           原数据名改造
    *     rx, ry, skewX,    影响圆角和形状
    * }
    * */
    createRect (options) {
      options = Object.assign({ width: 50, height: 30, left: 50, top: 50,  padding: 0, angle: 0, scaleX: 1,  scaleY: 1, }, options);
      let rect = new fabric.Rect({
        ...options,
        isType:'Rect',
        isDiff: 'static',
        selectable: options.selectable!==false ? true : options.selectable,                 //元素是否可选中
        visible: options.visible!==false ? true : options.visible,                          //元素是否可见
        fill: options.fillColor?options.fillColor:'#000',                                   // 填充的颜色（矩形）
        fillColor: options.fillColor?options.fillColor:'#000',                              // 填充的颜色
        backgroundColor: options.backgroundColor?options.backgroundColor:'rgba(0,0,0,0)',   // 边框填充的颜色
        stroke: options.bordersColor?options.bordersColor:'rgba(0,0,0,0)',                  // 边框颜色
        strokeWidth: options.bordersWidth?options.bordersWidth:0,                           // 边框宽度
        strokeDashArray:options.bordersStyle?options.bordersStyle:[0,0],                    // 边框样式 虚线 [5,1]     直线[0,0]

        borderDashArray:[8,2],                            //  水印框虚线边
        borderColor: '#999',                              //  描边颜色
        cornerColor: '#999',                              //  边角颜色
        cornerStrokeColor: '#999',                        //  边角描边颜色
        cornerFillColor: '#eee',                          //  边角描边颜色
        minScaleLimit: 0.0001,                            //  最小限制
        lockScalingFlip: true,                            // 禁止缩放时翻转
        flipX: false,
        flipY: false,
        originX: 'left',
        originY: 'top',
        centeredRotation:false,                           //默认选中左上角
        stopContextMenu: true,                            //禁掉鼠标右键默认事件
      });
      this.canvas.add(rect);
      this.canvas.renderAll();
      return rect;
    },


    //创建圆形组件
    createCircle (options) {
      options = Object.assign({ left: 0, top: 0, radius: 30, fillColor: 'rgba(255, 255, 255, 0)', color: '#B2B2B2', drawWidth: 2 }, options);
      let defaultOption = {
        ...options,
        fill: options.fillColor,
        strokeWidth: options.drawWidth,
        stroke: options.color
      };
      let Circle = new fabric.Circle(defaultOption);
      this.canvas.add(Circle);
      this.canvas.renderAll();
    },
    //创建文本
    createText (text, options) {
      options = Object.assign({ left: 100, top: 100 }, options);
      var canvasObj = new fabric.Text(text, { ...options });
      this.canvas.add(canvasObj);
      this.canvas.renderAll();
    },


  }
};
</script>

<style lang='scss' scoped>
  .vue-ruler{
    &-wrapper {
      left: 0;
      top: 0;
      z-index: 99991;
      overflow: hidden;
      user-select: none;
    }
    &-h,
    &-v,
    &-ref-line-v,
    &-ref-line-h,
    &-ref-dot-h,
    &-ref-dot-v {
      position: absolute;
      left: 0;
      top: 0;
      overflow: hidden;
      z-index: 999;
    }
    &-h,
    &-v,
    &-ref-line-v,
    &-ref-line-h,
    &-ref-dot-h,
    &-ref-dot-v {
      position: absolute;
      left: 0;
      top: 0;
      overflow: hidden;
      z-index: 999;
    }
    &-h {
      width: 100%;
      height: 18px;
      left: 18px;
      opacity: 0.6;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAMAAAAuTX21AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRFMzMzAAAA////BqjYlAAAACNJREFUeNpiYCAdMDKRCka1jGoBA2JZZGshiaCXFpIBQIABAAplBkCmQpujAAAAAElFTkSuQmCC)
      repeat-x; /*./image/ruler_h.png*/
    }
    &-v {
      width: 18px;
      height: 100%;
      top: 18px;
      opacity: 0.6;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAyCAMAAABmvHtTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRFMzMzAAAA////BqjYlAAAACBJREFUeNpiYGBEBwwMTGiAakI0NX7U9aOuHyGuBwgwAH6bBkAR6jkzAAAAAElFTkSuQmCC)
      repeat-y; /*./image/ruler_v.png*/
    }
    &-v .n,
    &-h .n {
      position: absolute;
      font: 10px/1 Arial, sans-serif;
      color: #333;
      cursor: default;
    }
    &-v .n {
      width: 8px;
      left: 3px;
      word-wrap: break-word;
    }
    &-h .n {
      top: 1px;
    }
    &-ref-line-v,
    &-ref-line-h,
    &-ref-dot-h,
    &-ref-dot-v {
      z-index: 998;
    }
    &-ref-line-h {
      width: 100%;
      height: 3px;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAABCAMAAADU3h9xAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFSv//AAAAH8VRuAAAAA5JREFUeNpiYIACgAADAAAJAAE0lmO3AAAAAElFTkSuQmCC)
      repeat-x left center; /*./image/line_h.png*/
      cursor: n-resize; /*url(./image/cur_move_h.cur), move*/
    }
    &-ref-line-v {
      width: 3px;
      height: 100%;
      _height: 9999px;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAICAMAAAAPxGVzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFSv//AAAAH8VRuAAAAA5JREFUeNpiYEAFAAEGAAAQAAGePof9AAAAAElFTkSuQmCC)
      repeat-y center top; /*./image/line_v.png*/
      cursor: w-resize; /*url(./image/cur_move_v.cur), move*/
    }
    &-ref-dot-h {
      width: 100%;
      height: 3px;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAMAAABFaP0WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFf39/////F3PnHQAAAAJ0Uk5T/wDltzBKAAAAEElEQVR42mJgYGRgZAQIMAAADQAExkizYQAAAABJRU5ErkJggg==)
      repeat-x left 1px; /*./image/line_dot.png*/
      cursor: n-resize; /*url(./image/cur_move_h.cur), move*/
      top: -10px;
    }
    &-ref-dot-v {
      width: 3px;
      height: 100%;
      _height: 9999px;
      background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAMAAABFaP0WAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAZQTFRFf39/////F3PnHQAAAAJ0Uk5T/wDltzBKAAAAEElEQVR42mJgYGRgZAQIMAAADQAExkizYQAAAABJRU5ErkJggg==)
      repeat-y 1px top; /*./image/line_dot.png*/
      cursor: w-resize; /*url(./image/cur_move_v.cur), move*/
      left: -10px;
    }
    &-content {
      position: absolute;
      z-index: 997;
    }
    &-content-mask{
      position: absolute;
      width: 100%;
      height: 100%;
      background: transparent;
      z-index: 998;
    }
  }

  .title{
    position: fixed;
    top:20px;
    left:20px;
    z-index: 9999999999;
  }
</style>
