<template>
  <div class="bigbox" :style="'width: '+ boxWidth+'px;height:'+boxHeight+'px;' "  @contextmenu="showMenu">
      <div class="scrollx" :style="'height:'+boxHeight+'px;margin-left:'+ (boxWidth-8)+'px;'" v-if="showRuler[1]?(height+18)>boxHeight:height>boxHeight"><i  id="scrolly" v-drag></i></div>
      <div class="scrolly" :style="'width:'+boxWidth+'px;margin-top:'+ (boxHeight-8)+'px;'" v-if="showRuler[0]?(width+18)>boxWidth:width>boxWidth"><i  id="scrollx"  v-drag></i></div>
      <div class="boxblock" v-if="showRuler[0]&&showRuler[1]"></div>
      <div class="xZhou" id="xZhou" :style="'width: '+ (boxWidth-returnXYshowcanvas(showXzhou,showYzhou))+'px; visibility:'+returnXYshow(showXzhou)+';margin-left:'+returnXYshowcanvas(showXzhou,showYzhou)+'px;'">
          <div class="x-line" :style="'width: '+ (width>boxWidth?width:boxWidth)+'px;transform-origin:left; transform:scaleX('+canvasZoom+');'">
              <span v-for="(item,index) in xScale"  :key="index" :style="{left:index * 50 + 2 + 'px'}" class="number">{{ item.id }}</span>
          </div>
      </div>
      <div class="yZhou" id="yZhou" :style="'height: '+ (boxHeight-returnXYshowcanvas(showXzhou,showYzhou)) +'px; visibility:'+returnXYshow(showYzhou)+';margin-top:'+returnXYshowcanvas(showXzhou,showYzhou)+'px;'">
          <div class="y-line" :style="'height:'+ (height>boxHeight?height:boxHeight)+'px; transform-origin:top; transform:scaleY('+canvasZoom+');top:'+returnXYshowcanvas(showXzhou,showYzhou)+'px;'">
              <span v-for="(item,index) in yScale"  :key="index" :style="{top:index * 50 + 2 + 'px'}" class="number">{{ item.id }}</span>
          </div>
      </div>

   <div class="content" :style="'width: '+ boxWidth+'px;height:'+boxHeight+'px;' "  id ="content" >

      <div  class="black" :style="'position: absolute; top:'+returnXYshowcanvas(showXzhou,showYzhou)+'px; left: '+ returnXYshowcanvas(showYzhou,showXzhou)+'px;'">
        <div  class="yellow" :style="'width: '+(width * canvasZoom)+'px;height:'+(height * canvasZoom)+'px; '">
         <!-- <fabricbak ref="canvas" :width="width" :height="height" id="can"></fabricbak>-->
         <!-- <div class="title">{{name}}:{{width}}*{{height}} </div>-->
            <input type="text" id="code" style="position:fixed; top:-100px; z-index:9999;"><!--style="visibility: hidden;"-->
            <div style="position:fixed; top:-100px; z-index:9999;visibility: hidden;">{{clipboard}}</div>
          <canvas id="canvas" :width="width>boxWidth?width:boxWidth" :height="height>boxHeight?height:boxHeight" ></canvas>
            <vue-context-menu :contextMenuData="contextMenuData"
                                @toTopLayer="toTopLayer" @toLastLayer="toLastLayer" @toNextLayer="toNextLayer" @toBottomLayer="toBottomLayer"
                                @removeEditObj="removeEditObj" @copypaste="copypaste">
            </vue-context-menu>
        </div>
      </div>
   </div>
  </div>

</template>

<script>
  import { on, off } from '../../examples/event'   //时间监听
  import Utils from '../../utils/utils';   //事件注册
  import initAligningGuidelines  from '../../utils/guidelines';  //组件间对齐线
  import vueContextMenu from '../../examples/contextmenu'   //右键菜单

  export default {
    name: 'FabricCanvas',
    components:{vueContextMenu},
    props: {
      width: {
        type: Number,
        required: true
      },
      height: {
        type: Number,
        required: true
      },
      boxWidth: {
        type: Number,
        required: true
      },
      boxHeight: {
        type: Number,
        required: true
      },
      stepLengthp: {
        type: Number,
        default: 50
      },
      showRuler:{
        type:Array,
        default: () => [true,true],
      },
        idno:{
          type:Number,
          default:1,
          required: true
        }
    },
    data(){
      return{
        name:'canvas',
        canvas:null,
        canvasZoom:1,
          clipboard:'',
          cid:1,

        xScale:[],
        yScale:[],
        xLeft:0,
        yTop:0,
        stepLength:this.stepLengthp,
        showXzhou:this.showRuler[0],
        showYzhou:this.showRuler[1],
        rulertop:0,
        rulerleft:0,

        contextMenuData: {
              menuName: 'demo',
              axis: {
                  x: null,
                  y: null
              },
              menulists: [
                  {
                      fnHandler: '',
                      icoName: 'fa fa-home fa-fw',
                      btnName: this.$t('m.layer'),
                      children:[
                          {
                              fnHandler: 'toLastLayer',
                              icoName: 'fa fa-home fa-fw',
                              btnName: this.$t('m.MoveUpALayer')
                          },
                          {
                              fnHandler: 'toNextLayer',
                              icoName: 'fa fa-home fa-fw',
                              btnName: this.$t('m.DownALayer')
                          },
                          {
                              fnHandler: 'toTopLayer',
                              icoName: 'fa fa-home fa-fw',
                              btnName: this.$t('m.OnTheTopFloor')
                          },
                          {
                              fnHandler: 'toBottomLayer',
                              icoName: 'fa fa-home fa-fw',
                              btnName: this.$t('m.AtTheBottom')
                          }
                      ]
                  },
                  {
                      fnHandler: 'copypaste',
                      icoName: 'fa fa-home fa-fw',
                      btnName: this.$t('m.copy')
                  },
                  {
                      fnHandler: 'removeEditObj',
                      icoName: 'fa fa-home fa-fw',
                      btnName: this.$t('m.delete')
                  }
              ]
          }
      }
    },
    directives: {
      drag: {
        inserted: function (el, binding, vnode) {
          vnode = vnode.elm;

          el.dragstart = ((event)=>{
            console.log('drag 0');
            event.preventDefault();
            document.onmousemove = document.onmouseup = null
          });
          el.ondrag = ((event)=>{
            console.log('drag 1');
            event.preventDefault();
            document.onmousemove = document.onmouseup = null;
            return false;
          });

          el.onmousedown = ((event) => {
            let dragflag = true;
            if (event.target.id !== "scrollx" && event.target.id !== "scrolly") {
              dragflag = false;
              return;
            }

            // 获取鼠标在滑块中的位置
            let mouseX = event.clientX - vnode.offsetLeft;
            let mouseY = event.clientY - vnode.offsetTop;
            let direction = null;

            if(event.target.id === "scrollx"){
              direction = 'x';
            }else if(event.target.id === "scrolly"){
              direction = 'y';
            }

            // 绑定移动和停止函数
            document.onmousemove = ((event) => {
              let left, top;
              left = event.clientX - mouseX;
              top = event.clientY - mouseY;

              // 赋值移动
              if(direction==='x'){
                if (event.clientY < mouseY-50 ||  event.clientY > mouseY+50) {
                  dragflag = false;
                  return
                }
                if(dragflag){
                  // 获取滑块在页面中距X轴的最小、最大 位置
                  let minX = 18;
                  let maxX = vnode.parentNode.offsetWidth - 8 - 50;
                  if (left <= minX) {
                    left = minX
                  } else if (left >= maxX) {
                    left = maxX
                  }

                  vnode.style.left = left + 'px';
                  let maxscroll = (document.getElementById('canvas').offsetWidth-document.getElementById('content').offsetWidth )+ 30;
                  let scrollLeft = maxscroll * ((left-18)/(maxX-18));
                  document.getElementById('content').scrollLeft = document.getElementById('xZhou').scrollLeft = scrollLeft;
                }


              }else{
                if (event.clientX < mouseX-50 ||  event.clientX > mouseX+50) {
                  dragflag = false;
                  return
                }
                if(dragflag) {
                  // 获取滑块在页面中距Y轴的最小、最大 位置
                  let minY = 18;
                  let maxY =vnode.parentNode.offsetHeight - 8 - 50;
                  if (top <= minY) {
                    top = minY
                  } else if (top >= maxY) {
                    top = maxY
                  }

                  vnode.style.top = top + 'px';
                  let maxscroll = (document.getElementById('canvas').offsetHeight - document.getElementById('content').offsetHeight) + 30;
                  let scrollTop = maxscroll * ((top - 18) / (maxY - 18));
                  document.getElementById('content').scrollTop = document.getElementById('yZhou').scrollTop = scrollTop;
                }

              }


            });
            document.onmouseup = ((event) => {
              dragflag = false;
              document.onmousemove = document.onmouseup = null
            })
          })
        }
      }
    },
      watch:{
          idno(val, oldVal){
              console.log('val',val,'old,',oldVal);
              this.cid =val;
          }
      },
    mounted() {
        window.onresize = (() => {
            this.rulertop =  window.pageYOffset ;
            this.rulerleft =  window.pageYOffset ;
            console.log(document.getElementById('content').offsetTop,
            document.documentElement.scrollTop , window.pageYOffset );

        });
      let that = this;

      on(document.getElementById('content'), 'mousewheel', this.show);  //监听鼠标滚动控制刻度滚动
      on(document.getElementById('content'), 'scroll', this.show);
      on(document.getElementById('yZhou'), 'mousewheel', this.yshow);
      on(document.getElementById('yZhou'), 'scroll', this.yshow);
      on(document.getElementById('xZhou'), 'mousewheel', this.yshow);
      on(document.getElementById('xZhou'), 'scroll', this.yshow);

    //  on(document.getElementById('scrollx'), 'mousemove', this.xmousemove);


      let keyCode = null;
      document.onkeydown = function(e) {
        console.log('keyCode:',window.event.keyCode);
        let keyCode = window.event.keyCode;
        if(event.shiftKey && window.event.keyCode===107){                                                               //shift + '+'
          that.ChangeZoom(1)
        }else if(event.shiftKey && window.event.keyCode===109){                                                         //sheft + '-'
          that.ChangeZoom(0)
        }

        if(keyCode===46){                                                                                               //Delete
            let deleteIDS = that.removeCurrentObj();
            //console.log(deleteIDS);
        }
        if(keyCode===37){                                                                                               // ←
            that.getEditObj().left = parseInt(that.getEditObj().left - 1);
            that.getEditObj().setCoords();
            that.canvas.requestRenderAll();
            that.canvas.renderAll();
        }
          if(keyCode===38){                                                                                             // ↑
              that.getEditObj().top = parseInt(that.getEditObj().top - 1);
              that.getEditObj().setCoords();
              that.canvas.requestRenderAll();
              that.canvas.renderAll();
          }
          if(keyCode===39){                                                                                             // →
              that.getEditObj().left = parseInt(that.getEditObj().left + 1);
              that.getEditObj().setCoords();
              that.canvas.requestRenderAll();
              that.canvas.renderAll();
          }
          if(keyCode===40){                                                                                             // ↓
              that.getEditObj().top = parseInt(that.getEditObj().top + 1);
              that.getEditObj().setCoords();
              that.canvas.requestRenderAll();
              that.canvas.renderAll();
          }
          if(event.ctrlKey && keyCode === 67){                                                                          // ctrl + C
              let copydata = that.copyData()
              document.getElementById('code').value = copydata;
              that.clipboard = copydata; //用来限制每个画布复制一次
              document.getElementById('code').select();
              document.execCommand('copy');
              document.getElementById('code').value = '';
          }
          if(event.ctrlKey && keyCode === 86){                                                                          // ctrl + V

          }
          if(event.shiftKey && keyCode === 68){                                                                          // Shift + D
              that.copypaste();
          }

      };

      document.onkeyup = function(e) {
        /*console.log(window.event);
        keyCode = null*/
      };



        document.addEventListener('paste', function (event) {
            var text = event.clipboardData.getData('Text');
            that.paste(text);
            event.clipboardData.setData('Text','');
            event.clipboardData.clearData('Text');
        });

      this.scaleCalc();    //标尺计算


      this.canvas = new fabric.Canvas('canvas', { preserveObjectStacking: true });
      let canvas = this.canvas;
      //console.log(canvas);

      fabric.Canvas.prototype.rotationCursor = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5NzBBQTBGQ0Y4ODcxMUVBQURGNkU5NzQ3OUY4RTA5NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5NzBBQTBGREY4ODcxMUVBQURGNkU5NzQ3OUY4RTA5NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjk3MEFBMEZBRjg4NzExRUFBREY2RTk3NDc5RjhFMDk2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3MEFBMEZCRjg4NzExRUFBREY2RTk3NDc5RjhFMDk2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+QUJwRwAAAytJREFUeNrsVk1oGkEUXqVIqCRIhVICEsSTkFuwEPDaWiQ9NaQx6VGRaqCHQATBEFMKKUoLos0h4LV4aWxCbyqhEbx4CJJCwJMJRKVWxJ/EkJ/X9yabZd2oay+hhX7wsbPz3sybmTfv21UAAHdXUHJ3iL8rmEKh0CHdyASyhAQRC8gQ0izyNyCD9Lw1GeWsFxFvdDoduN1uSCQSUCqVQIxCoQChUAjMZjM5B5DTw8PDEAwG6f3Trfl6BFEgQzMzM3BwcAByaDabYLPZYHR0FJLJJOu73sdgwd65XC44Pz8XJjw+PoZYLAZ+vx+8Xi/b6enpqWBvtVqwu7vL2u12myZpywZDOCcnJ6FarbKBV1dXEI1GwWg0gkqlIgc/0qtWq2FiYgI2NjagVqt17LRer5NfvW8wxH0E7O3tCQMXFxfJEEWakCqRrxr5lBaQyWQ6gjUaDXJoyAV7gYDLy0s2iJJPiaZFdDmBRyMjI7C5udk1h2hvygX7jGADTk5OgG4i9hlFditym6ef8tcL3S7IPUklPEawRjqd5orFIjXzfP08M5lM35aXl5l9dXV1amtri8tms5xU8s7Ozuix3rfOEL8QbGWBQIDVjsj2FSGsnNrUh3yOnJLwSbdbLt3ZT8QDxM2uiiIbXR7xC8fncpvf+cOhoaGywWDgsNjpfRxtP/rJVZEPwlFAeohs67hbLpVKMVJbclSvPR4Pt7+/z62trbF3uWP8gmDHdHh4CBqNhjo1Ivs0MslzWtSvo8uEC2VjMd/UmZa7ja8QcHFxwQYtLS1R50cZ/SRpC66srAj59Pl8ZPANoiDfEYLszM3NUecHpFbiRykYR0ZI2kiuCEdHR6DX68lBP0gwm8ViYZJDIP1bWFgArVZ7o+x2pEupVMLY2BhEIhEmaQQSg/n5efLzdj2FHkfzfnZ2FiqVinA0+XyelYPdbgfaCWliuVzuUA2n00mDwz2PvE8u3mKBQzwel/3E7OzsAJ2GuC7/KBgf0IKMW61WCIfDkMvlmMiiQrCvApYAOBwO9tVGv5f95pINJtHEMDJHak6KhKwiU0gH3chB5lH8/5X754L9FmAAxKqp09gZRrsAAAAASUVORK5CYII=) 12 12, auto";
      fabric.Object.prototype.originX = 'center';  //设置中心为左上角
      fabric.Object.prototype.originY = 'center';   //设置中心为左上角

      this.initBgRect();
     // canvas.backgroundColor = '#ffffff';
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

      let Top = 0; //用作按住shift时,取横坐标
      let Left = 0;//用作按住shift时,取纵坐标
        let Direction = null;
      this.canvas.controlsAboveOverlay = false;
      this.canvas.skipOffscreen = true;
      this.canvas.preserveObjectStacking = true;
      this.canvas.on('selection:created', function (options) {
        //  console.log('selection',1);
        //  console.log('selection',options.target);

        that.$emit('selection:created', options);
          Top = options.target.top;
          Left = options.target.left;

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

        console.log('dblclick',options);
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
        //  console.log('moved',3);
        that.$emit('object:moved', options);

          Top = options.target.top;
          Left = options.target.left;
          Direction = null;
      });
      this.canvas.on('object:modified', function (options) {
        that.$emit('object:modified', options);
            //矩形 等元素边框不变形计算宽高，缩放比例为1，宽高取整
          if(!options.target._objects){
              options.target.set('left',  parseInt(options.target.left));
              options.target.set('top',  parseInt(options.target.top));

              options.target.set('width',  parseInt(options.target.width * options.target.scaleX));
              options.target.set('height',  parseInt(options.target.height * options.target.scaleY));
              options.target.set('scaleX',  1);
              options.target.set('scaleY',  1);

              options.target.set('angle',  parseInt(options.target.angle));
          }
          Top = options.target.top;
          Left = options.target.left;
          Direction = null;

      });
      this.canvas.on('object:rotating', function (options) {
        that.$emit('object:rotating', options);

      });
      this.canvas.on('object:scaling', function (options) {
        that.$emit('object:scaling', options);
      });
      this.canvas.on('object:scaled', function (options) {
        that.$emit('object:scaled', options);
        if(options.target._objects){
            //以下为了放大缩小时边框不变形
            let ids = [];
            let _objects = options.target._objects;
            that.discardActive();
            _objects.forEach((_obj)=>{
                ids.push(_obj.id);
                _obj.set('width',  parseInt(_obj.width * _obj.scaleX));
                _obj.set('height',  parseInt(_obj.height * _obj.scaleY));
                _obj.set('scaleX',  1);
                _obj.set('scaleY',  1);
            });
            that.setActiveObjs(ids);
        }

      });
      this.canvas.on('object:selected', function (options) {
         //  console.log('selected',options.target);
          that.$emit('object:selected', options);

      });
      this.canvas.on('object:moving', function (options) {
        //  console.log('moving',2,Top,Left);
        that.$emit('object:moving', options);

        //矩形 等元素边框不变形计算宽高，缩放比例为1，宽高取整
          if(!options.target._objects) {
              if (options.transform.shiftKey) {
                  if (Direction === 'x' || Math.abs(options.target.left - Left) > Math.abs(options.target.top - Top)) {
                      if (Math.abs(options.target.left - Left) > 20) {
                          Direction = 'x';
                      }
                      options.target.set('top', Top);
                  } else if (Direction === 'y' || Math.abs(options.target.left - Left) < Math.abs(options.target.top - Top)) {
                      if (Math.abs(options.target.top - Top) > 20) {
                          Direction = 'y';
                      }
                      options.target.set('left', Left);
                  }
              }
          }else{
              if (options.transform.altKey) {
                  if (Direction === 'x' || Math.abs(options.target.left - Left) > Math.abs(options.target.top - Top)) {
                      if (Math.abs(options.target.left - Left) > 20) {
                          Direction = 'x';
                      }
                      options.target.set('top', Top);
                  } else if (Direction === 'y' || Math.abs(options.target.left - Left) < Math.abs(options.target.top - Top)) {
                      if (Math.abs(options.target.top - Top) > 20) {
                          Direction = 'y';
                      }
                      options.target.set('left', Left);
                  }
              }
          }

      });
      this.canvas.on('selection:updated', function (options) {
        that.$emit('selection:updated', options);

        console.log('000   selection:updated')
      });
      this.canvas.on('selection:changed', function (options) {
        that.$emit('selection:changed', options);

          console.log('111   selection:changed')
      });
      this.canvas.on('selection:cleared', function (options) {
        that.$emit('selection:cleared', options);

          console.log('222  selection:cleared')
      });
      this.canvas.on('before:selection:cleared', function (options) {
        that.$emit('before:selection:cleared', options);

          console.log('333  before:selection:cleared')
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
    methods:{
        //右键事件
        showMenu () {
            var canvas = this.canvas;

            var x = event.clientX;
            var y = event.clientY;
            var objects = canvas.getObjects();
            for (var i = objects.length - 1; i >= 0; i--) {
                var object = objects[i];
                //console.log(object.left,canvas.containsPoint(event, object));
                if (canvas.containsPoint(event, object)) {
                    this.setActiveObject(object);
                    this.contextMenuData.axis = {x, y};
                    event.preventDefault();

                    return;  //为了右击时最上面的被选择
                }
            }

        },
        /*右键事件
        * ----------------------------------------------------------------
        * 标尺事件
        * */

      //标尺显示与否
      returnXYshow(b){
        if(b===true){
          return 'visible';
        }else{
          return 'hidden';
        }
      },
      //标尺显示与否 判断画布坐标
      returnXYshowcanvas(b1,b2){
       // console.log(b1===true && b2===true);
        if(b1===true && b2===true){
          return 18;
        }else{
          return 0;
        }
      },
      //监听内容区，修改标尺滚动条
      show(e){
        document.getElementById('yZhou').scrollTop = document.getElementById('content').scrollTop;
        document.getElementById('xZhou').scrollLeft = document.getElementById('content').scrollLeft;

        if(this.showRuler[1]?(this.height+18)>this.boxHeight:this.height>this.boxHeight){
          let scrollTop = document.getElementById('content').scrollTop;
          let maxY = document.getElementById('scrolly').parentNode.offsetHeight - 8 - 50 - 18;
          let maxscroll = (document.getElementById('canvas').offsetHeight-document.getElementById('content').offsetHeight )+30;
          let Top = (scrollTop * maxY)/maxscroll +18;
          document.getElementById('scrolly').style.top = Top +'px';
        }

        if(this.showRuler[0]?(this.width+18)>this.boxWidth:this.width>this.boxWidth){
          let scrollLeft = document.getElementById('content').scrollLeft;
          let maxX = document.getElementById('scrollx').parentNode.offsetWidth - 8 - 50 - 18;
          let maxscrollx = (document.getElementById('canvas').offsetWidth-document.getElementById('content').offsetWidth )+30;
          let Left = (scrollLeft * maxX)/maxscrollx +18;
          document.getElementById('scrollx').style.left = Left +'px';
        }

      },
      //监听标尺滚动，修改内容区
      yshow(e){
        document.getElementById('content').scrollTop = document.getElementById('yZhou').scrollTop;
        document.getElementById('content').scrollLeft = document.getElementById('xZhou').scrollLeft;
      },
      // 计算刻度
      scaleCalc () {
        let w = this.width>this.boxWidth?this.width:this.boxWidth;
        let h = this.height>this.boxHeight?this.height:this.boxWidth;

        this.xScale = this.getCalc(this.xScale, w*this.canvasZoom,'x');
        this.yScale = this.getCalc(this.yScale, h*this.canvasZoom,'y');
       // console.log(this.xScale,);
      },
      // 获取刻度方法
      getCalc (array,length, direction) {
        //console.log('间隔：',this.stepLength);
        array = [];
        if(direction ==='x'){
          for (let i = this.xLeft; i < length * this.stepLength / 50; i += this.stepLength) {
            if (i % this.stepLength=== 0) {
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

      //  console.log('new',direction,JSON.stringify(array));
        return array;

      },
      /*
      * 标尺函数
      * ------------------------------------------------------------
      * 画布函数
      * */


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
      //设置多个元素为活跃元素  --- id的集合
      setActiveObjs(ids){
          let objs = [];
          ids.forEach((id)=>{
              let objects = this.canvas.getObjects();
              objects.forEach((obj)=>{
                  if(obj.id===id){
                      objs.push(obj);
                  }
              })
          });
          var sel = new fabric.ActiveSelection(objs, {
              canvas: this.canvas,
          });
          this.canvas.setActiveObject(sel);
          this.canvas.requestRenderAll();
          this.canvas.renderAll();
      },
        //设置多个元素为活跃元素  --- objects对象集合
        setActiveObjects(objs){
            var sel = new fabric.ActiveSelection(objs, {
                canvas: this.canvas,
            });
            this.canvas.setActiveObject(sel);
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },

      //单个删除 多个删除 不支持组合删除 ----delete快捷键 删除的
      removeCurrentObj () {
        let obj = this.canvas.getActiveObject();
        let deleteIds = [];
        if(obj._objects){
          this.canvas.discardActiveObject();
          for(var i in obj._objects){
            deleteIds.push(obj._objects[i].id);
            this.canvas.remove(obj._objects[i]);
          }
        }else{
          deleteIds.push(obj.id);
          this.canvas.remove(obj);
        }
        this.canvas.renderAll();
        return deleteIds;
      },

      //删除当前活跃元素 - 右键菜单调用该方法
      removeEditObj(){
        let obj = this.canvas.getActiveObject();
        this.canvas.remove(obj);
      },
      //删除指定元素
      removeObj(obj){
        this.canvas.remove(obj);
        this.canvas.renderAll();
      },
      //新增指定元素
      addObj(obj){
        this.canvas.add(obj);
        this.canvas.renderAll();
      },
      //设置整体缩放比
      setZoom(n){
        this.canvasZoom = n;
        this.canvas.setWidth(this.width * this.canvasZoom);
        this.canvas.setHeight(this.height * this.canvasZoom);
        this.canvas.setZoom(n);
        this.canvas.renderAll();
      },
      //快捷键缩放 比例尺计算缩放
      ChangeZoom(n){
        this.canvasZoom = this.canvas.getZoom();
        let w = this.width>this.boxWidth?this.width:this.boxWidth;
        let h = this.height>this.boxHeight?this.height:this.boxWidth;

        if(n===1){     //增加
          this.canvasZoom = this.canvasZoom + 0.1;
          this.canvas.setWidth(w * this.canvasZoom);
          this.canvas.setHeight(h * this.canvasZoom);
          this.canvas.setZoom(this.canvasZoom);
          this.canvas.renderAll();
        }else if(n===0){  //减小

          if(w * (this.canvasZoom- 0.1) < this.boxWidth || h * (this.canvasZoom- 0.1) < this.boxHeight){
            return;
          }
          this.canvasZoom = this.canvasZoom - 0.1;
          this.canvas.setWidth(w * this.canvasZoom);
          this.canvas.setHeight(h * this.canvasZoom);
          this.canvas.setZoom(this.canvasZoom);
          this.canvas.renderAll();
        }
      },
      //设置画布背景颜色
      setbackground(color){
        this.canvas.backgroundColor = color;
        this.canvas.renderAll();
      },

      //取消所有活跃元素的选择 ---取消选择 （单个或多个）
      discardActive () {
        this.canvas.discardActiveObject();
        this.canvas.requestRenderAll();
        this.canvas.renderAll();
      },
      //层级移动
      moveToshow (obj,index) {
        // let obj = this.canvas.getActiveObject();
        this.canvas.moveTo(obj,index);
        this.canvas.requestRenderAll();
        this.canvas.renderAll();
      },

      //模板设置宽高
      setWidth(width){
        this.canvas.setWidth(width);
      },
      //模板设置宽高
      setHeight(height){
        this.canvas.setHeight(height);
      },
      //模板设置显示
      setShow(id){
         let objects = this.canvas.getObjects();
         for(let i in objects){
           if(objects[i].id === id){
             objects[i].set('selectable',true);
             objects[i].set('visible',true);
             objects[i].set('opacity',1);
             this.canvas.requestRenderAll();
             this.canvas.renderAll();
           }
         }
      },
      //模板设置隐藏
      setHidden(id){
        let objects = this.canvas.getObjects();
        for(let i in objects){
          if(objects[i].id === id){
            objects[i].set('selectable',false);
            objects[i].set('visible',false);
            objects[i].set('opacity',0);
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
          }
        }
      },
      //禁止拖拽选择和多选
      setNomove(){
        this.canvas.selection = false;
        this.canvas.renderAll();
      },
      //组件修改名字
      rename(id,name){
        let objects = this.canvas.getObjects();
        for(let i in objects){
          if(objects[i].id === id){
            objects[i].set('name',name);
            this.canvas.requestRenderAll();
          }
        }
      },
        // 设置层级(对焦点活跃元素才可操作) - 右键菜单中调用了这几个方法
        //下移一层
        toNextLayer () {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }
            obj.sendBackwards(true);
            this.canvas.renderTop();
            this.canvas.renderAll();
        },
        //置于底层
        toBottomLayer () {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }
            obj.sendToBack();
            this.canvas.renderTop();
            this.canvas.renderAll();
        },
        //上移一层
        toLastLayer () {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }
            obj.bringForward(true);
            this.canvas.renderTop();
            this.canvas.renderAll();
        },
        //置于顶层
        toTopLayer () {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }
            obj.bringToFront();
            this.canvas.renderTop();
            this.canvas.renderAll();
        },
        //复制
        copyData(){
            let clipboard =  this.canvas.getActiveObject();
            if(clipboard==undefined || clipboard==null){
                return;
            }
            if(!clipboard._objects){
                return '#ZKONG#'+ escape(JSON.stringify(clipboard));
            }else{
                let _objects = JSON.parse(JSON.stringify(clipboard._objects));
                let newobjects = []
                _objects.map((_obj)=>{
                   // console.log(clipboard.width,clipboard.height,'|',clipboard.left,clipboard.top,'|', _obj.left, _obj.top);
                    _obj.top =   clipboard.top + _obj.top;
                    _obj.left =  clipboard.left + _obj.left;
                    newobjects.push(_obj);
                });
                return '#ZKONG#'+ escape(JSON.stringify(newobjects));
            }
        },
        //粘贴
        paste(text){
            if(this.clipboard==null){ //剪切板清除不掉，所以画布只可粘贴一次限制
                return;
            }
            this.canvas.discardActiveObject();
            if(text.substring(0,7)!=='#ZKONG#'){
                return;
            }
            let _clipboard = JSON.parse(unescape(text.substring(7,text.length)));
            if(_clipboard instanceof Array){
                let canvaobjs = [];
                /*_clipboard.forEach((object)=>{
                    object.top = object.top+10;
                    object.left = object.left+10;
                    let canvaobj = this.addObject(object);
                    canvaobjs.push(canvaobj);
                });*/
                for(var i in _clipboard){
                    this.cid = this.cid + 1;
                    let object = _clipboard[i];
                    object.id = this.cid;
                    object.top = object.top+10;
                    object.left = object.left+10;
                    let canvaobj = this.addObject(object);
                    canvaobjs.push(canvaobj);
                    this.$emit('idAdd',1);
                }
                var sel = new fabric.ActiveSelection(canvaobjs, {
                    canvas: this.canvas,
                });
                this.canvas.setActiveObject(sel);
            }else{
                this.cid = this.cid + 1;
                let canvaobj;
                _clipboard.id = this.cid;
                _clipboard.top = _clipboard.top + 10;
                _clipboard.left = _clipboard.left + 10;
                canvaobj = this.addObject(_clipboard);
                this.canvas.setActiveObject(canvaobj);
                this.$emit('idAdd');
            }
            this.clipboard = null;
            this.canvas.requestRenderAll();
        },
        //复制粘贴操作（不用剪切板）
        copypaste(){
            let copydata = this.copyData();
            this.clipboard = copydata; //仅本画布复制保存
            this.paste(copydata);
        },
        //根据数据创建组件
        addObject(obj){
          switch(obj.isType){
              case 'Rect':
                  return this.createRect(obj);
                  break;
              case 'Text':
                  break;

          }
        },
        initBgRect(options){
          options = Object.assign({ width: this.width, height: this.height, left: 0, top: 0,  padding: 0, angle: 0, scaleX: 1,  scaleY: 1, }, options);
          let rect = new fabric.Rect({
            ...options,
            name:'background',
            component:"bg",
            isType:'Rect',
            isDiff: 'none',
            selectable: false,
            visible: true,
            fill: options.fill?options.fill:'#fff',
            fillColor: options.fillColor?options.fillColor:'#fff',

            flipX: false,
            flipY: false,
            originX: 'left',
            originY: 'top',
            stopContextMenu: true,                            //禁掉鼠标右键默认事件
          });
          this.canvas.add(rect);
          this.canvas.renderAll();
        },




      /**
       borderDashArray:[8,2],                            //  水印框虚线边
       borderColor: '#999',                              //  描边颜色
       cornerColor: '#999',                              //  边角颜色
       cornerStrokeColor: '#999',                        //  边角描边颜色
       cornerFillColor: '#eee',                          //  边角描边颜色
       centeredRotation:false,                           //  旋转中心默认左上角
       lockScalingFlip: true,                            // 禁止缩放时翻转
       rotatingPointOffset: 20,                          // 旋转位置
       selectionColor:        'rgba(0,0,0,0.1)' ,        // 拖拽选择框样式
       selectionBorderColor:   'rgba(0, 0, 0, 0.4)',     // 拖拽选择框样式修改
       * */

      /**
       * 创建矩形、 圆角矩形 、平行四边形
       * @options {
       *     id, width, height, left, top, padding, angle, scaleX,  scaleY, selectable, visible,   与原数据同名
       *     fillColor，backgroundColor, stroke, strokeWidth, strokeDashArray,           原数据名改造
       *     rx, ry, skewX,    影响圆角和形状
       * }
       * */
      createRect (options) {
       //   console.log('create rect',JSON.stringify(options));
        options = Object.assign({ width: 50, height: 30, left: 50, top: 50,  padding: 0, angle: 0, scaleX: 1,  scaleY: 1, }, options);
        let rect = new fabric.Rect({
          ...options,
            id:options.id,
          name:options.name?options.name:'Rect',
          component:"component",
          isType:'Rect',
          isDiff: 'static',
          selectable: options.selectable!==false ? true : options.selectable,                 //元素是否可选中
          visible: options.visible!==false ? true : options.visible,                          //元素是否可见
          fill: options.fill?options.fill:'#000',                                   // 填充的颜色（矩形）
          fillColor: options.fillColor?options.fillColor:'#000',                              // 填充的颜色

          backgroundColor: options.backgroundColor?options.backgroundColor:'rgba(0,0,0,0)',   // 边框填充的颜色
          stroke: options.stroke?options.stroke:'rgba(0,0,0,0)',                  // 边框颜色
          strokeWidth: options.strokeWidth?options.strokeWidth:0,                           // 边框宽度
          strokeDashArray:options.strokeDashArray?options.strokeDashArray:[0,0],                    // 边框样式 虚线 [5,1]     直线[0,0]

          minScaleLimit: 0.0001,                            //  最小限制

          flipX: false,
          flipY: false,
          originX: 'left',
          originY: 'top',

          stopContextMenu: true,                            //禁掉鼠标右键默认事件
        });
        rect.setCoords();
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
  }
</script>

<style scoped lang="scss">
  .bigbox{
      position:relative;
      /*border: 1px solid #ddd;*/
      /*margin:50px auto;*/
      overflow: hidden;
  }
  .content{
    position:relative;
    overflow: auto;
    background: url("../../../static/images/psbg.png") repeat;
    /*background: #f1f1f1;*/
  }
  .x-line{
    width: 100%;
    height: 18px;
    left: 18px;
    opacity: 0.6;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAMAAAAuTX21AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRFMzMzAAAA////BqjYlAAAACNJREFUeNpiYCAdMDKRCka1jGoBA2JZZGshiaCXFpIBQIABAAplBkCmQpujAAAAAElFTkSuQmCC);
    border-right:1px dashed #000;
  }
  .y-line{
    width: 18px;
    height: 100%;
    top: 18px;
    opacity: 0.6;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAyCAMAAABmvHtTAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAAlQTFRFMzMzAAAA////BqjYlAAAACBJREFUeNpiYGBEBwwMTGiAakI0NX7U9aOuHyGuBwgwAH6bBkAR6jkzAAAAAElFTkSuQmCC);

    border-bottom:1px dashed #000;
  }
  .number{
    position: absolute;
    font: 10px/1 Arial, sans-serif;
    color: #333;
    cursor: default;
  }
  .x-line .number{
    top: 1px;
  }
  .y-line .number{
    width: 8px;
    left: 3px;
    word-wrap: break-word;
  }

  .xZhou{
    position: absolute;
    margin-left:18px;
    z-index: 2;
   /* width: 572px;*/
    overflow-x: scroll;
    height: 18px;
    -moz-user-select:none; /*火狐*/
    -webkit-user-select:none; /*webkit浏览器*/
    -ms-user-select:none; /*IE10*/
    -khtml-user-select:none; /*早期浏览器*/
    user-select:none;
  }
  .boxblock{
    position: absolute;
    z-index:2;
    width: 18px;
    height: 18px;
    background: #F5F5F5;
  }
  .yZhou{
    position: absolute;
    margin-top:18px;
    z-index: 2;
    width: 18px;
    overflow-y: scroll;
   /* height: 572px;*/
    -moz-user-select:none; /*火狐*/
    -webkit-user-select:none; /*webkit浏览器*/
    -ms-user-select:none; /*IE10*/
    -khtml-user-select:none; /*早期浏览器*/
    user-select:none;
  }
  .xZhou::-webkit-scrollbar ,.yZhou::-webkit-scrollbar{
    display:none;
  }

  .content::-webkit-scrollbar{
    display: none;
  }
  .scrollx{
    position: absolute;
    z-index: 2;
    width: 10px;
    margin-left:992px;
    height: 500px;
    /*background:rgba(0,0,0,0.1);*/
    i{
      position: absolute;
      cursor: pointer;
      z-index: 99999;
      top:19px;
      right: 1px;
      width: 8px;
      height: 50px;
      background: rgba(0,0,0,0.2);
      opacity: 0.8;
      border-radius: 100px;
      -moz-user-select:none; /*火狐*/
      -webkit-user-select:none; /*webkit浏览器*/
      -ms-user-select:none; /*IE10*/
      -khtml-user-select:none; /*早期浏览器*/
      user-select:none;
      &:hover{
        opacity: 1;
      }
    }
  }

  .scrolly{
    position: absolute;
    z-index: 2;
    height: 10px;
    margin-top:492px;
    width: 1000px;
  /*  background:rgba(0,0,0,0.1);*/
    i{
      position: absolute;
      cursor: pointer;
      z-index: 99999;
      bottom:1px;
      left: 19px;
      width: 50px;
      height: 8px;
      background: rgba(0,0,0,0.2);
      opacity: 0.8;
      border-radius: 100px;
      -moz-user-select:none; /*火狐*/
      -webkit-user-select:none; /*webkit浏览器*/
      -ms-user-select:none; /*IE10*/
      -khtml-user-select:none; /*早期浏览器*/
      user-select:none;
      &:hover{
        opacity: 1;
      }
    }

  }


  .title{
    position: fixed;
    top:20px;
    left:20px;
    z-index: 9999999999;
  }
</style>
