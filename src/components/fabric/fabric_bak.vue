<template>
  <div>
    <div class="title">{{name}}:{{width}}*{{height}}</div>
    <canvas id="canvas" :width="width" :height="height"></canvas>


  </div>
</template>

<script>
import Utils from '../../utils/utils';
import initAligningGuidelines  from '../../utils/guidelines';


export default {
  name: 'VueFabric',
  props: {
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
      name:'canvas',
      canvas:null,
    };
  },
  created () {

  },
  beforeMount(){

  },
  mounted () {
    //console.log('mouted');

    this.canvas = new fabric.Canvas('canvas', { preserveObjectStacking: true });
    let canvas = this.canvas;
    console.log(canvas);

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



    /*canvas.add(new fabric.Text('X-cord',{ //fontStyle:'italic',
       fontFamily:' Hoefler Text',
       backgroundColor:"#999",
       fill:'#fff',
       fontSize:12,
      lineHeight:20,
       left:50,
       top:50,
       hasControls:false,
       selectable:false
    }));
    canvas.on('mouse:move',function(options){
      getMouse(options);
    });
    function getMouse(options){
      canvas.getObjects('text')[0] .text =
              "X："+ options.e .clientX +",Y："+ options.e.clientY; // +"Y："+ options.e.clientY;
      canvas.getObjects('text')[0] .left = options.e .clientX;
      canvas.getObjects('text')[0] .top = options.e.clientY +30;
      canvas.renderAll();
    }*/


    /*let canvasRuler = new CanvasRuler({
      axisWidth: 0.6,
      lineColor: '#999',
      gridWidth: 100,
      gridHeight: 20
    }, canvas.lowerCanvasEl);*/

    // var rulerCanvas = document.getElementById('canvas');
    /*window.canvasRuler = new CanvasRuler({
      axisWidth: 1,
      lineColor: '#999',
      gridWidth: 100,
      gridHeight: 20
    },  canvas.lowerCanvasEl);

    canvasRuler.init(canvasRuler.getDrawType().ALL);*/

   // console.log( canvasRuler );

    //initRulerLine();

    initAligningGuidelines(canvas);   //初始化辅助线

  },
  methods: {
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

  .title{
    position: fixed;
    top:20px;
    left:20px;
    z-index: 9999999999;
  }
</style>
