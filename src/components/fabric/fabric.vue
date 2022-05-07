<template>
  <div class="bigbox"  @contextmenu="showMenu"><!-- :style="'width: '+ boxWidth+'px;height:'+boxHeight+'px;' "-->
      <!-- -9999999999-->
      <div style="position: fixed; top: -9999999999999999999px; left:800px; z-index:999999;">
          <img id="barcode" />
          <div id="barbox"></div>
          <div  style="position: fixed; top: -9999999999999999999px; left:800px; z-index:999999;" id="datamatix"></div>
          <img id="qrcode" :src="qrcodeImg" alt="" class="qrcodeImg">
      </div>
      <input type="text" id="code" style="position:fixed; top:-1000000px; z-index:9999;">
      <canvas id="canvas" width="800" height="400"></canvas>  <!-- :width="width>boxWidth?width:boxWidth" :height="height>boxHeight?height:boxHeight"-->

      <!--鼠标右键-->
     <vue-context-menu :contextMenuData="contextMenuData"
                       @toTopLayer="toTopLayer" @toLastLayer="toLastLayer" @toNextLayer="toNextLayer" @toBottomLayer="toBottomLayer"
                       @removeEditObj="removeEditObj" @copypaste="copypaste">
     </vue-context-menu>

  </div>

</template>

<script>
    import html2canvas from 'html2canvas'
  import { on, off } from '../../examples/event'   //时间监听
  import Utils from '../../utils/utils';   //事件注册
  import initAligningGuidelines  from '../../utils/guidelines';  //组件间对齐线
  import vueContextMenu from '../../examples/contextmenu'   //右键菜单


  export default {
    name: 'FabricCanvas',
    components:{vueContextMenu,html2canvas},
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
        },
        showMouseRight:{
          type:Boolean,
          default:true,
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
        xLeft:-200,
        yTop:-100,
        translateX:-18,
        translateY:-18,
        stepLength:this.stepLengthp,
        showXzhou:this.showRuler[0],
        showYzhou:this.showRuler[1],
        rulertop:0,
        rulerleft:0,

        scrollyH:100, //纵向滚动条的高度
        scrollxW:50, //横向滚动条的宽度

       // showMouseRight:true,
        contextMenuData: {
              menuName: 'demo',
              axis: {
                  x: null,
                  y: null
              },
              menulists: [
                  /*{
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
                  },*/
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
          },

          //二维码
        qrcodeImg:'',   //二维码图片
        activecanvaobjs:[], //活跃元素组
        activeobj :{}, //活跃元素

          textareashow:false,
          textdata:'abcdefg',
          textlines:1,
          style:{
            id:0,
            top:0,
            left:0,
            width:200,
            height:60,
            fontSize: 20,
            textAlign:'left',
          },


          isMoveing:true, //抓手可移动画布 ，箭头不可移动画布
          panning: false,
          oldboxWidth:this.boxWidth,
          oldboxHeight:this.boxHeight,
          winboxwidth:this.boxWidth,
          winboxheight:this.boxHeight,
          cursor:0, //鼠标默认箭头

      }
    },
    directives: {
     /* drag: {
        inserted: function (el, binding, vnode) {

          //console.warn('x',this.scrollyH);
          vnode = vnode.elm;

          el.dragstart = ((event)=>{
           // console.log('drag 0');
            event.preventDefault();
            document.onmousemove = document.onmouseup = null
          });
          el.ondrag = ((event)=>{
          //  console.log('drag 1');
            event.preventDefault();
            document.onmousemove = document.onmouseup = null;
            return false;
          });

          el.onmousedown = ((event) => {
            let scrollH = event.target.offsetHeight;  //滚动条的高度
            let scrollW = event.target.offsetWidth;   //滚动条的宽度

            let dragflag = true;
            if (event.target.id !== "scrollx" && event.target.id !== "scrolly") {
              dragflag = false;
              return;
            }

           // console.log(scrollW,scrollH);

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
                if (event.clientY < mouseY- 60 ||  event.clientY > mouseY+ 60) {
                  dragflag = false;
                  return
                }
                if(dragflag){
                  // 获取滑块在页面中距X轴的最小、最大 位置
                  let minX = 18;
                  let maxX = vnode.parentNode.offsetWidth - 8 - scrollW;
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
                if (event.clientX < mouseX-60 ||  event.clientX > mouseX+60) {
                  dragflag = false;
                  return
                }
                if(dragflag) {
                  // 获取滑块在页面中距Y轴的最小、最大 位置
                  let minY = 18;
                  let maxY =vnode.parentNode.offsetHeight - 8 - scrollH;
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
      }*/
    },
    watch:{
      idno(val, oldVal){
         // console.log('val',val,'old,',oldVal);
          this.cid =val;
      },
      boxWidth(val,old){
          if(val!==old){
              this.winboxwidth = val;
          }

      },
      boxHeight(val,old){
          if(val!==old){
              this.winboxheight = val;
          }

      }
    },
    mounted() {
      this.canvas = new fabric.Canvas('canvas', { preserveObjectStacking: true });
      let canvas = this.canvas;
      let that = this;
      fabric.Canvas.prototype.rotationCursor = "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAbCAYAAACN1PRVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo5NzBBQTBGQ0Y4ODcxMUVBQURGNkU5NzQ3OUY4RTA5NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo5NzBBQTBGREY4ODcxMUVBQURGNkU5NzQ3OUY4RTA5NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjk3MEFBMEZBRjg4NzExRUFBREY2RTk3NDc5RjhFMDk2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjk3MEFBMEZCRjg4NzExRUFBREY2RTk3NDc5RjhFMDk2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+QUJwRwAAAytJREFUeNrsVk1oGkEUXqVIqCRIhVICEsSTkFuwEPDaWiQ9NaQx6VGRaqCHQATBEFMKKUoLos0h4LV4aWxCbyqhEbx4CJJCwJMJRKVWxJ/EkJ/X9yabZd2oay+hhX7wsbPz3sybmTfv21UAAHdXUHJ3iL8rmEKh0CHdyASyhAQRC8gQ0izyNyCD9Lw1GeWsFxFvdDoduN1uSCQSUCqVQIxCoQChUAjMZjM5B5DTw8PDEAwG6f3Trfl6BFEgQzMzM3BwcAByaDabYLPZYHR0FJLJJOu73sdgwd65XC44Pz8XJjw+PoZYLAZ+vx+8Xi/b6enpqWBvtVqwu7vL2u12myZpywZDOCcnJ6FarbKBV1dXEI1GwWg0gkqlIgc/0qtWq2FiYgI2NjagVqt17LRer5NfvW8wxH0E7O3tCQMXFxfJEEWakCqRrxr5lBaQyWQ6gjUaDXJoyAV7gYDLy0s2iJJPiaZFdDmBRyMjI7C5udk1h2hvygX7jGADTk5OgG4i9hlFditym6ef8tcL3S7IPUklPEawRjqd5orFIjXzfP08M5lM35aXl5l9dXV1amtri8tms5xU8s7Ozuix3rfOEL8QbGWBQIDVjsj2FSGsnNrUh3yOnJLwSbdbLt3ZT8QDxM2uiiIbXR7xC8fncpvf+cOhoaGywWDgsNjpfRxtP/rJVZEPwlFAeohs67hbLpVKMVJbclSvPR4Pt7+/z62trbF3uWP8gmDHdHh4CBqNhjo1Ivs0MslzWtSvo8uEC2VjMd/UmZa7ja8QcHFxwQYtLS1R50cZ/SRpC66srAj59Pl8ZPANoiDfEYLszM3NUecHpFbiRykYR0ZI2kiuCEdHR6DX68lBP0gwm8ViYZJDIP1bWFgArVZ7o+x2pEupVMLY2BhEIhEmaQQSg/n5efLzdj2FHkfzfnZ2FiqVinA0+XyelYPdbgfaCWliuVzuUA2n00mDwz2PvE8u3mKBQzwel/3E7OzsAJ2GuC7/KBgf0IKMW61WCIfDkMvlmMiiQrCvApYAOBwO9tVGv5f95pINJtHEMDJHak6KhKwiU0gH3chB5lH8/5X754L9FmAAxKqp09gZRrsAAAAASUVORK5CYII=) 12 12, auto";

      fabric.Object.prototype.originX = 'center';  //设置中心为左上角
      fabric.Object.prototype.originY = 'center';   //设置中心为左上角
            // canvas.backgroundColor = '#ffffff';

      canvas.controlsAboveOverlay = false;
      canvas.skipOffscreen = true;
      canvas.preserveObjectStacking = true;
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

        this.canvas.setWidth(this.boxWidth);
        this.canvas.setHeight(this.boxHeight);

        canvas.selection = true;  //不允许多选false;允许多选true
        canvas.selectionColor = 'rgba(0,98,178,0)';   //选择框样式定制
        canvas.selectionDashArray = [8,3];
        canvas.selectionBorderColor = 'rgba(0,98,178,1)';
        canvas.selectionLineWidth = 2;

        fabric.Object.prototype.borderColor = 'rgba(0,98,178,1)'; //元素框样式定制
        fabric.Object.prototype.borderDashArray = [5,3];
        fabric.Object.prototype.cornerColor = 'rgba(0,98,178,1)';
        fabric.Object.prototype.cornerStrokeColor = 'rgba(0,98,178,1)';
        fabric.Object.prototype.cornerDashArray  = [5,3];
        fabric.Object.prototype.hasControls = false;

        this.setCursor(2); //抓手



        let keyCode = null;
        document.onkeydown = function(e) {
            // console.log('keyCode:',window.event.keyCode);
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
                let objects = that.getObjectsNew();
                objects.forEach((obj,i)=>{
                    if(obj.id===that.getEditObj().id && obj.isType ==='TextRect-text'){
                        obj.left = parseInt(obj.left - 1);
                    }
                });
                that.$emit('canvasToData',that.getEditObj(),'左移-1 更新');

                that.getEditObj().setCoords();
                that.canvas.requestRenderAll();
                that.canvas.renderAll();
            }
            if(keyCode===38){                                                                                             // ↑
                that.getEditObj().top = parseInt(that.getEditObj().top - 1);
                let objects = that.getObjectsNew();
                objects.forEach((obj,i)=>{
                    if(obj.id===that.getEditObj().id && obj.isType ==='TextRect-text'){
                        obj.top = parseInt(obj.top - 1);
                    }
                });
                that.$emit('canvasToData',that.getEditObj(),'上移-1 更新');

                that.getEditObj().setCoords();
                that.canvas.requestRenderAll();
                that.canvas.renderAll();
            }
            if(keyCode===39){                                                                                             // →
                that.getEditObj().left = parseInt(that.getEditObj().left + 1);
                let objects = that.getObjectsNew();
                objects.forEach((obj,i)=>{
                    if(obj.id===that.getEditObj().id && obj.isType ==='TextRect-text'){
                        obj.left = parseInt(obj.left + 1);
                    }
                });
                that.$emit('canvasToData',that.getEditObj(),'右移+1 更新');

                that.getEditObj().setCoords();
                that.canvas.requestRenderAll();
                that.canvas.renderAll();
            }
            if(keyCode===40){                                                                                             // ↓
                that.getEditObj().top = parseInt(that.getEditObj().top + 1);
                let objects = that.getObjectsNew();
                objects.forEach((obj,i)=>{
                    if(obj.id===that.getEditObj().id && obj.isType ==='TextRect-text'){
                        obj.top = parseInt(obj.top + 1);
                    }
                });
                that.$emit('canvasToData',that.getEditObj(),'下移+1 更新');

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

        document.addEventListener('paste', function (event) {
            //console.warn(event);

            var text = event.clipboardData.getData('Text');
            if(text.substring(0,7)==='#ZKONG#'){
                that.paste(text);
                event.clipboardData.setData('Text','');
                event.clipboardData.clearData('Text');
            }


        });


      this.canvas.on('selection:created', function (options) {

         // console.log('selection:created+++++++++++++++',options);

        that.$emit('selection:created', options);
      });



      this.canvas.on('mouse:down', function (options) {
        //  console.log(that.isMoveing);
          if(that.isMoveing){ //是否拖拽移动
              this.panning = true;
              canvas.selection = false;
          }

          if(that.cursor === 4){ //点击放大
              var zoom = that.canvas.getZoom() +0.1;
              zoom = Math.max(0.1, zoom); //最小为原来的1/10
              zoom = Math.min(3, zoom); //最大是原来的3倍
              // console.log(event.pageX, event.pageY);
              var zoomPoint = new fabric.Point(event.pageX, event.pageY);
              that.canvasZoom = zoom;
              that.canvas.zoomToPoint(zoomPoint, zoom);
              that.$emit('changeZoomTo',zoom);
          }

          if(that.cursor === 5){ //点击缩小
              var zoom =  that.canvas.getZoom() -0.1;
              zoom = Math.max(0.1, zoom); //最小为原来的1/10
              zoom = Math.min(3, zoom); //最大是原来的3倍
              // console.log(event.pageX, event.pageY);
              var zoomPoint = new fabric.Point(event.pageX, event.pageY);
              that.canvasZoom = zoom;
              that.canvas.zoomToPoint(zoomPoint, zoom);
              that.$emit('changeZoomTo',zoom);
          }

        that.$emit('mouse:down', options);
      });
      this.canvas.on('mouse:up', function (options) {
         // console.log(that.isMoveing);
          if(that.isMoveing){ //是否拖拽移动
              this.panning = false;
              canvas.selection = true;
          }
        that.$emit('mouse:up', options);
      });
      this.canvas.on('mouse:move', function (e) {
        //  console.log(e.e.movementX, e.e.movementY)
          if (that.isMoveing && this.panning && e && e.e) {
              var delta = new fabric.Point(e.e.movementX, e.e.movementY);
            //  console.log(delta);
              canvas.relativePan(delta);


          }
        that.$emit('mouse:move', e);
      });
      this.canvas.on('mouse:dblclick', function (options) {
        that.$emit('mouse:dblclick', options);

      });
      this.canvas.on('mouse:over', function (options) {
          let bound = options.target;
          if(bound){
              bound.set('opacity',0.8);
          }

         if(options.target&& options.target.id ){
             canvas.contextContainer.strokeStyle = 'rgba(0,98,178,1)';
             canvas.contextContainer.lineWidth = 2;
             canvas.contextContainer.setLineDash([5, 3]);
             canvas.forEachObject(function(obj) {
                 if(obj&&obj.id!==undefined ){
                     if(obj.component=='component'&&obj.isType!=='TextRect-text' &&  options.target.id === obj.id){
                         //console.log(obj.isType);
                         var bound = obj.getBoundingRect();

                         canvas.contextContainer.strokeRect(
                             bound.left -1,
                             bound.top -1,
                             bound.width + 1,
                             bound.height + 1
                         );
                     }
                 }


             })
         }


         that.$emit('mouse:over', options);
      });
      this.canvas.on('mouse:out', function (options) {
          let bound = options.target;
          if(bound){
              bound.set('opacity',1);
          }
          that.canvas.renderAll();
        that.$emit('mouse:out', options);
      });
      this.canvas.on('object:added', function (options) {
        that.$emit('object:added', options);
      });
      this.canvas.on('object:removed', function (options) {
        that.$emit('object:removed', options);
      });

      this.canvas.on('object:modified', function (options) {
          /*let obj = options.target; //缩放、旋转不超出
          if(obj){
              let boundingRect = obj.getBoundingRect();
              if (boundingRect.left < -that.xLeft-1
                  || boundingRect.top < -that.yTop-1) {
                  obj.top = obj._stateProperties.top;
                  obj.left = obj._stateProperties.left;
                  obj.angle = obj._stateProperties.angle;
                  obj.scaleX = obj._stateProperties.scaleX;
                  obj.scaleY = obj._stateProperties.scaleY;
                  obj.setCoords();
                  obj.saveState();
              }else if(boundingRect.left + boundingRect.width > that.width-that.xLeft+1) {
                  obj.top = obj._stateProperties.top;
                  obj.left = obj._stateProperties.left - (boundingRect.left + boundingRect.width - (that.width-that.xLeft));
                  obj.angle = obj._stateProperties.angle;
                  obj.scaleX = obj._stateProperties.scaleX;
                  obj.scaleY = obj._stateProperties.scaleY;
                  obj.setCoords();
                  obj.saveState();
              }else if(boundingRect.top + boundingRect.height > that.height-that.yTop+1){
                  obj.top = obj._stateProperties.top - (boundingRect.top + boundingRect.height - (that.height-that.yTop));
                  obj.left = obj._stateProperties.left;
                  obj.angle = obj._stateProperties.angle;
                  obj.scaleX = obj._stateProperties.scaleX;
                  obj.scaleY = obj._stateProperties.scaleY;
                  obj.setCoords();
                  obj.saveState();
              }else{
                  obj.saveState();
              }
          }*/

        that.$emit('object:modified', options);
      });
      this.canvas.on('object:rotating', function (options) {

        that.$emit('object:rotating', options);
      });

        this.canvas.on('object:rotated', function (options) {
            var obj = options.target;  //移动不超出


            obj.set({
                angle:parseInt(obj.angle), //角度旋转只取整数
            });
            that.$emit('object:rotated', options);
        });
      this.canvas.on('object:scaling', function (options) {
          //移动不超出 start
          /*var obj = options.target;
          if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
              return;
          }
          obj.setCoords();
          let zoom = canvas.getZoom();
          let bg = that.returnbg();
          if(obj.getBoundingRect().top < bg.top  ){
              console.log(obj.isType);
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode'){
                  if(obj.angle!==0) {
                      /!*obj.set({
                          top: bg.top + (obj.top - obj.getBoundingRect().top),
                          height: obj.height,
                          scaleY:1,
                      });*!/
                  }else{
                      obj.set({
                          top: bg.top ,
                          height: obj.aCoords.br.y - bg.top,
                          scaleY: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }
          if( obj.getBoundingRect().left < bg.left){
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode') {
                  if(obj.angle!==0) {
                      /!*obj.set({
                          left: bg.left + (obj.left - obj.getBoundingRect().left),
                          width: obj.width,
                          scaleX: 1,
                      });*!/
                  }else{
                      obj.set({
                          left: bg.left,
                          width: obj.aCoords.br.x - bg.left,
                          scaleX: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }
          if( obj.getBoundingRect().left + obj.getBoundingRect().width > bg.left + bg.width){
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode') {
                  if(obj.angle!==0){
                      /!*obj.set({
                          left : obj.left - (obj.getBoundingRect().left + obj.getBoundingRect().width -(bg.left + bg.width)),
                          width: obj.width,
                          scaleX: 1,
                      });*!/
                  }else{
                      obj.set({
                          width: bg.left + bg.width - obj.left,
                          scaleX: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }
          if( obj.getBoundingRect().top + obj.getBoundingRect().height > bg.top + bg.height){
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode') {
                  if(obj.angle!==0) {
                      /!*obj.set({
                          top: obj.top - (obj.getBoundingRect().top + obj.getBoundingRect().height - (bg.top + bg.height)),
                          height: obj.height,
                          scaleY: 1,
                      });*!/
                  }else{
                      obj.set({
                          height: bg.top + bg.height - obj.top,
                          scaleY: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }*/
          //移动不超出 end
        that.$emit('object:scaling', options);

      });
      this.canvas.on('object:scaled', function (options) {
          //移动不超出 start
        /*  var obj = options.target;
          let bg = that.returnbg();
          if(obj.getBoundingRect().top < bg.top  ){
              console.log(obj.isType);
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode'){
                  if(obj.angle!==0) {
                     /!* obj.set({
                          top: bg.top + (obj.top - obj.getBoundingRect().top),
                          height: obj.height,
                          scaleY:1,
                      });*!/
                  }else{
                      obj.set({
                          top: bg.top ,
                          height: obj.aCoords.br.y - bg.top,
                          scaleY: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }
          if( obj.getBoundingRect().left < bg.left){
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode') {
                  if(obj.angle!==0) {
                      /!*obj.set({
                          left: bg.left + (obj.left - obj.getBoundingRect().left),
                          width: obj.width,
                          scaleX: 1,
                      });*!/
                  }else{
                      obj.set({
                          left: bg.left,
                          width: obj.aCoords.br.x - bg.left,
                          scaleX: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }
          if( obj.getBoundingRect().left + obj.getBoundingRect().width > bg.left + bg.width){
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode') {
                  if(obj.angle!==0){
                      /!*obj.set({
                          left : obj.left - (obj.getBoundingRect().left + obj.getBoundingRect().width -(bg.left + bg.width)),
                          width: obj.width,
                          scaleX: 1,
                      });*!/
                  }else{
                      obj.set({
                          width: bg.left + bg.width - obj.left,
                          scaleX: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }
          if( obj.getBoundingRect().top + obj.getBoundingRect().height > bg.top + bg.height){
              if(obj.isType!=='Barcode'&& obj.isType!=='Qrcode') {
                  if(obj.angle!==0) {
                      /!*obj.set({
                          top: obj.top - (obj.getBoundingRect().top + obj.getBoundingRect().height - (bg.top + bg.height)),
                          height: obj.height,
                          scaleY: 1,
                      });*!/
                  }else{
                      obj.set({
                          height: bg.top + bg.height - obj.top,
                          scaleY: 1,
                      });
                  }
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }*/

          //移动不超出 end

        that.$emit('object:scaled', options);

          if(options.target.isType==='Qrcode'){  //二维码放大缩小时重新获取图片，二维码图片不失真
              options.target.set('width',  parseInt(options.target.width * options.target.scaleX));
              options.target.set('height',  parseInt(options.target.height * options.target.scaleY));
              options.target.set('scaleX',  1);
              options.target.set('scaleY',  1);
              that.changeQrcodeImage(options.target);
              that.setActiveObject(options.target);
          }

          if(options.target.isType==='Html'){  //二维码放大缩小时重新获取图片，二维码图片不失真
              options.target.set('width',  parseInt(options.target.width * options.target.scaleX));
              options.target.set('height',  parseInt(options.target.height * options.target.scaleY));
              options.target.set('scaleX',  1);
              options.target.set('scaleY',  1);
              that.setActiveObject(options.target);
          }
          //console.log(options.target.isType,options.target);
          if(options.target.isType==='Barcode'){  //条形码的位置显示
              options.target.set('height',  parseInt(options.target.height * options.target.scaleY));
              options.target.set('scaleY',  1);
              options.target.item(0).set('height',parseInt(options.target.height * options.target.scaleY));
              options.target.item(1).set('height',parseInt(options.target.height * options.target.scaleY));
              that.changeBarcodeImage(options.target);
          }
      });
      this.canvas.on('object:selected', function (options) {
          fabric.Object.prototype.hasControls = true;

          console.log('object:selected',options);
          that.$emit('object:selected', options);
      });
      this.canvas.on('object:moving', function (options) {


          if(options.target._objects){
              let objects = options.target._objects;
              let allobject = that.getObjectsNew();
              let includeText = [];
              objects.forEach((obj)=>{
                  if(obj.isType==='TextRect-text'){
                      includeText.push(obj.id);
                  }
              });
              objects.forEach((obj)=>{
                 // console.log(obj.left,obj.top)
                  if(obj.isType === 'TextRect' && includeText.indexOf(obj.id)===-1){
                      if(obj.isElasticSize===2){
                          const rectLeftTop = obj.getPointByOrigin('left', 'top');
                          /*obj.text.set('left', rectLeftTop.x - obj.text.offsetLeft );
                          obj.text.set('top', rectLeftTop.y - obj.text.offsetTop );*/
                          obj.text.set('left', options.target.left + obj.left - obj.text.offsetLeft);
                          obj.text.set('top', options.target.top + obj.top - obj.text.offsetTop);
                      }else{
                          const rectLeftTop = obj.getPointByOrigin('left', 'top');
                          const sin = Math.sin(fabric.util.degreesToRadians(obj.angle));
                          const cos = Math.cos(fabric.util.degreesToRadians(obj.angle));
                          const newTop = sin * obj.textOffsetLeft + cos * obj.textOffsetTop;
                          const newLeft = cos * obj.textOffsetLeft - sin * obj.textOffsetTop;
                          // console.log(obj.id,obj.isElasticSize,newTop,newLeft);
                          obj.text.set('left', options.target.left + obj.left );
                          obj.text.set('top', options.target.top + obj.top);
                          //console.log(obj.id,':',options.target.left,options.target.top,obj.left,obj.top);
                      }
                  }
              });
          }


          /*if(options.target._objects){
              //console.log(options.target._objects);

              options.target._objects.forEach((one)=>{
                  console.log(one.isType,one.id);
              });
          }*/

          //移动不超出 start
          var obj = options.target;
          if(obj.currentHeight > obj.canvas.height || obj.currentWidth > obj.canvas.width){
              return;
          }
          obj.setCoords();
          let zoom = canvas.getZoom();
          let bg = that.returnbg();
          //console.log('bg',bg.left,bg.top);
          let bfpoint = bg.calcCoords();
          let bgbound = bg.getBoundingRect();
          let objpoint = obj.calcCoords();

          if(obj.angle==0){
              if(obj.getBoundingRect().top < bfpoint.tl.y  ){
                  obj.set({
                      top : bg.top ,// +  (obj.top - obj.getBoundingRect().top)
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
              if( obj.getBoundingRect().left <  bfpoint.tl.x){
                  obj.set({
                      left : bg.left, // +  (obj.left - obj.getBoundingRect().left)
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
              if( objpoint.tl.x + obj.getBoundingRect().width >  bfpoint.tl.x + bgbound.width ){
                  obj.set({
                      left : bg.left + bg.width -obj.width*obj.scaleX    ,//obj.left - (objpoint.tl.x + obj.getBoundingRect().width -(bfpoint.tl.x + bgbound.width)),
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
              if( objpoint.tl.y + obj.getBoundingRect().height >   bfpoint.tl.y + bgbound.height){
                  obj.set({
                      top :   bg.top + bg.height -obj.height*obj.scaleY,// obj.top - (obj.getBoundingRect().top + obj.getBoundingRect().height -(bg.top + bg.height)),
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }

          }else{
              if(objpoint.tl.y < bfpoint.tl.y  ){
                  console.log( bfpoint.tl.y,bg.top)
                  obj.set({
                      top : bg.top ,// +  (obj.top - obj.getBoundingRect().top)
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
              if( objpoint.tl.x <  bfpoint.tl.x){
                  obj.set({
                      left : bg.left , // +  (obj.left - obj.getBoundingRect().left)
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
              if( objpoint.tl.x  >  bfpoint.tl.x + bgbound.width ){
                  obj.set({
                      left : bg.left + bg.width     ,//obj.left - (objpoint.tl.x + obj.getBoundingRect().width -(bfpoint.tl.x + bgbound.width)),
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
              if( objpoint.tl.y >   bfpoint.tl.y + bgbound.height){
                  obj.set({
                      top :   bg.top + bg.height ,// obj.top - (obj.getBoundingRect().top + obj.getBoundingRect().height -(bg.top + bg.height)),
                  });
                  obj.setCoords();
                  that.canvas.renderAll();
              }
          }



          /*if(obj.getBoundingRect().top < bg.getBoundingRect().top || obj.getBoundingRect().left < bg.getBoundingRect().left){
              console.log(obj.top,obj.getBoundingRect().top,bg.top);
              obj.top = bg.top ;//Math.max(obj.top, bg.getBoundingRect().top );  //+ (obj.top-(obj.getBoundingRect().top))
              obj.left = Math.max(obj.left, bg.getBoundingRect().left  );  //+ (obj.left-obj.getBoundingRect().left)
          }*/
         /* if(obj.getBoundingRect().top + obj.getBoundingRect().height  > that.height
              || obj.getBoundingRect().left + obj.getBoundingRect().width  > that.width){
              obj.top = Math.min(obj.top, that.height - that.yTop - obj.getBoundingRect().height/zoom + obj.top - obj.getBoundingRect().top/zoom);
              obj.left = Math.min(obj.left, that.width - that.xLeft - obj.getBoundingRect().width/zoom + obj.left - obj.getBoundingRect().left/zoom);
          }*/
          //移动不超出 end

          //console.log(options,options.e.shiftKey,options.e.ctrlKey);

          if(options.e.shiftKey){ //横向限位移动
              obj.top = options.transform.top;
          }
          if(options.e.ctrlKey){ //纵向限位移动
              obj.left = options.transform.left;
          }

        that.$emit('object:moving', options);
      });
        this.canvas.on('object:moved', function (options) {
            console.log('fabric,moved',options);
            if(options.target._objects){
                let objects = options.target._objects;
                let includeText = [];
                objects.forEach((obj)=>{
                    if(obj.isType==='TextRect-text'){
                        includeText.push(obj.id);
                    }
                });
                objects.forEach((obj)=>{
                    //console.log(obj.left,obj.top)
                    if(obj.isType === 'TextRect' && includeText.indexOf(obj.id)===-1){
                        if(obj.isElasticSize===2){
                            const rectLeftTop = obj.getPointByOrigin('left', 'top');
                            /*obj.text.set('left', rectLeftTop.x - obj.text.offsetLeft );
                            obj.text.set('top', rectLeftTop.y - obj.text.offsetTop );*/
                            obj.text.set('left', options.target.left + obj.left - obj.text.offsetLeft);
                            obj.text.set('top', options.target.top + obj.top - obj.text.offsetTop);
                        }else{
                            const rectLeftTop = obj.getPointByOrigin('left', 'top');
                            const sin = Math.sin(fabric.util.degreesToRadians(obj.angle));
                            const cos = Math.cos(fabric.util.degreesToRadians(obj.angle));
                            const newTop = sin * obj.textOffsetLeft + cos * obj.textOffsetTop;
                            const newLeft = cos * obj.textOffsetLeft - sin * obj.textOffsetTop;
                            // console.log(obj.id,obj.isElasticSize,newTop,newLeft);
                            obj.text.set('left', options.target.left + obj.left );
                            obj.text.set('top', options.target.top + obj.top);
                            //console.log(obj.id,':',options.target.left,options.target.top,obj.left,obj.top);
                        }
                    }
                });
            }

            that.$emit('object:moved', options);
        });
      this.canvas.on('selection:updated', function (options) {
        that.$emit('selection:updated', options);
      });
      this.canvas.on('selection:changed', function (options) {
        that.$emit('selection:changed', options);
      });
      this.canvas.on('selection:cleared', function (options) {
          fabric.Object.prototype.hasControls = false;
        that.$emit('selection:cleared', options);
      });
      this.canvas.on('before:selection:cleared', function (options) {
          fabric.Object.prototype.hasControls = true;
        that.$emit('before:selection:cleared', options);
      });

      this.canvas.on('text:changed', function(options) {
         // console.log('text:changed========',options)
          if(options.target.isType==='TextRectBox-text'){ //group文本输入的关键

            that.changeTextRectBoxContent(options.target.group);
           /* that.canvas.requestRenderAll();
            that.canvas.renderAll();*/
          }

        that.$emit('text:changed', options);
      });
      this.canvas.on('text:editing:entered',function(options){
          if(options.target.isType==='TextRectBox-text'){
              //console.log('text:editing:entered+++++++++++',options);
              options.target.group.selectable = false;
              options.target.group.item(0).evented = false;
              options.target.group.item(0).set({
                  backgroundColor:'#eee',
                  stroke:'#0062B2',
                  strokeWidth:2,
                  strokeDashArray:[5,2],
              });

              options.target.group.item(1).set({
                  'hasBorders':false,
                  top:-options.target.group.height/2,
                  left:-options.target.width/2,
              });
              options.target.group.item(1).setSelectionInBoundaries();
              options.target.group.item(1).selectionStart = options.target.group.item(1).selectionEnd = options.target.group.item(1).text.length-options.target.group.item(1).postfix.length ;
              options.target.group.item(1)._updateTextarea(); //设置完输入起止位再更新输入文本域
              that.changeTextRectBoxContent(options.target.group);
          }

        that.$emit('text:editing:entered', options);
      });

        this.canvas.on('text:editing:exited',(options)=>{
            if(options.target.isType==='TextRectBox-text'){

                console.log('text:editing:exited');

                options.target.group.setCoords();
                options.target.group.item(0).set({
                    backgroundColor:'',
                    stroke:options.target.group.stroke,
                    strokeWidth:options.target.group.strokeWidth,
                    strokeDashArray:options.target.group.strokeDashArray,
                });

                if(options.target.group.item(1).text.indexOf(options.target.group.prefix)>-1 && options.target.group.item(1).text.indexOf(options.target.group.postfix)>-1){
                    let content = options.target.group.item(1).text.substring(options.target.group.prefix.length,(options.target.group.item(1).text.length-options.target.group.postfix.length));
                    options.target.group.set({
                        content:content ,
                    });

                    let newtext = that.newtextStyleFormat( options.target.group.item(1),options.target.group.prefix + content + options.target.group.postfix);
                    options.target.group.item(1).set({
                        content:content ,
                        text:newtext,
                    });
                }else if(options.target.group.item(1).text.indexOf(options.target.group.prefix)>-1 && options.target.group.item(1).text.indexOf(options.target.group.postfix)==-1){
                    let content = options.target.group.item(1).text.substring(options.target.group.prefix.length,options.target.group.item(1).text.length);
                    options.target.group.set({
                        content:content ,
                    });

                    let newtext = that.newtextStyleFormat( options.target.group.item(1),options.target.group.prefix + content + options.target.group.postfix);
                    options.target.group.item(1).set({
                        content:content ,
                        text:newtext,
                    });
                }else if(options.target.group.item(1).text.indexOf(options.target.group.prefix)==-1 && options.target.group.item(1).text.indexOf(options.target.group.postfix)>-1){
                    let content = options.target.group.item(1).text.substring(0,(options.target.group.item(1).text.length-options.target.group.postfix.length));
                    options.target.group.set({
                        content:content ,
                    });

                    let newtext = that.newtextStyleFormat( options.target.group.item(1),options.target.group.prefix + content + options.target.group.postfix);
                    options.target.group.item(1).set({
                        content:content ,
                        text:newtext,
                    });
                }else{
                    options.target.group.set({
                        content:options.target.group.item(1).text ,
                    });

                    let newtext = that.newtextStyleFormat( options.target.group.item(1),options.target.group.prefix + options.target.group.item(1).text + options.target.group.postfix);
                    options.target.group.item(1).set({
                        content:options.target.group.item(1).text,
                        text:newtext,
                    });
                }





                options.target.group.item(1).evented = false;
                options.target.group.item(1).selectable = false;
                options.target.group.selectable = true;
               // console.log('text:editing:exited----------------',options)
                that.changeTextRectBoxContent(options.target.group);

            }
            that.$emit('text:editing:exited', options);
        })

      this.canvas.on('before:render'),function(options){
        that.$emit('before:render',options);
      };
      /*this.canvas.on('after:render'),function(options){
        that.$emit('after:render',options);
      };*/

        this.canvas.on('after:render', function(options) {
           // console.log('after:render')


             /*canvas.contextContainer.strokeStyle = '#eee';
             canvas.forEachObject(function(obj) {
                 console.log(obj);
                 if(obj.component=='component'&&obj.isType!=='TextRect-text'){
                     console.log(obj.isType);
                     var bound = obj.getBoundingRect();

                     canvas.contextContainer.strokeRect(
                         bound.left + 0.5,
                         bound.top + 0.5,
                         bound.width,
                         bound.height
                     );
                 }

             })*/

            that.$emit('after:render',options);
         });
         /*canvas.forEachObject(function(obj) {
             var setCoords = obj.setCoords.bind(obj);
             obj.on({
                 moving: setCoords,
                 scaling: setCoords,
                 rotating: setCoords
             });
         })*/
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

    this.canvas.on("mouse:wheel", function(e) {
        if(e.e.shiftKey){
          // console.warn(e.e.shiftKey,e.e.target.localName =='canvas');
            var zoom = (event.deltaY > 0 ? -0.1 : 0.1) + that.canvas.getZoom();
            zoom = Math.max(0.1, zoom); //最小为原来的1/10
            zoom = Math.min(5, zoom); //最大是原来的3倍
            // console.log(event.pageX, event.pageY);
            var zoomPoint = new fabric.Point(event.pageX, event.pageY);
            that.canvasZoom = zoom;
            that.canvas.zoomToPoint(zoomPoint, zoom);
            that.$emit('changeZoomTo',zoom);
        }

    });

      this.initbg(); // 初始化画布






    },
    methods: {
        //改变窗口大小时
        changebg(w, h) {
            //console.log(this.boxWidth,this.boxHeight,w,h)
            let objects = this.canvas.getObjects();
            //console.log(objects);
            objects.forEach((one) => {
                if (one.type === 'sBg') {
                    // console.log(one)
                    one.setlefttop();
                }
            });
            this.canvas.setWidth(w);
            this.canvas.setHeight(h);
            this.canvas.renderAll();
            this.canvas.calcOffset();
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },
        //返回背景
        returnbg() {
            let objects = this.canvas.getObjects();
            let returndata;
            objects.forEach((one) => {
                if (one.type === 'sBg') {
                    returndata = one;
                }
            });
            return returndata;
        },
        //还原1倍
        changeOneZoom(left, top) {
            //console.log(+left+this.winboxwidth/2,+top+this.winboxheight/2);
            var zoomPoint = new fabric.Point(+left + this.winboxwidth / 2, +top + this.winboxheight / 2);
            var zoom = 1;
            this.canvas.zoomToPoint(zoomPoint, zoom);
            this.canvasZoom = zoom;
            this.canvas.absolutePan(new fabric.Point((this.oldboxWidth - this.winboxwidth) / 2, (this.oldboxHeight - this.winboxheight) / 2));
            this.$emit('changeZoomTo', zoom);
            this.canvas.renderAll();

        },
        //按照缩放 上下左右居中
        changeOrigin(left, top) {
            let zoom = this.canvas.getZoom();
            this.canvasZoom = zoom;
            this.changeOneZoom(left, top); //还原1:1居中
            this.canvas.zoomToPoint(new fabric.Point((+left + this.winboxwidth) / 2, (+top + this.winboxheight) / 2), zoom);

            this.$emit('changeZoomTo', zoom);
            this.canvas.renderAll();
        },



        //左上角对齐
        changeLefttop(left, top) {

            let zoom = this.canvas.getZoom();
            let rulerwidth = 0;
            if (zoom == 1) {
                rulerwidth = 18
            }
            var zoomPoint = new fabric.Point(0, 0);
            //console.log(this.boxWidth,'|',this.winboxwidth,this.oldboxWidth)
            var zoomPoint2 = new fabric.Point((this.boxWidth - this.width) * zoom / 2 - rulerwidth * zoom + ((this.oldboxWidth - this.winboxwidth) / 2) * zoom,
                (this.boxHeight - this.height) * zoom / 2 - rulerwidth * zoom + ((this.oldboxHeight - this.winboxheight) / 2) * zoom);
            this.canvas.relativePan(zoomPoint);
            this.canvas.absolutePan(zoomPoint2);
            this.canvas.renderAll();
        },
        //上中
        changeTopcenter(left, top) {

            let zoom = this.canvas.getZoom();
            let rulerwidth = 0;
            if (zoom == 1) {
                rulerwidth = 18
            }
            var zoomPoint = new fabric.Point(0, 0);
            var zoomPoint2 = new fabric.Point(((this.oldboxWidth - this.width) / 2) * zoom - rulerwidth * zoom - ((this.winboxwidth - this.width) / 2) * zoom,
                (this.oldboxHeight - this.height) * zoom / 2 - rulerwidth * zoom);
            this.canvas.relativePan(zoomPoint);
            this.canvas.absolutePan(zoomPoint2);
            this.canvas.renderAll();
        },
        //右上
        changeRighttop() {
            let zoom = this.canvas.getZoom();
            let rulerwidth = 0;
            if (zoom == 1) {
                rulerwidth = 18
            }
            var zoomPoint = new fabric.Point(0, 0);
            var zoomPoint2 = new fabric.Point(((this.oldboxWidth - this.width) / 2) * zoom - rulerwidth * zoom - (this.winboxwidth - this.width) * zoom,
                (this.oldboxHeight - this.height) * zoom / 2 - rulerwidth * zoom);
            this.canvas.relativePan(zoomPoint);
            this.canvas.absolutePan(zoomPoint2);
            this.canvas.renderAll();
        },

        changeLeft() {
            let zoom = this.canvas.getZoom();
            let rulerwidth = 0;
            if (zoom == 1) {
                rulerwidth = 18
            }
            var zoomPoint = new fabric.Point(0, 0);
            var zoomPoint2 = new fabric.Point((this.oldboxWidth - this.width) * zoom / 2 - rulerwidth * zoom,
                (this.oldboxHeight - this.winboxheight) * zoom / 2 - rulerwidth * zoom);
            this.canvas.relativePan(zoomPoint);
            this.canvas.absolutePan(zoomPoint2);
            this.canvas.renderAll();
        },
        changeRight() {
        },
        changeLeftbottom() {
        },
        changeRightbottom() {
        },
        changeBottomcenter() {
        },

        //铺满
        changeBigZoom(left, top) {
            let zoom = 1;
            if (this.boxWidth / this.boxHeight < this.width / this.height) {
                //console.log('宽扁')
                if (this.boxWidth < this.width) {
                    zoom = this.boxWidth / this.width;
                } else {
                    zoom = this.boxWidth / this.width;
                }
            } else {
                //console.log('瘦高')
                if (this.boxHeight < this.height) {
                    zoom = this.boxHeight / this.height;
                } else {
                    zoom = this.boxHeight / this.height;
                }
            }
            this.canvasZoom = zoom;
            this.changeOneZoom(left, top); //还原1:1居中
            this.canvas.zoomToPoint(new fabric.Point((+left + this.winboxwidth) / 2, (+top + this.winboxheight) / 2), zoom);
            this.$emit('changeZoomTo', zoom);
            this.canvas.renderAll();
        },


        //白色背景画布
        initbg(options) {
            console.log('初始化背景')
            let left = 0;
            let top = 0;
            if (this.boxWidth > this.width * this.canvasZoom) {
                left = this.boxWidth / 2 - this.width / 2 ;
            } else {
                left =  0 ;
            }

            if (this.boxHeight > this.height * this.canvasZoom) {
                top = this.boxHeight / 2 - this.height / 2;
            } else {
                top = 0;
            }
            this.xLeft = -left;
            this.yTop = -top;

            console.log('left,top',left,top,'this.boxWidth',this.boxWidth,'this.width * this.canvasZoom',this.width , this.canvasZoom);
            //  console.log('宽高：',this.boxWidth,this.boxHeight, this.canvasZoom)
            options = Object.assign({
                width: this.width,
                height: this.height,
                fill: '#fff',
                left: 0,
                top: 0,
                padding: 0,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
            }, options);
            let rect = new fabric.Rect({
                ...options,
                left: left,
                top: top,
                type: 'sBg',
                originX: 'left',
                originY: 'top',
                name: 'background',
                selectable: false,
                visible: true,

                component: "bg",
                isType: 'Rect',
                isDiff: 'none',

                fill: '#fff',
                // fillColor: options.fillColor ? options.fillColor : '#fff',
                flipX: false,
                flipY: false,

                stopContextMenu: true,                            //禁掉鼠标右键默认事件
                hoverCursor: 'default',
                evented: false,
                hasControls: false,
                strokeWidth: 0,
                stroke: null,
                excludeFromExport: true,
                perPixelTargetFind: false,
            });
            //

            this.canvas.remove(this.returnbg());

            this.canvas.add(rect);
            rect.sendToBack();

            setTimeout(()=>{
                this.getBlack({width:this.width,height:this.height},2); //黑色遮罩
            },10);




            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },
        //添加黑色遮罩
        getBlack(options,status){

            let zoom = this.canvas.getZoom();
            let that = this;
          // console.log('添加黑色遮罩',this.boxWidth,options.width,zoom,this.canvasZoom);

            let x1, x2, y1, y2;
            if (this.boxWidth > options.width * this.canvasZoom) {
                x1 = this.boxWidth / 2 - options.width / 2;
                x2 = x1 + options.width;
            } else {
                x1 = 0;
                x2 = options.width;
            }
            if (this.boxHeight > options.height * this.canvasZoom) {
                y1 = this.boxHeight / 2 - options.height / 2;
                y2 = y1 + options.height;
            } else {
                y1 = 0;
                y2 = options.height;
            }

            let arrX = [0, x1, x2, x2 + x1];
            let arrY = [0, y1, y2, y2 + y1];

            let bg = that.returnbg();
            that.canvas.remove(...that.canvas.getObjects('sMask'));
            const pathOption = {
                selectable: false,
                fill: '#f1f1f1',  //rgb(40,40,40)
                hoverCursor: 'default',
                evented: false,
                excludeFromExport: true,
                hasControls: false,
                perPixelTargetFind: false,
                strokeWidth: 0,
                stroke: null,
                originX: 'left',
                originY: 'top',

                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                name: 'sMask',
                type: 'sMask',
            }
            const rect1 = new fabric.Rect({
                ...pathOption,
                left: bg.left-1000,
                top: bg.top-2,
                width:1000,
                height: 1000+options.height,
            });
            const rect2 = new fabric.Rect({
                ...pathOption,
                left: bg.left-1000,
                top: bg.top-1000,
                width:2000 + options.width,
                height: 1000,
            });
            const rect3 = new fabric.Rect({
                ...pathOption,
                left: options.width+ bg.left,
                top: bg.top-2,
                width:1000,
                height: 1000+options.height,
            });
            const rect4 = new fabric.Rect({
                ...pathOption,
                left: bg.left-1000,
                top: options.height + bg.top,
                width:2000 + options.width,
                height: 1000,
            });
            that.canvas.add(rect1);
            rect1.bringToFront();

            that.canvas.add(rect2);
            rect2.bringToFront();

            that.canvas.add(rect3);
            rect3.bringToFront();

            that.canvas.add(rect4);
            rect4.bringToFront();



            that.canvas.requestRenderAll();
            that.canvas.renderAll();



            //that.canvas.remove(...that.canvas.getObjects('sRuler')); //删除已有的标尺
           /* setTimeout(()=>{
                that.drawImgbg({
                    left:bg.left - 55 * (options.width / 800),
                    top:bg.top - 51 * (options.height / 800),
                    width:options.width,
                    height:options.height,
                }); //画布背景


            },100);*/

           /* if(zoom!==1){
                this.canvas.remove(...this.canvas.getObjects('sRuler')); //删除已有的标尺
                setTimeout(()=>{
                    that.drawRulerInit({
                        axisWidth:1,
                        lineColor:'#666',
                        gridWidth:30,
                        gridHeight:20,
                        left:bg.left,
                        top:bg.top,
                        width:options.width,
                        height:options.height,
                    },'ALL'); //画尺子
                },500)
            }*/


        },

        drawImgbg(params){
            let that = this;
            fabric.Image.fromURL('../../../static/images/ESL.png', function (img) {
                img.set({
                    originX: 'left',
                    originY: 'top',
                    left: params.left,
                    top: params.top,

                    scaleX: (params.width + 119 * (params.width / 800)) / img.width,
                    scaleY: (params.height + 102 * (params.height / 800)) / img.height,

                    selectable: false,
                    excludeFromExport: true,
                    lockMovementX: true,
                    lockMovementY: true,
                    lockRotation: true,
                    lockScalingX: true,
                    lockScalingY: true,
                    lockUniScaling: true,
                    hoverCursor: 'auto',
                    name: 'sImg',
                    type: 'sImg',
                    evented: false
                });
                that.canvas.remove(...that.canvas.getObjects('sImg'));


                that.canvas.add(img);
                img.bringToFront();
                that.canvas.requestRenderAll();
                that.canvas.renderAll();
            });
        },
        //在价签背景上画标尺 params:{axisWidth:1,lineColor:'#ff0',gridWidth:10,gridHeight:10} status:1 HORIZONTAL  2 VERTICAL  3 ALL 4 NONE
        drawRulerInit(params,status){

            switch (status) {
                case 'ALL':
                    this.drawRulerH(params);//画上边的标尺
                    this.drawRulerV(params); //画左侧的标尺
                    break;
                case 'HORIZONTAL':
                    this.drawRulerH(params);
                    break;
                case 'VERTICAL':
                    this.drawRulerV(params);
                    break;
                case 'NONE':
                    break;
                default:
                    break;
            }


        },
        drawRulerH(params){
            let that = this;
            //长线
            let objectline =[];
            for(let i =0;i<(params.width+1)/50;i++){
                let line = new fabric.Line([50*i,0,50*i,params.gridHeight],{
                    stroke:params.lineColor,
                    strokeWidth:params.axisWidth,
                    strokeDashArray:[0,0],
                });
                objectline.push(line)
            }
            let objecttext =[];
            for(let i =0;i<(params.width)/50;i++){
                let data = i*50+'';
                let text = new fabric.Text(data,{
                    originX:'left',
                    originY:'top',
                    left:50*i+5,
                    top:params.gridHeight *0.01 ,
                    fill:'#666',
                    strokeWidth:0.3,
                    fontSize:12,
                });
                objecttext.push(text)
            }
            //分隔短线
            let objectline2 =[];
            for(let i =0;i<(params.width)/10;i++){
                let line = new fabric.Line([5+10*i,params.gridHeight*0.8,5+10*i,params.gridHeight],{
                    stroke:params.lineColor,
                    strokeWidth:params.axisWidth,
                    strokeDashArray:[0,0],
                });
                objectline2.push(line)
            }
            //分隔长线
            let objectline3 =[];
            for(let i =0;i<(params.width)/10;i++){
                let line = new fabric.Line([10+10*i,params.gridHeight*0.6,10+10*i,params.gridHeight],{
                    stroke:params.lineColor,
                    strokeWidth:params.axisWidth,
                    strokeDashArray:[0,0],
                });
                objectline3.push(line)
            }

            let rulerPath = new fabric.Group([...objectline,...objecttext,...objectline2,...objectline3], {
                originX: 'left',
                originY: 'top',
                selectable: false,
                excludeFromExport: true,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                hoverCursor: 'auto',
                name: 'sRuler',
                left:params.left,
                top: params.top-params.gridHeight,
                type: 'sRuler',
                evented: false
            });
            that.canvas.add(rulerPath);
            rulerPath.bringToFront();
            that.canvas.requestRenderAll();
            that.canvas.renderAll();
        },
        drawRulerV(params){
            let that = this;
            //长线
            let objectline =[];
            for(let i =0;i<(params.height+1)/50;i++){
                let line = new fabric.Line([0,50*i,params.gridWidth,50*i],{
                    originX:'left',
                    originY:'top',
                    stroke:params.lineColor,
                    strokeWidth:params.axisWidth,
                    strokeDashArray:[0,0],
                });
                objectline.push(line)
            }
            let objecttext =[];
            for(let i =0;i<(params.height)/50;i++){
                let data = i*50+'';
                for(let j=0;j<data.length;j++){
                    let text = new fabric.Text(data[j],{
                        originX:'left',
                        originY:'top',
                        left:params.gridWidth*0.01,
                        top:j*12+(50*i+5),
                        fill:'#666',
                        strokeWidth:0.3,
                        fontSize:12,
                        width:12,
                    });
                    objecttext.push(text)
                }

            }
            //分隔短线
            let objectline2 =[];
            for(let i =0;i<(params.height)/10;i++){
                let line = new fabric.Line([params.gridWidth*0.8,5+10*i,params.gridWidth,5+10*i],{
                    originX:'left',
                    originY:'top',
                    stroke:params.lineColor,
                    strokeWidth:params.axisWidth,
                    strokeDashArray:[0,0],
                });
                objectline2.push(line)
            }
            //分隔长线
            let objectline3 =[];
            for(let i =0;i<(params.height)/10;i++){
                let line = new fabric.Line([params.gridWidth*0.6,10+10*i,params.gridWidth,10+10*i],{
                    originX:'left',
                    originY:'top',
                    stroke:params.lineColor,
                    strokeWidth:params.axisWidth,
                    strokeDashArray:[0,0],
                });
                objectline3.push(line)
            }

            let rulerPath = new fabric.Group([...objectline,...objecttext,...objectline2,...objectline3], {
                originX: 'left',
                originY: 'top',
                selectable: false,
                excludeFromExport: true,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                hoverCursor: 'auto',
                name: 'sRuler',
                left:params.left - params.gridWidth,
                top: params.top,
                type: 'sRuler',
                evented: false
            });
            that.canvas.add(rulerPath);
            rulerPath.bringToFront();
            that.canvas.requestRenderAll();
            that.canvas.renderAll();
        },
        //重绘
        resetInitbg(options) {
            console.log('重绘背景');
            let zoom = this.canvas.getZoom();
            //console.log(this.canvasZoom,zoom);
            let left = 0;
            let top = 0;
            /*this.width = options.width;
            this.height = options.height;
            setTimeout(()=>{
                this.$emit('setW',options.width);
                this.$emit('setH',options.height);
            },0);*/
            /**/
            if (this.boxWidth > (options.width+55*(options.width/800)) * zoom ) {
                left = this.boxWidth / 2 - options.width / 2;
            } else {
                left = 0;
            }


            if (this.boxHeight > (options.height+51*(options.height/800)) * zoom) {
                top = this.boxHeight / 2 - options.height / 2;
            } else {
                top =  0;
            }

            console.log(this.boxWidth , options.width * zoom,this.boxHeight , options.height * zoom)
            // console.log('宽高：',this.boxWidth,this.boxHeight, zoom)
            // console.log( '画布宽高：',options.width,options.height,zoom)

            this.xLeft = -left;
            this.yTop = -top;

            options = Object.assign({
                width: options.width,
                height: options.height,
                fill: '#fff',
                left: 0,
                top: 0,
                padding: 0,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
            }, options);
            let rect = new fabric.Rect({
                ...options,
                left: left,
                top: top,
                type: 'sBg',
                originX: 'left',
                originY: 'top',
                name: 'background',
                selectable: false,
                visible: true,

                component: "bg",
                isType: 'Rect',
                isDiff: 'none',

                fill: '#fff',
                // fillColor: options.fillColor ? options.fillColor : '#fff',
                flipX: false,
                flipY: false,

                stopContextMenu: true,                            //禁掉鼠标右键默认事件
                hoverCursor: 'default',
                evented: false,
                hasControls: false,
                strokeWidth: 0,
                stroke: null,
                excludeFromExport: true,
                perPixelTargetFind: false,
            });
            //

            //console.log(this.returnbg());
            this.canvas.remove(this.returnbg());
            this.canvas.add(rect);
            rect.sendToBack();


            setTimeout(()=>{
                this.getBlack({width:options.width,height:options.height}); //黑色遮罩
            },10)



            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },
        //切换画布移动和不可移动
        changemoveing(bol) {
            //console.log('移动？',bol);
            this.isMoveing = bol;
            if (bol) {
                this.canvas.skipTargetFind = true;
                //this.canvas.selectable = true;
            } else {
                this.canvas.skipTargetFind = false;
            }
        },
        //切换画布是否允许多选
        changeSelection(bol) {
            //console.log('多选？',bol);
            this.canvas.selection = bol;
        },


        //画二维码
        drawqrcode(text, option) {
            let qrcodeImg = jrQrcode.getQrBase64(text, {
                padding: option.margin ? option.margin : 1,   // 二维码四边空白（默认为10px）
                width: option.width ? option.width : 80,  // 二维码图片宽度（默认为256px）
                height: option.height ? option.height : 80,  // 二维码图片高度（默认为256px）
                correctLevel: QRErrorCorrectLevel.H,    // 二维码容错level（默认为高）
                reverse: false,        // 反色二维码，二维码颜色为上层容器的背景颜色
                background: option.background ? option.background : "#ffffff",    // 二维码背景颜色（默认白色）
                foreground: option.lineColor ? option.lineColor : "#000000"     // 二维码颜色（默认黑色）
            });
            this.qrcodeImg = qrcodeImg;
            return qrcodeImg;

            /**
             @param: text: 要生成二维码的字符，支持中文
             @param: options: {
          padding       : 10,   // 二维码四边空白（默认为10px）
          width         : 256,  // 二维码图片宽度（默认为256px）
          height        : 256,  // 二维码图片高度（默认为256px）
          correctLevel  : QRErrorCorrectLevel.H,    // 二维码容错level（默认为高）
          reverse       : false,        // 反色二维码，二维码颜色为上层容器的背景颜色
          background    : "#ffffff",    // 二维码背景颜色（默认白色）
          foreground    : "#000000"     // 二维码颜色（默认黑色）
        }
             @return: 生成的二维码Base64 URL
             */
        },

        //右键事件
        showMenu() {
            if (!this.showMouseRight) {
                return;
            }
            var canvas = this.canvas;

            /* let top = document.getElementById('boxblock').getBoundingClientRect().top;
          let left = document.getElementById('boxblock').getBoundingClientRect().left;*/

            var x = event.clientX;
            var y = event.clientY;
            var objects = canvas.getObjects();
            for (var i = objects.length - 1; i >= 0; i--) {
                var object = objects[i];
                if (object.visible) {
                    //  console.log(object.component)
                    if (object.component !== 'component') {  //判断不是背景也不是遮罩
                        event.preventDefault();
                        continue;
                    }

                    if (canvas.containsPoint(event, object)) {
                        if (object.isType === 'TextRect-text') { //如果是组合文本上的文本 则选中下面的矩形
                            let objects = this.getObjectsNew();
                            objects.forEach((obj) => {
                                if (obj.id === object.id && obj.isType === 'TextRect') {
                                    this.setActiveObject(obj);
                                }
                            })
                        } else {
                            this.setActiveObject(object);
                            //新增滚动条，所以定位有变化
                        }

                        this.contextMenuData.axis = {x, y};
                        event.preventDefault();

                        return;  //为了右击时最上面的被选择
                    }
                }
            }

        },
        /*右键事件
        * ----------------------------------------------------------------------------------------------------------------------------------------------
        * 标尺事件
        * */

        //滚动条计算
        setScroll(w, h) {
            //console.log('重置滚动条');
            this.scrollxW = (this.boxWidth * this.boxWidth) / w;
            this.scrollyH = (this.boxHeight * this.boxHeight) / h;
        },

        //标尺显示与否
        returnXYshow(b) {
            if (b === true) {
                return 'visible';
            } else {
                return 'hidden';
            }
        },
        //标尺设置不显示
        setNoSeeRuler(b) {
            this.showYzhou = b;
            this.showXzhou = b;
        },
        //标尺显示与否 判断画布坐标
        returnXYshowcanvas(b1, b2) {
            // console.log(b1===true && b2===true);
            if (b1 === true && b2 === true) {
                return 18;
            } else {
                return 0;
            }
        },
        //监听内容区，修改标尺滚动条
        show(e) {
            //   console.log('获取',document.getElementById('content').firstChild,document.getElementById('content').firstChild.childNodes[4]);
            document.getElementById('yZhou').scrollTop = document.getElementById('content').firstChild.childNodes[4].scrollTop;
            document.getElementById('xZhou').scrollLeft = document.getElementById('content').firstChild.childNodes[4].scrollLeft;
            if (this.showRuler[1] ? (this.height + 18) > this.boxHeight : this.height > this.boxHeight) {
                let scrollTop = document.getElementById('content').scrollTop;
                let maxY = document.getElementById('scrolly').parentNode.offsetHeight - 8 - 50 - 18;
                let maxscroll = (document.getElementById('canvas').offsetHeight - document.getElementById('content').offsetHeight) + 30;
                let Top = (scrollTop * maxY) / maxscroll + 18;
                document.getElementById('scrolly').style.top = Top + 'px';
            }

            if (this.showRuler[0] ? (this.width + 18) > this.boxWidth : this.width > this.boxWidth) {
                let scrollLeft = document.getElementById('content').scrollLeft;
                let maxX = document.getElementById('scrollx').parentNode.offsetWidth - 8 - 50 - 18;
                let maxscrollx = (document.getElementById('canvas').offsetWidth - document.getElementById('content').offsetWidth) + 30;
                let Left = (scrollLeft * maxX) / maxscrollx + 18;
                document.getElementById('scrollx').style.left = Left + 'px';
            }

        },
        //监听标尺滚动，修改内容区
        yshow(e) {
            document.getElementById('content').children[0].children[2].scrollTop = document.getElementById('yZhou').scrollTop;
            document.getElementById('content').children[0].children[2].scrollLeft = document.getElementById('xZhou').scrollLeft;
        },
        yshowadd() {
            let newtop, newleft;
            if ((this.boxHeight / 2 - (this.height * this.canvasZoom) / 2) > 0) {
                let new1 = this.boxHeight * (this.canvasZoom - 1) / 2;
                let new2 = (this.boxHeight * this.canvasZoom) / 2 - (this.height * this.canvasZoom) / 2;
                newtop = new1 < new2 ? new1 : new2;
            } else {
                newtop = (this.boxHeight * this.canvasZoom) / 2 - (this.height * this.canvasZoom) / 2;
            }

            if ((this.boxWidth / 2 - (this.width * this.canvasZoom) / 2) > 0) {
                let new1 = this.boxWidth * (this.canvasZoom - 1) / 2;
                let new2 = (this.boxWidth * this.canvasZoom) / 2 - (this.width * this.canvasZoom) / 2;
                newleft = new1 < new2 ? new1 : new2;
            } else {
                newleft = (this.boxWidth * this.canvasZoom) / 2 - (this.width * this.canvasZoom) / 2;
            }

            /* console.log('改变焦点：',this.canvasZoom, document.getElementsByClassName('gm-scroll-view')[0].scrollHeight,'||||',
              (this.boxHeight * this.canvasZoom)/2 - (this.height * this.canvasZoom)/2,
              (this.boxWidth * this.canvasZoom)/2 - (this.width * this.canvasZoom)/2,
              this.boxHeight*(this.canvasZoom-1)/2 ,
              this.boxWidth*(this.canvasZoom-1)/2 ,'end:',newtop,newleft);
*/
            // console.log(document.getElementById('content').firstChild.childNodes[4])
            document.getElementById('content').firstChild.childNodes[4].scrollTop = document.getElementById('yZhou').scrollTop = newtop;
            document.getElementById('content').firstChild.childNodes[4].scrollLeft = document.getElementById('xZhou').scrollLeft = newleft;


        },
        toOrigin(x, y) {
            document.getElementById('content').firstChild.childNodes[4].scrollTop = document.getElementById('yZhou').scrollTop = y;
            document.getElementById('content').firstChild.childNodes[4].scrollLeft = document.getElementById('xZhou').scrollLeft = x;
        },
        // 计算刻度
        scaleCalc() {
            let w = this.width > this.boxWidth ? this.width : this.boxWidth;
            let h = this.height > this.boxHeight ? this.height : this.boxHeight;
            this.xScale = this.getCalc(this.xScale, w * this.canvasZoom, 'x');
            this.yScale = this.getCalc(this.yScale, h * this.canvasZoom, 'y');
        },
        // 获取刻度方法
        getCalc(array, length, direction) {
            array = [];
            if (direction === 'x') {
                for (let i = this.xLeft; i < length * this.stepLength / 50; i += this.stepLength) {
                    /*if (i % this.stepLength=== 0) {
              array.push({ id: i })
            }*/
                    this.translateX = -i % this.stepLength - 18
                    if (i % this.stepLength < 0) {
                        array.push({id: i - i % this.stepLength - this.stepLength})
                    } else {
                        array.push({id: i - i % this.stepLength})
                    }

                }
            } else if (direction === 'y') {
                for (let i = this.yTop; i < length * this.stepLength / 50; i += this.stepLength) {
                    /*if (i % this.stepLength === 0) {
              array.push({ id: i })
            }*/
                    this.translateY = -i % this.stepLength - 18;
                    if (i % this.stepLength < 0) {
                        array.push({id: i - i % this.stepLength - this.stepLength})
                    } else {
                        array.push({id: i - i % this.stepLength})
                    }
                }
            } else {
                // console.log('未计算');
                for (let i = 0; i < length * this.stepLength / 50; i += this.stepLength) {
                    if (i % this.stepLength === 0) {
                        array.push({id: i})
                    }
                }
            }

            //console.log('new',direction,JSON.stringify(array));
            return array;

        },
        /*
      * 标尺函数
      * ------------------------------------------------------------------------------------------------------------------------------------------
      * 画布函数
      * */

        //全局的点击事件
        clickbody(evet) {
            //console.log('clickbody',evet);

            if (this.isInRange(evet.pageX, evet.pageY)) {
                // console.log('还在范围内哦OOOOOOOOOOOOOOOOOO');
            } else {
                // console.log('不在范围了XXXXXXXXXXXXXXXXX');
                this.textareashow = false;
            }

        },
        //判断是否在范围内
        isInRange(value1, value2) {
            value1 = Math.round(value1);
            value2 = Math.round(value2);

            let canleft = document.getElementById('can').offsetLeft;
            let cantop = document.getElementById('can').offsetTop;

            let scrollx = document.getElementById('content').children[0].children[2].scrollWidth;
            let scrolly = document.getElementById('content').children[0].children[2].scrollHeight;
            // console.log(scrollx,scrollx,'|',document.getElementsByClassName('gm-scroll-view')[0].scrollTop,document.getElementsByClassName('gm-scroll-view')[0].scrollLeft);


            if (value1 > this.style.left + canleft && value1 < this.style.left + canleft + this.style.width && value2 > this.style.top + cantop && value2 < this.style.top + cantop + this.style.height) {
                return true;
            }
            return false;
        },


        //获取画布所有元素
        getObjects() {
            let obj = this.canvas.getObjects();
            return obj;
        },

        //元素不选中即置顶
        setStackingtrue() {
            this.canvas.preserveObjectStacking = true;
        },
        //获取当前活跃元素
        getEditObj() {
            let obj = this.canvas.getActiveObject();
            return obj;
        },
        //获取当前活跃元素
        getActiveObject() {
            var obj = this.canvas.getActiveObject();
            return obj;
        },
        //设置obj为当前活跃元素
        setActiveObject(obj) {
            this.canvas.setActiveObject(obj);
            this.canvas.renderAll();
        },
        //设置多个元素为活跃元素  --- id的集合
        setActiveObjs(ids) {
            let objs = [];
            ids.forEach((id) => {
                let objects = this.canvas.getObjects();
                objects.forEach((obj) => {
                    if (obj.id === id && obj.isType !== 'TextRect-text') {
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
        setActiveObjects(objs) {
            var sel = new fabric.ActiveSelection(objs, {
                canvas: this.canvas,
            });
            this.canvas.setActiveObject(sel);
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },
        //设置id 为当前活跃元素
        setActiveid(id) {
            let objects = this.canvas.getObjects();
            for (let i in objects) {
                if (objects[i].id === id && objects[i].isType !== 'TextRect-text') {
                    this.canvas.setActiveObject(objects[i]);
                }
            }
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },


        //单个删除 多个删除  ----delete快捷键 删除的
        removeCurrentObj() {
            let obj = this.canvas.getActiveObject();
            let deleteIds = [];
            //console.log('删除了吗？:',obj);

            if (obj._objects) {  //多选
                this.canvas.discardActiveObject();
                for (var i in obj._objects) {
                    deleteIds.push(obj._objects[i].id);
                    this.canvas.remove(obj._objects[i]);
                }
                deleteIds.push(obj.id);
                this.canvas.remove(obj); //删除条码起作用
            } else {  //单选
                if (obj.isType === 'TextRect-text') { //如果是组合文本上的文本不可删除
                    return;
                }
                deleteIds.push(obj.id);
                this.canvas.remove(obj);
            }

            this.canvas.renderAll();
            this.$emit('deleteidsdata', deleteIds);
            return deleteIds;
        },

        //删除当前活跃元素 - 右键菜单调用该方法
        removeEditObj() {
            let obj = this.canvas.getActiveObject();
            if (obj.isType === 'TextRect-text') { //如果是组合文本上的文本不可删除
                return;
            }
            this.$emit('deleteidsdata', [obj.id]);
            this.canvas.remove(obj);
        },
        //删除指定id
        deleteObjs(id) {
            let objects = this.canvas.getObjects();
            for (let i in objects) {
                if (objects[i].id == id) {
                    this.canvas.remove(objects[i]);
                }
            }
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },

        //删除指定元素
        removeObj(obj) {
            this.canvas.remove(obj);
            this.canvas.renderAll();
        },
        //新增指定元素
        addObj(obj) {
            this.canvas.add(obj);
            this.canvas.renderAll();
        },
        //设置整体缩放比
        setZoom(n) {
            this.canvasZoom = n;
            let w = this.width > this.boxWidth ? this.width : this.boxWidth;
            let h = this.height > this.boxHeight ? this.height : this.boxHeight;

            this.canvas.setWidth(w * n);
            this.canvas.setHeight(h * n);
            this.canvas.setZoom(n);


            setTimeout(() => {

                // this.setTop();
                //this.yshowadd();     //计算滚动条检点对准画布原点
                this.canvas.renderAll();
                this.$emit('changeZoomTo', n);

            }, 100);


            //this.canvas.renderAll();
        },
        //快捷键缩放 比例尺计算缩放
        ChangeZoom(n) {
            this.canvasZoom = this.canvas.getZoom();
            let w = this.width > this.boxWidth ? this.width : this.boxWidth;
            let h = this.height > this.boxHeight ? this.height : this.boxHeight;

            if (n === 1) {     //增加

                if (w * this.canvasZoom > 10000 || h * this.canvasZoom > 10000) {
                    return;
                }

                this.canvasZoom = this.canvasZoom + 0.1;
                this.canvas.setWidth(w * this.canvasZoom);
                this.canvas.setHeight(h * this.canvasZoom);
                this.canvas.setZoom(this.canvasZoom);

                // this.yshowadd();     //计算滚动条检点对准画布原点
                this.canvas.renderAll();

            } else if (n === 0) {  //减小

                if (w * (this.canvasZoom - 0.1) < this.boxWidth || h * (this.canvasZoom - 0.1) < this.boxHeight) {
                    return;
                }
                this.canvasZoom = this.canvasZoom - 0.1;
                this.canvas.setWidth(w * this.canvasZoom);
                this.canvas.setHeight(h * this.canvasZoom);
                this.canvas.setZoom(this.canvasZoom);

                // this.yshowadd();    //计算滚动条检点对准画布原点
                this.canvas.renderAll();
            }

            this.$emit('changeZoomTo', this.canvasZoom);

            // console.log('zoom:',this.canvasZoom);
        },

        //新的缩放
        SetNewZoom(zoom,left, top) {
            //let zoom = this.canvas.getZoom();
            this.canvasZoom = zoom;
            let w = this.width > this.boxWidth ? this.width : this.boxWidth;
            let h = this.height > this.boxHeight ? this.height : this.boxHeight;

            //this.canvasZoom = this.canvasZoom - 0.1;
            if(this.canvasZoom>1){
                this.canvas.setWidth(w * this.canvasZoom);
                this.canvas.setHeight(h * this.canvasZoom);
                this.canvas.setZoom(this.canvasZoom);
            }else{
                this.canvas.setWidth(w * (1/this.canvasZoom));
                this.canvas.setHeight(h * (1/this.canvasZoom));
                this.canvas.setZoom(this.canvasZoom);
            }


            this.changeOneZoom(left, top); //还原1:1居中
            this.canvas.zoomToPoint(new fabric.Point((+left + this.winboxwidth) / 2, (+top + this.winboxheight) / 2), zoom);

            this.$emit('changeZoomTo', zoom);
            this.canvas.renderAll();
        },

        //返回最小缩放比
        returnSmallScale() {
            this.canvasZoom = this.canvas.getZoom();
            let w = this.width > this.boxWidth ? this.width : this.boxWidth;
            let h = this.height > this.boxHeight ? this.height : this.boxHeight;
            if (w * (this.canvasZoom - 0.1) < this.boxWidth || h * (this.canvasZoom - 0.1) < this.boxHeight) {
                return;
            }
        },

        setbackgroundColor(color) {
            this.canvas.backgroundColor = color;
            this.canvas.requestRenderAll();
            this.canvas.renderAll();

        },
        //设置画布背景颜色
        setbackground(color) {
            //this.canvas.backgroundColor = color;
            let objects = this.canvas.getObjects();
            let _this = this;
            objects.forEach((obj) => {
                if (obj.type === 'sBg') {
                    if (color === 'transparent') {
                        let _this = this;
                        fabric.util.loadImage('./static/images/psbg.png', function (img) {
                            //console.warn(img);
                            obj.set('fill',
                                new fabric.Pattern({
                                    source: img,
                                    repeat: 'repeat'
                                }));

                            _this.setTop(); //遮罩置顶，背景置底重置
                            _this.canvas.requestRenderAll();
                            _this.canvas.renderAll();
                        });

                    } else {
                        obj.fill = color;
                    }

                    setTimeout(() => {
                        _this.ChangeZoom(1);
                        _this.ChangeZoom(0)
                    }, 1)

                }
            });
            this.setTop(); //遮罩置顶，背景置底重置
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },

        //取消所有活跃元素的选择 ---取消选择 （单个或多个）
        discardActive() {
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },
        //层级移动
        moveToshow(obj, index) {
            // let obj = this.canvas.getActiveObject();
            this.canvas.moveTo(obj, index);
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },

        //模板设置宽高
        setWidth(width) {
            this.canvas.setWidth(width);
        },
        //模板设置宽高
        setHeight(height) {
            this.canvas.setHeight(height);
        },
        //模板设置显示
        setShow(id) {
            //   console.log('setShow',id);
            let objects = this.canvas.getObjects();
            for (let i in objects) {
                if (objects[i].id === id) {

                    objects[i].set('selectable', true);
                    objects[i].set('visible', true);
                    objects[i].set('opacity', 1);
                    objects[i].set('eyeshow', true);

                    if (objects[i]._objects) { //条码显示隐藏
                        //console.log('条码----------------',objects[i]);
                        objects[i]._objects.forEach((obj) => {
                            obj.set('visible', true);
                            obj.set('opacity', 1);
                            obj.set('eyeshow', true);
                        })
                    }
                    this.canvas.requestRenderAll();
                    this.canvas.renderAll();
                }
            }
        },
        //模板设置隐藏
        setHidden(id) {
            let objects = this.canvas.getObjects();
            for (let i in objects) {
                if (objects[i].id === id) {
                    objects[i].set('selectable', false);
                    objects[i].set('visible', false);
                    objects[i].set('opacity', 0);
                    objects[i].set('eyeshow', false);
                    this.canvas.requestRenderAll();
                    this.canvas.renderAll();
                }
            }
        },
        //禁止拖拽选择和多选
        setNomove() {
            this.canvas.selection = false;
            this.canvas.renderAll();
        },
        //组件修改名字
        rename(id, name) {
            let objects = this.canvas.getObjects();
            for (let i in objects) {
                if (objects[i].id === id) {
                    objects[i].set('name', name);
                    this.canvas.requestRenderAll();
                }
            }
        },
        // 设置层级(对焦点活跃元素才可操作) - 右键菜单中调用了这几个方法
        //下移一层
        toNextLayer() {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }
            /*let allobjects = this.getObjectsNew();
        allobjects.forEach((one)=>{
            if(one.id===obj.id && one.isType==='TextRect-text'){
                one.sendBackwards(true);
            }
        });*/
            obj.sendBackwards(true);
            this.canvas.renderTop();
            this.canvas.renderAll();

            this.setTop(); //遮罩置顶，背景置底重置

            this.$emit('changeLayer', obj);  //层级变动回调
        },
        //置于底层
        toBottomLayer() {
            let obj = this.canvas.getActiveObject();

            if (!obj) {
                return;
            }

            let allobjects = this.getObjectsNew();
            allobjects.forEach((one) => {
                if (one.id === obj.id && one.isType === 'TextRect-text') {
                    one.sendToBack();
                }
            });
            obj.sendToBack();
            this.canvas.renderTop();
            this.canvas.renderAll();

            this.setTop(); //遮罩置顶，背景置底重置

            this.$emit('changeLayer', obj);  //层级变动回调
        },
        //上移一层
        toLastLayer() {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }

            obj.bringForward(true);

            /* let allobjects = this.getObjectsNew();
        allobjects.forEach((one)=>{
            if(one.id===obj.id && one.isType==='TextRect-text'){
                one.bringForward(true);
            }
        });*/

            this.canvas.renderTop();
            this.canvas.renderAll();

            this.setTop(); //遮罩置顶，背景置底重置

            this.$emit('changeLayer', obj);  //层级变动回调
        },
        //置于顶层
        toTopLayer() {
            let obj = this.canvas.getActiveObject();
            if (!obj) {
                return;
            }

            obj.bringToFront();
            let allobjects = this.getObjectsNew();
            allobjects.forEach((one) => {
                if (one.id === obj.id && one.isType === 'TextRect-text') {
                    one.bringToFront();
                }
            });

            this.canvas.renderTop();
            this.canvas.renderAll();

            this.setTop(); //遮罩置顶，背景置底重置

            this.$emit('changeLayer', obj);  //层级变动回调
        },

        //图层移动
        moveTo() {
            let obj = this.canvas.getActiveObject();
            //  console.log(this.canvas.sendBackwards);
            this.canvas.sendBackwards(obj, true);
            /*  this.canvas.discardActiveObject();
          this.canvas.discardActiveGroup();*/
        },
        //图层移动到
        moveToshow(obj, index) {
            let cur = this.canvas.getActiveObject();
            if (!cur) {
                return;
            }
            this.canvas.moveTo(obj, index);


            this.canvas.renderTop();
            this.canvas.renderAll();

            this.setTop(); //遮罩置顶，背景置底重置

            this.$emit('changeLayer', obj);  //层级变动回调
        },


        //复制
        copyData() {
            //  console.log('复制')
            let clipboard = this.canvas.getActiveObject();
            //console.log('复制：',clipboard);

            if (clipboard == undefined || clipboard == null) {
                return;
            }
            if (clipboard.get('type') === 'group') {                              //组复制
                return '#ZKONG#' + escape(JSON.stringify(clipboard));
            } else if (clipboard.get('type') === 'activeSelection') {            //多元素复制
                //  console.log(clipboard._objects);

                let _objects = JSON.parse(JSON.stringify(clipboard._objects));
                let newobjects = [];
                _objects.map((_obj) => {
                    _obj.top = clipboard.top + _obj.top;
                    _obj.left = clipboard.left + _obj.left;
                    newobjects.push(_obj);
                });
                newobjects[0].parentscale = [clipboard.scaleX, clipboard.scaleY];  //第一个元素植入混合组件缩放比例
                return '#ZKONG#' + escape(JSON.stringify(newobjects));
            } else {                                                              //单个元素复制
                return '#ZKONG#' + escape(JSON.stringify(clipboard));
            }

        },
        //粘贴
        async paste(text) {
            // console.log('粘贴');
            if (this.clipboard == null) { //剪切板清除不掉，所以画布只可粘贴一次限制
                return;
            }
            this.canvas.discardActiveObject();
            if (text.substring(0, 7) !== '#ZKONG#') {
                return;
            }
            //console.log(text);
            let _clipboard = JSON.parse(unescape(text.substring(7, text.length)));

            //console.log('所粘贴的元素：',_clipboard);

            if (_clipboard instanceof Array) {

                //console.log('多元素')

                // console.log('多个元素',_clipboard)
                let canvaobjs = [];
                this.activecanvaobjs = [];
                for (var i in _clipboard) {
                    this.$emit('idAdd');   //this.cid = this.cid + 1;
                    this.cid = this.cid + 1;
                    let object = _clipboard[i];
                    object.copyId = JSON.parse(JSON.stringify(object.id));

                    object.id = this.cid;
                    object.zIndex = this.cid;
                    object.visible = true;

                    object.top = object.top + 10 + this.yTop;
                    object.left = object.left + 10 + this.xLeft;

                    if (object.isType === 'Barcode') {
                        object.width = object.width * object.scaleX;
                        object.height = object.height * object.scaleY;
                        object.scaleX = object.scaleY = 1;
                    }
                    if (object.isType === 'Text') {
                        object.width = parseInt(object.width * object.scaleX);
                        object.height = parseInt(object.height * object.scaleY);
                        object.scaleX = 1;
                        object.scaleY = 1;

                        this.$emit('idAdd');   //this.cid = this.cid + 1;
                        this.cid = this.cid + 1;
                    }
                    if (object.isType === 'TextRect') {

                        object.width = parseInt(object.width * object.scaleX);
                        object.height = parseInt(object.height * object.scaleY);
                        object.scaleX = 1;
                        object.scaleY = 1;

                        object.textAlign = object.textRectData.textAlign;  //文本对齐
                        object.fontWeight =  object.textRectData.fontWeight ? object.textRectData.fontWeight : 'normal';
                        object.linethrough = object.textRectData.linethrough ? object.textRectData.linethrough : false;
                        object.underline = object.textRectData.underline ? object.textRectData.underline : false;
                        object.fontStyle = object.textRectData.fontStyle ? object.textRectData.fontStyle : 'normal';

                    }
                    if (object.isType === 'Icon') {
                        object.width = parseInt(object.width * object.scaleX);
                        object.height = parseInt(object.height * object.scaleY);
                        object.scaleX = 1;
                        object.scaleY = 1;
                    }
                    if (object.isType === 'Image') {
                        object.width = parseInt(object.width * object.scaleX);
                        object.height = parseInt(object.height * object.scaleY);
                        object.scaleX = 1;
                        object.scaleY = 1;
                    }
                    if (object.isType === 'Image2') {
                        object.width = parseInt(object.width * object.scaleX);
                        object.height = parseInt(object.height * object.scaleY);
                        object.scaleX = 1;
                        object.scaleY = 1;
                    }
                    // console.log('粘贴',object);
                    //  console.log('复制？0',_clipboard);
                    let canvaobj = await this.createElement(object.isType, object);

                    if (canvaobj) {
                        // console.log('元素返回：',canvaobj.id);
                        this.$emit('copydata', object, [canvaobj.id], _clipboard);
                        // console.log('回调00000')
                        this.$emit('copyidsdata', [canvaobj.id]);  //一个一个复制
                        canvaobjs.push(canvaobj);
                    }
                }
                //canvaobjs.push(...this.activecanvaobjs);
                // console.log('活跃混合：',canvaobjs);
                var sel = new fabric.ActiveSelection(canvaobjs, {  //多元素混合选中
                    canvas: this.canvas,
                });
                sel.set({       //还原第一个元素保存的混合元素的缩放
                    scaleX: _clipboard[0].parentscale[0],
                    scaleY: _clipboard[0].parentscale[1],
                });
                this.canvas.setActiveObject(sel);
            } else {
                console.log('单元素')
                // console.log('单个元素',_clipboard)
                if (_clipboard.isType === 'TextRect-text') {
                    return;
                }

                this.$emit('idAdd');   //this.cid = this.cid + 1;
                this.cid = this.cid + 1;

                let canvaobj;

                _clipboard.copyId = JSON.parse(JSON.stringify(_clipboard.id));

                _clipboard.id = this.cid;
                _clipboard.zIndex = this.cid;

                _clipboard.top = _clipboard.top + 10 + this.yTop;
                _clipboard.left = _clipboard.left + 10 + this.xLeft;

                _clipboard.visible = true;

                if (_clipboard.isType === 'Rect' || _clipboard.isType === 'Circle' || _clipboard.isType === 'Rectangle' || _clipboard.isType === 'Parallelogram'
                    || _clipboard.isType === 'EqualCircle' || _clipboard.isType === 'Dottedline' || _clipboard.isType === 'star' || _clipboard.isType === 'Hexagon'
                    || _clipboard.isType === 'EqualTriangle') {
                    _clipboard.fill = _clipboard.color;
                }

                if (_clipboard.isType === 'Barcode') {
                    _clipboard.width = parseInt(_clipboard.width * _clipboard.scaleX);
                    _clipboard.height = parseInt(_clipboard.height * _clipboard.scaleY);
                    _clipboard.scaleX = 1;
                    _clipboard.scaleY = 1;
                }
                if (_clipboard.isType === 'Text') {
                    _clipboard.width = parseInt(_clipboard.width * _clipboard.scaleX);
                    _clipboard.height = parseInt(_clipboard.height * _clipboard.scaleY);
                    _clipboard.scaleX = 1;
                    _clipboard.scaleY = 1;
                }
                if (_clipboard.isType === 'Icon') {
                    _clipboard.width = parseInt(_clipboard.width * _clipboard.scaleX);
                    _clipboard.height = parseInt(_clipboard.height * _clipboard.scaleY);
                    _clipboard.scaleX = 1;
                    _clipboard.scaleY = 1;
                }
                if (_clipboard.isType === 'Image') {
                    _clipboard.width = parseInt(_clipboard.width * _clipboard.scaleX);
                    _clipboard.height = parseInt(_clipboard.height * _clipboard.scaleY);
                    _clipboard.scaleX = 1;
                    _clipboard.scaleY = 1;
                }
                if (_clipboard.isType === 'Image2') {
                    _clipboard.width = parseInt(_clipboard.width * _clipboard.scaleX);
                    _clipboard.height = parseInt(_clipboard.height * _clipboard.scaleY);
                    _clipboard.scaleX = 1;
                    _clipboard.scaleY = 1;
                }

                //  console.log('复制？1',_clipboard,_clipboard.isType,_clipboard.copyId);
                if (_clipboard.isType === 'TextRect') {

                    _clipboard.width = parseInt(_clipboard.width * _clipboard.scaleX);
                    _clipboard.height = parseInt(_clipboard.height * _clipboard.scaleY);
                    _clipboard.scaleX = 1;
                    _clipboard.scaleY = 1;

                    // console.warn('复制看看：',_clipboard);
                    canvaobj = await this.createElement(_clipboard.isType, {
                        ..._clipboard,

                        "fontFamily": _clipboard.textRectData.fontFamily ? _clipboard.textRectData.fontFamily : 'MicrosoftYaHei',
                        "textAlign": _clipboard.textRectData.textAlign ? _clipboard.textRectData.textAlign : "left",
                        "fontSize": _clipboard.textRectData.fontSize ? _clipboard.textRectData.fontSize : 14,
                        "angle": _clipboard.textRectData.angle ? _clipboard.textRectData.angle : 0,

                        "fontColor": _clipboard.textRectData.fontColor ? _clipboard.textRectData.fontColor : '#000000',

                        "fontWeight": _clipboard.textRectData.fontWeight ? _clipboard.textRectData.fontWeight : 'normal',
                        "linethrough": _clipboard.textRectData.linethrough ? _clipboard.textRectData.linethrough : false,
                        "underline": _clipboard.textRectData.underline ? _clipboard.textRectData.underline : false,
                        "fontStyle": _clipboard.textRectData.fontStyle ? _clipboard.textRectData.fontStyle : 'normal',


                    });

                    this.$emit('idAdd');   //this.cid = this.cid + 1;
                    this.cid = this.cid + 1;

                } else {

                    console.log("单个元素复制出来", _clipboard)
                    canvaobj = await this.createElement(_clipboard.isType, _clipboard);
                }


                /*if( _clipboard.isType ==='TextRect'){
               let objects = this.getObjectsNew();
               objects.forEach((obj)=>{
                   if(obj.id===canvaobj.id && obj.isType ==='TextRect-text'){

                       obj.set('fontFamily',_clipboard.textRectData.fontFamily);
                       obj.set('textAlign',_clipboard.textRectData.textAlign);
                       obj.set('fontSize',_clipboard.textRectData.fontSize);

                       obj.set('fontWeight',_clipboard.textRectData.fontWeight);
                       obj.set('linethrough',_clipboard.textRectData.linethrough);
                       obj.set('underline',_clipboard.textRectData.underline);
                       obj.set('fontStyle',_clipboard.textRectData.fontStyle);
                   }
               })
            }*/

                if (canvaobj) {
                    //console.log('元素返回(单个)：',canvaobj);
                    this.$emit('copydata', _clipboard, [canvaobj.id], _clipboard);
                    //  console.log('回调1111111')
                    this.$emit('copyidsdata', [canvaobj.id]);  //单个元素 复制
                    this.canvas.setActiveObject(canvaobj);
                }

            }
            this.clipboard = null;
            this.canvas.requestRenderAll();
        },

        //复制粘贴 操作（不用剪切板）
        copypaste() {
            //  console.log('当前页复制不用')
            let copydata = this.copyData();
            this.clipboard = copydata; //仅本画布复制保存
            this.paste(copydata);


        },

        //计算画布位置，初始化画布矩形  ********************************
        initBgRect(options) {
            let left = 0;
            let top = 0;
            if (this.boxWidth > this.width * this.canvasZoom) {
                left = this.boxWidth / 2 - this.width / 2;
            } else {
                left = 0;
            }

            if (this.boxHeight > this.height * this.canvasZoom) {
                top = this.boxHeight / 2 - this.height / 2;
            } else {
                top = 0;
            }
            //  console.log('灰色区域：',left,top);

            this.xLeft = -left;
            this.yTop = -top;

            this.$emit('setlefttop', left, top);

            this.setStackingtrue(); //设置画布存在图层先后
            this.scaleCalc();    //标尺计算

            options = Object.assign({
                width: this.width,
                height: this.height,
                left: 0,
                top: 0,
                padding: 0,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
            }, options);
            let rect = new fabric.Rect({
                ...options,
                left: left,
                top: top,
                type: 'sBg',
                name: 'background',
                component: "bg",
                isType: 'Rect',
                isDiff: 'none',
                selectable: false,
                visible: true,
                fill: '#fff',
                // fillColor: options.fillColor ? options.fillColor : '#fff',

                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                stopContextMenu: true,                            //禁掉鼠标右键默认事件
                hoverCursor: 'default',
                evented: false,

                hasControls: false,
                strokeWidth: 0,
                stroke: null,
                excludeFromExport: true, perPixelTargetFind: false,
            });
            //

            this.canvas.remove(...this.canvas.getObjects('sBg'));
            this.canvas.add(rect);
            rect.sendToBack();


            let x1, x2, y1, y2;
            if (this.boxWidth > this.width * this.canvasZoom) {
                x1 = this.boxWidth / 2 - this.width / 2;
                x2 = x1 + this.width;
            } else {
                x1 = 0;
                x2 = this.width;
            }
            if (this.boxHeight > this.height * this.canvasZoom) {
                y1 = this.boxHeight / 2 - this.height / 2;
                y2 = y1 + this.height;
            } else {
                y1 = 0;
                y2 = this.height;
            }

            let arrX = [0, x1, x2, x2 + x1];
            let arrY = [0, y1, y2, y2 + y1];


            const pathOption = {
                selectable: false,
                fill: '#f1f1f1',
                hoverCursor: 'default',
                evented: false,
                excludeFromExport: true,
                hasControls: false,
                perPixelTargetFind: false,
                strokeWidth: 0,
                stroke: null,
                originX: 'left',
                originY: 'top',
            }

            //console.log(x1,x2,y1,y2,arrX,arrY);

            /* const rect1 = new fabric.Rect({
            left: 0,
            top: 0,
            width: arrX[1] - arrX[0],
            height: arrY[3] - arrY[0]
        });
        const rect2 = new fabric.Rect({
            left:0 ,
            top: 0,
            width: arrX[3] + 2,
            height: arrY[1] - arrY[0]
        });
        const rect3 = new fabric.Rect({
            left: arrX[2],
            top: 0,
            width: arrX[3] - arrX[2],
            height: arrY[3] - arrY[0] + 2
        });
        const rect4 = new fabric.Rect({
            left: 0,
            top: arrY[2],
            width: arrX[3] ,
            height: arrY[3] - arrY[2]
        });*/

            const rect1 = new fabric.Rect({
                left: arrX[0],
                top: arrY[0],
                width: arrX[1] - arrX[0],
                height: arrY[3] - arrY[0]
            });
            const rect2 = new fabric.Rect({
                left: arrX[1],
                top: arrY[0],
                width: arrX[3] - arrX[1] + 2,
                height: arrY[1] - arrY[0]
            });
            const rect3 = new fabric.Rect({
                left: arrX[2],
                top: arrY[1] - 1,
                width: arrX[3] - arrX[2],
                height: arrY[2] - arrY[1] + 2
            });
            const rect4 = new fabric.Rect({
                left: arrX[1],
                top: arrY[2],
                width: arrX[3] - arrX[1],
                height: arrY[3] - arrY[2]
            });


            rect1.set({
                name: 'mask1',
                ...pathOption,
                 fill: 'red',
            })
            rect2.set({
                name: 'mask2',
                ...pathOption,
                fill: 'yellow',
            })
            rect3.set({
                name: 'mask3',
                ...pathOption,
                fill: 'blue',
            })
            rect4.set({
                name: 'mask4',
                ...pathOption,
                 fill: 'green',
            });
            this.canvas.remove(...this.canvas.getObjects('sMask'));

            let maskPath = new fabric.Group([rect1, rect2, rect3, rect4], {
                originX: 'left',
                originY: 'top',
                selectable: false,
                excludeFromExport: true,
                lockMovementX: true,
                lockMovementY: true,
                lockRotation: true,
                lockScalingX: true,
                lockScalingY: true,
                lockUniScaling: true,
                hoverCursor: 'auto',
                name: 'grid',
                left: 0,
                top: 0,
                type: 'sMask',
                evented: false
            });
            this.canvas.add(maskPath);
            maskPath.bringToFront();

            this.canvas.requestRenderAll();
            this.canvas.renderTop();
            this.canvas.renderAll();
        },
        //遮罩置顶
        setTop() {
            let objects = this.canvas.getObjects();
            objects.forEach((obj) => {
                //console.log(obj.zIndex);
                if (obj.type == 'sMask') {
                    // console.log('遮罩置顶')
                    obj.zIndex = -1;
                    obj.bringToFront();
                    this.canvas.renderTop();
                    this.canvas.renderAll();
                }
                if (obj.type == 'sRuler') {
                    // console.log('遮罩置顶')
                    obj.zIndex = -1;
                    obj.bringToFront();
                    this.canvas.renderTop();
                    this.canvas.renderAll();
                }
                if (obj.type == 'sBg') {
                    // console.log('背景置底')
                    obj.zIndex = -5;
                    obj.sendToBack();
                    this.canvas.renderTop();
                    this.canvas.renderAll();
                }
            })
        },

        //水平居中分布
        toHorizontalCenterDistribution() {
            var zoom = this.canvas.getZoom();
            var obj = this.getEditObj();
            // console.log(obj);
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text
                obj._objects.sort(function (a, b) {
                    return a.left - b.left;
                });
                for (var o in obj._objects) {

                    obj._objects[o].left = o * ((obj.getBoundingRect().width / (zoom * obj.scaleX)) / (obj._objects.length - 1)) - (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - o * ((obj._objects[o].width * obj._objects[o].scaleX) / (obj._objects.length - 1));

                    /* if (o > 0) {
              obj._objects[o].left = o * ((obj.getBoundingRect().width / this.canvasZoom) / (obj._objects.length - 1)) - (obj.getBoundingRect().width / this.canvasZoom) / 2 - o * ((obj._objects[o].width * obj._objects[o].scaleX) / (obj._objects.length - 1));
            } else {
              obj._objects[o].left = o * ((obj.getBoundingRect().width / this.canvasZoom) / (obj._objects.length - 1)) - (obj.getBoundingRect().width / this.canvasZoom) * obj._objects[o].scaleX / 2;
            }*/
                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }

                obj._objects.forEach((one, o) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('left', obj.left + o * ((obj.getBoundingRect().width / (zoom * obj.scaleX)) / (obj._objects.length - 1)) - (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - o * ((obj._objects[o].width * obj._objects[o].scaleX) / (obj._objects.length - 1)) - one.text.offsetLeft);
                        } else {
                            one.text.set('left', obj.left + o * ((obj.getBoundingRect().width / (zoom * obj.scaleX)) / (obj._objects.length - 1)) - (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - o * ((obj._objects[o].width * obj._objects[o].scaleX) / (obj._objects.length - 1)));
                        }

                    }
                });

                this.canvas.renderTop();
                this.canvas.renderAll();
            }


        },
        //垂直居中分布
        toVerticalCenterDistribution() {
            var zoom = this.canvas.getZoom();
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text
                obj._objects.sort(function (a, b) {
                    return a.top - b.top;
                });
                for (var o in obj._objects) {
                    obj._objects[o].top = o * ((obj.getBoundingRect().height / (zoom * obj.scaleY)) / (obj._objects.length - 1)) - (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - o * ((obj._objects[o].height * obj._objects[o].scaleY) / (obj._objects.length - 1));

                    /*if (o > 0) {
              obj._objects[o].top = o * ((obj.getBoundingRect().height / this.canvasZoom) / (obj._objects.length - 1)) - (obj.getBoundingRect().height / this.canvasZoom) / 2 - o * ((obj._objects[o].height * obj._objects[o].scaleY) / (obj._objects.length - 1));
            } else {
              obj._objects[o].top = o * ((obj.getBoundingRect().height / this.canvasZoom) / (obj._objects.length - 1)) - (obj.getBoundingRect().height / this.canvasZoom) / 2;
            }*/

                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }

                obj._objects.forEach((one, o) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('top', obj.top + o * ((obj.getBoundingRect().height / (zoom * obj.scaleY)) / (obj._objects.length - 1)) - (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - o * ((obj._objects[o].height * obj._objects[o].scaleY) / (obj._objects.length - 1)) - one.text.offsetTop);
                        } else {
                            one.text.set('top', obj.top + o * ((obj.getBoundingRect().height / (zoom * obj.scaleY)) / (obj._objects.length - 1)) - (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - o * ((obj._objects[o].height * obj._objects[o].scaleY) / (obj._objects.length - 1)));
                        }

                    }
                });

                this.canvas.renderTop();
                this.canvas.renderAll();
            }

        },
        //左对齐
        toLeftAlign() {
            var zoom = this.canvas.getZoom();
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text

                for (var o in obj._objects) {

                    obj._objects[o].left = -(obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2;
                    //this.getactiveobj(obj._objects[o].id).marginLeft = obj.getBoundingRect().left;

                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }

                obj._objects.forEach((one) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('left', obj.left - (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - one.text.offsetLeft);
                        } else {
                            one.text.set('left', obj.left - (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2);
                        }

                    }
                });


                this.canvas.requestRenderAll();

                this.canvas.renderTop();
                this.canvas.renderAll();
            }

        },
        //水平居中对齐
        toHorizontalCenterAlign() {
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text
                for (var o in obj._objects) {
                    obj._objects[o].left = -(obj._objects[o].width * obj._objects[o].scaleX) / 2;

                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }
                obj._objects.forEach((one) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('left', obj.left - (obj._objects[o].width * obj._objects[o].scaleX) / 2 - one.text.offsetLeft);
                        } else {
                            one.text.set('left', obj.left - (obj._objects[o].width * obj._objects[o].scaleX) / 2);
                        }

                    }
                });
                this.canvas.renderTop();
                this.canvas.renderAll();
            }


        },
        //右对齐
        toRightAlign() {
            var zoom = this.canvas.getZoom();
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            let Textincludes = []; //用于筛选被滑动多选选中的text
            if (obj._objects) {
                for (var o in obj._objects) {
                    obj._objects[o].left = (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - (obj._objects[o].width * obj._objects[o].scaleX);

                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }
                obj._objects.forEach((one) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('left', obj.left + (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - (obj._objects[o].width * obj._objects[o].scaleX) - one.text.offsetLeft);
                        } else {
                            one.text.set('left', obj.left + (obj.getBoundingRect().width / (zoom * obj.scaleX)) / 2 - (obj._objects[o].width * obj._objects[o].scaleX));
                        }

                    }
                });
                this.canvas.renderTop();
                this.canvas.renderAll();
            }

        },
        //顶对齐
        toTopAlign() {
            var zoom = this.canvas.getZoom();
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text
                for (var o in obj._objects) {
                    obj._objects[o].top = -(obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2;
                    // this.getactiveobj(obj._objects[o].id).marginTop = obj.getBoundingRect().top;
                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }
                obj._objects.forEach((one) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('top', obj.top - (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - one.text.offsetTop);
                        } else {
                            one.text.set('top', obj.top - (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2);
                        }

                    }
                });
                this.canvas.renderTop();
                this.canvas.renderAll();
            }

        },
        //垂直居中对齐
        toVerticalCenterAlign() {
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text
                for (var o in obj._objects) {
                    obj._objects[o].top = -(obj._objects[o].height * obj._objects[o].scaleY) / 2;
                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }
                obj._objects.forEach((one) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('top', obj.top - (obj._objects[o].height * obj._objects[o].scaleY) / 2 - one.text.offsetTop);
                        } else {
                            one.text.set('top', obj.top - (obj._objects[o].height * obj._objects[o].scaleY) / 2);
                        }

                    }
                });
                this.canvas.renderTop();
                this.canvas.renderAll();
            }

        },
        //底对齐
        toBottomAlign() {
            var zoom = this.canvas.getZoom();
            var obj = this.getEditObj();
            if (!obj) {
                return;
            }
            if (obj._objects) {
                let Textincludes = []; //用于筛选被滑动多选选中的text
                for (var o in obj._objects) {
                    obj._objects[o].top = (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - (obj._objects[o].height * obj._objects[o].scaleY);
                    if (obj._objects[o].isType === 'TextRect-text') {
                        Textincludes.push(obj._objects[o].id);
                    }
                }
                obj._objects.forEach((one) => {
                    if (one.isType === 'TextRect' && Textincludes.indexOf(one.id) === -1) { //部分文本编辑后不会被滑动多选选中

                        if (one.isElasticSize === 2) {
                            one.text.set('top', obj.top + (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - (obj._objects[o].height * obj._objects[o].scaleY) - one.text.offsetTop);
                        } else {
                            one.text.set('top', obj.top + (obj.getBoundingRect().height / (zoom * obj.scaleY)) / 2 - (obj._objects[o].height * obj._objects[o].scaleY));
                        }

                    }
                });
                this.canvas.renderTop();
                this.canvas.renderAll();
            }

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

        //画条码
        drawbarcode(number, option) {
            //console.log(option);
            return new Promise(function (resolve, reject) {

                let barbox = document.getElementById('barbox');
                let bardom = document.createElement('img');
                let barid = 'barcode' + option.id;
                bardom.id = 'barcode' + option.id;
                let allnode = barbox.childNodes;
                let ids = [];  //所有子节点的id集合
                allnode.forEach((node) => {
                    ids.push(node.getAttribute('id'));
                });
                if (ids.indexOf(barid) == -1) {
                    barbox.appendChild(bardom);//为了解决多个条码，他们用图需要不一样
                }

                // console.log(barbox,bardom);

                JsBarcode('#barcode' + option.id, number, {
                    format: option.format ? option.format : "CODE128",  //条形码的格式
                    lineColor: option.lineColor ? option.lineColor : "#000000",  //线条颜色
                    margin: option.margin ? option.margin : 0, // 条码四边空白（默认为10px）
                    width: option.lineWidth ? option.lineWidth : 2, //线宽
                    height: option.height ? option.height : 20,  //条码高度
                    displayValue: false //是否显示文字信息
                });

                document.getElementById('barcode' + option.id).onload = () => {
                    // console.log(document.getElementById("barcode").src);
                    let img = document.getElementById('barcode' + option.id).src;
                    resolve(img);
                };
                document.getElementById('barcode' + option.id).onerror = function () {
                    reject(new Error('barcode is error!'));
                };


            });
        },

        /**
         * 创建元素
         * @param name   : Rect, Rectangle, Parallelogram, Circle, Dottedline, EqualTriangle, Image, Barcode, Qrcode, Text
         * @param options: id, name, left, top, width, height, angle, padding, scaleX,  scaleY, selectable, visible, fill,
         *  fillColor，backgroundColor, stroke, strokeWidth, strokeDashArray,
         *  rx, ry,
         *  skewX,
         *  DottedlineType ,
         *  radius ,
         *  url,
         *  imgData,
         * @return obj
         * */
        async createElement(name, options) {
            if (!name) {
                return
            }
            // this.discardActive();
            let canvasObject, newOptions;
            //console.log(options);
            return new Promise(async (resolve, reject) => {

                let canvas = this.canvas;
                let that = this;

                options = {
                    ...options,
                    id: options.id ? options.id : 1,
                    zIndex: options.zIndex ? options.zIndex : 1,

                    component: "component",
                    isDiff: 'static',
                    padding: 0,
                    scaleX: options.scaleX ? options.scaleX : 1,
                    scaleY: options.scaleY ? options.scaleY : 1,
                    flipX: false,
                    flipY: false,
                    originX: 'left',
                    originY: 'top',
                    stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                    minScaleLimit: 0.0001,                            //  最小限制
                    lockSkewingX: true,                               //  禁掉按住shift时的变形
                    lockSkewingY: true,

                    left: options.left ? -this.xLeft + options.left : -this.xLeft,
                    top: options.top ? -this.yTop + options.top : -this.yTop,
                    width: options.width ? options.width : 60,
                    height: options.height ? options.height : 30,
                    angle: options.angle ? options.angle : 0,

                    fill: options.fill ? options.fill : '#000000',                                            // 填充的颜色（矩形）
                    fillColor: options.fillColor ? options.fillColor : 'rgba(0,0,0,0)',                              // 填充的颜色

                    backgroundColor: options.backgroundColor ? options.backgroundColor : '',   // 边框填充的颜色
                    stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                    strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                    strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                    selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中
                    visible: options.visible,                          //元素是否可见 options.visible!==false ? true :

                    eyeshow: options.eyeshow ? options.eyeshow : true, //眼睛

                    hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,

                    screenIndex: options.screenIndex ? options.screenIndex : 0,
                };
                //console.warn(options.visible);

                //  console.log('rect',options)
                switch (name) {
                    case 'Rect':              //----------------------------------------------------------------------------------------矩形
                        newOptions = {
                            ...options,
                            fill: options.color ? options.color : '#000000',
                            isType: 'Rect',
                            name: options.name ? options.name : 'Rect',
                            rx: 0,
                            ry: 0,
                        };
                        canvasObject = new fabric.Rect({...newOptions});          //创建
                        canvasObject.on('scaled', (e) => {
                            // console.log('scaling',e);
                            e.target.set('width', parseInt(e.target.width * e.target.scaleX));
                            e.target.set('height', parseInt(e.target.height * e.target.scaleY));
                            e.target.set('scaleX', 1);
                            e.target.set('scaleY', 1);
                        });

                        break;
                    case 'Rectangle':         //----------------------------------------------------------------------------------------圆角矩形
                        newOptions = {
                            ...options,
                            isType: 'Rectangle',
                            name: options.name ? options.name : 'Rectangle',
                            rx: options.rx ? options.rx : 15,
                            ry: options.ry ? options.ry : 15,
                        };
                        canvasObject = new fabric.Rect({...newOptions});          //创建
                        canvasObject.on('scaled', (e) => {
                            // console.log('scaling',e);
                            e.target.set('width', parseInt(e.target.width * e.target.scaleX));
                            e.target.set('height', parseInt(e.target.height * e.target.scaleY));
                            e.target.set('scaleX', 1);
                            e.target.set('scaleY', 1);
                        });
                        break;
                    case 'Parallelogram':     //----------------------------------------------------------------------------------------平行四边形
                        newOptions = {
                            ...options,
                            isType: 'Parallelogram',
                            name: options.name ? options.name : 'Parallelogram',
                            rx: 0,
                            ry: 0,
                            skewX: options.skewX ? options.skewX : -45,
                            skewY: 0,   //暂不允许y轴变形吧 options.skewY?options.skewY:0,
                        };
                        canvasObject = new fabric.Rect({...newOptions});          //创建
                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;
                    case 'Circle':            //----------------------------------------------------------------------------------------椭圆形
                        newOptions = {
                            ...options,
                            isType: 'Circle',
                            name: options.name ? options.name : 'Circle',
                            rx: options.width / 2,      // options.rx?options.rx:15,
                            ry: options.height / 2,     // options.ry?options.ry:15,
                        };
                        canvasObject = new fabric.Ellipse({...newOptions});          //创建
                        canvasObject.on('scaled', (e) => {
                            // console.log('scaling',e);
                            e.target.set('rx', parseInt(e.target.width * e.target.scaleX / 2));
                            e.target.set('ry', parseInt(e.target.height * e.target.scaleY / 2));
                            e.target.set('scaleX', 1);
                            e.target.set('scaleY', 1);
                        });
                        break;
                    case 'EqualCircle':            //----------------------------------------------------------------------------------------正圆
                        newOptions = {
                            ...options,
                            isType: 'EqualCircle',
                            name: options.name ? options.name : 'EqualCircle',
                            radius: options.width / 2,
                        };
                        canvasObject = new fabric.Circle({...newOptions});          //创建
                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;
                    case 'Dottedline':        //----------------------------------------------------------------------------------------线段
                        newOptions = {
                            ...options,
                            isType: 'Dottedline',
                            name: options.name ? options.name : 'Dottedline',
                            DottedlineType: options.DottedlineType ? options.DottedlineType : 1,
                            strokeDashArray: options.DottedlineType === 3 ? [10, 4, 3, 4] : (options.DottedlineType === 2 ? [8, 2] : [0, 0]),
                            stroke: options.stroke ? options.stroke : '#000000',
                            strokeWidth: options.strokeWidth,
                        };
                        let x1 = -this.xLeft + options.left;
                        let x2 = -this.xLeft + options.left + options.width;
                        let y1 = -this.yTop + options.top;
                        let y2 = -this.yTop + options.top;
                        canvasObject = new fabric.Line([x1, y1, x2, y2], {...newOptions});          //创建
                        canvasObject.setControlsVisibility({                                     //左上、左下、右上、右下 取消
                            bl: false,
                            br: false,
                            mb: true,
                            ml: true,
                            mr: true,
                            mt: true,
                            mtr: true,
                            tl: false,
                            tr: false
                        });
                        canvasObject.on('scaled', (e) => {
                            // console.log('scaling',e);
                            e.target.set('width', parseInt(e.target.width * e.target.scaleX));
                            e.target.set('height', parseInt(e.target.height * e.target.scaleY));
                            e.target.set('scaleX', 1);
                            e.target.set('scaleY', 1);
                        });
                        break;
                    case 'EqualTriangle':     //----------------------------------------------------------------------------------------等边三角
                        newOptions = {
                            ...options,
                            width: 60,
                            height: 52,
                            isType: 'EqualTriangle',
                            name: options.name ? options.name : 'EqualTriangle',
                        };
                        console.log(newOptions);
                        canvasObject = new fabric.Triangle({...newOptions});          //创建
                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;
                    case 'star'://-----------------------------------------------------------------五角星


                        options = {
                            width: 180,
                            height: 188,
                            left: options.left,
                            top: options.top,
                        };
                        let startpoints = [
                            {
                                x: options.width / 2,
                                y: 0,
                            },
                            {
                                x: options.width / 2 - options.width * Math.sin(18 * Math.PI / 180),
                                y: options.width * Math.cos(18 * Math.PI / 180),
                            },
                            {
                                x: options.width,
                                y: options.width * Math.sin(18 * Math.PI / 180) / Math.cos(36 * Math.PI / 180) * Math.cos(18 * Math.PI / 180)
                            },
                            {
                                x: 0,
                                y: options.width * Math.sin(18 * Math.PI / 180) / Math.cos(36 * Math.PI / 180) * Math.cos(18 * Math.PI / 180)
                            },
                            {
                                x: options.width / 2 + options.width * Math.sin(18 * Math.PI / 180),
                                y: options.width * Math.cos(18 * Math.PI / 180),
                            },

                        ];

                        //console.log(startpoints);

                        /*startpoints = [{
                          x:295,
                          y:10
                      }, {
                          x:235,
                          y:198
                      }, {
                          x:385,
                          y:78
                      }, {
                          x:205,
                          y:78
                      }, {
                          x:355,
                          y:198
                      }];*/
                        canvasObject = new fabric.Polygon(startpoints, {
                            isType: 'star',
                            originX: 'left',
                            originY: 'top',
                            left: options.left,
                            top: options.top,
                            fill: 'rgba(0,0,0,1)',
                            /*stroke:'green',
                          strokeDashArray:[10]*/
                        });

                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;
                    case 'Hexagon':  //-----------------------------------------------------------正六边形
                        newOptions = {
                            width: 100,
                            height: 100,
                            left: options.left,
                            top: options.top,
                        };
                        // 计算半径，边长
                        const R = Math.sqrt((newOptions.width) * (newOptions.width) + (newOptions.height) * (newOptions.height)) / 2;
                        // 6条边的坐标点（60是六边形的内角度数）
                        const points = Array.from({length: 6}).map((item, index) => {
                            return {
                                x: Math.cos(60 * index / 180 * Math.PI) * R,
                                y: Math.sin(60 * index / 180 * Math.PI) * R
                            }
                        });
                        canvasObject = new fabric.Polygon(points, {
                            originX: 'left',
                            originY: 'top',
                            left: options.left,
                            top: options.top,
                            isType: 'Hexagon',
                            fill: "#ff0000",
                            /* stroke:'green',
                          strokeWidth: 3,
                           strokeDashArray:[10]*/
                            width: Math.sqrt(Math.pow(newOptions.height, 2) + Math.pow(newOptions.height / 2.0, 2)),
                            height: newOptions.height,
                        });

                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;

                    case 'Image':             //----------------------------------------------------------------------------------------图片
                        canvasObject = await that.createURLImage(options);
                        //console.log(canvasObject);
                        //  return canvasObject;
                        break;
                    case 'Image2':             //----------------------------------------------------------------------------------------图片
                        canvasObject = await that.createURLImage(options);
                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        return canvasObject;
                    case 'Image3':             //----------------------------------------------------------------------------------------图片
                        canvasObject = await that.createURLImage(options);
                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: true,
                            ml: true,
                            mr: true,
                            mt: true,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        return canvasObject;

                    case 'Icon':             //----------------------------------------------------------------------------------------图片
                        canvasObject = await that.createIcon(options);

                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: true,
                            ml: true,
                            mr: true,
                            mt: true,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        resolve(canvasObject);
                        return canvasObject;
                    case 'duanImage':
                        canvasObject = await that.createDuan(options);
                        console.warn(canvasObject);
                        return canvasObject;
                    case 'equalImage':
                        // console.warn('equalImage',options);
                        canvasObject = that.createEqualImageImage(options);
                        return canvasObject;
                    case 'Barcode':           //----------------------------------------------------------------------------------------条码
                        canvasObject = await that.createBarcode(options);
                        resolve(canvasObject);
                        return canvasObject;
                    case 'Barcodematrix':           //----------------------------------------------------------------------------------------条码
                        canvasObject = await that.createBarcodedatamatrix(options);
                        resolve(canvasObject);
                        return canvasObject;
                    case 'Qrcode':            //----------------------------------------------------------------------------------------二维码
                        options.imgText = options.imgText ? options.imgText : '123456789';
                        if(options.barcodeType===0){

                        }
                        canvasObject = await that.createQrcode(options);
                        resolve(canvasObject);
                        return canvasObject;
                    case 'Text':             //-----------------------------------------------------------------------------------------可编辑文本
                        canvasObject = await this.createText(options.textdemo, options);
                        break;
                    case 'Time':         //----------------------------------------------------------------------------------------- 不可编辑时间
                        newOptions = {
                            ...options,
                            isType: 'Time',
                            name: options.name ? options.name : 'Time',
                        };
                        canvasObject = new fabric.Text(options.textdemo, newOptions);
                        canvasObject.setControlsVisibility({                        //上中、下中、左中、右中 取消
                            bl: true,
                            br: true,
                            mb: false,
                            ml: false,
                            mr: false,
                            mt: false,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;
                    case 'Itext':
                        newOptions = {
                            ...options,
                            isType: 'Itext',
                            name: options.name ? options.name : 'Itext',
                        };
                        canvasObject = new fabric.IText(options.textdemo, {...newOptions});

                        break;
                    case 'Textbox':
                        newOptions = {
                            ...options,
                            isType: 'Textbox',
                            name: options.name ? options.name : 'Textbox',
                            breakWords: true,

                        };
                        canvasObject = new fabric.Textbox(options.textdemo, {...newOptions});

                        break;

                    case 'TextRectBox':

                        let newOptions1 = {

                            width: options.width,
                            height: options.height,
                            content: options.content ? options.content : 'Text',
                            fontSize: options.fontSize ? options.fontSize : 14,
                            fontType: options.fontType ? options.fontType : "微软雅黑",
                            fill: options.color ? options.color : '',
                            textAlign: !options.horizontalAlign || options.horizontalAlign === 0 ? 'left' : (options.horizontalAlign === 1 ? 'center' : 'right'),
                            fontWeight: options.ifBold === 1 ? 'bold' : 'normal',
                            linethrough: options.ifStrikeThrough === 1 ? true : false,
                            underline: options.ifUnderline === 1 ? true : false,
                            fontStyle: options.ifItalic === 1 ? 'italic' : 'normal',
                            lineHeight: (options.fontSize + options.verticalSpace) / options.fontSize,


                            prefix: options.prefix,
                            postfix: options.postfix,

                            maxLines: options.maxLines ? options.maxLines : 3,
                            omitStyle: options.omitStyle ? options.omitStyle : 0,
                            lineBreak: options.lineBreak ? options.lineBreak : '',
                            omitStyleText: options.omitStyle === 0 ? '无' : '…',
                            newline: options.lineBreak ? options.lineBreak : '',

                            originX: 'left',
                            originY: 'top',
                            backgroundColor: '',
                            isType: 'TextRectBox-text',
                            name: options.name ? options.name : 'TextRectBox-text',
                            splitByGrapheme: true,
                            breakWords: true,


                        };
                        let text = new fabric.Textbox(options.prefix + options.content + options.postfix, {...newOptions1});

                        let newtext = this.newtextStyleFormat(text, options.prefix + options.content + options.postfix);
                        text.set({
                            text: newtext,
                        });

                        /* let styles = this.newstyles(options,newtext);
                      text.set({
                          'styles':styles,
                      });*/


                        let newOptions2 = {
                            width: options.width,
                            height: options.height,

                            fill: options.fillColor ? options.fillColor : 'rgba(0,0,0,0)',
                            stroke: options.borderColor ? options.borderColor : '',
                            strokeWidth: options.lineWeight ? options.lineWeight : 0,
                            strokeDashArray: options.borderType === 1 ? [0, 0] : (options.borderType === 2 ? [5, 1] : options.borderType === 3 ? [5, 2, 1, 2] : [0, 0]),


                            originX: 'center',
                            originY: 'center',
                            isType: 'TextRectBox-rect',
                            name: options.name ? options.name : 'TextRectBox-rect',
                            rx: 0,
                            ry: 0,
                            left: 0,
                            top: 0,

                        };
                        let rect = new fabric.Rect({...newOptions2});          //创建

                        canvasObject = new fabric.Group([rect, text], {
                            padding: 0,
                            /* ...options,*/

                            originX: 'left',
                            originY: 'top',
                            name: options.name ? options.name : 'TextRectBox',
                            isType: 'TextRectBox',
                            component: "component",
                            isDiff: 'static',

                            left: options.left,
                            top: options.top,
                            id: options.id,
                            copyId: options.copyId,
                            zIndex: options.zIndex,

                            angle: options.angle,
                            width: options.width,
                            height: options.height,

                            visible: options.visible,
                            selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中


                            type: options.type ? options.type : 'TextRectBox',
                            barcodeType: options.barcodeType ? options.barcodeType : 10,

                            /* borderColor: options.borderColor?options.borderColor:"",
                          borderType: options.borderType?options.borderType:0,*/
                            stroke: options.borderColor ? options.borderColor : '',                            //记录边框等信息，编辑时回显在矩形上
                            strokeWidth: options.lineWeight ? options.lineWeight : 0,
                            strokeDashArray: options.borderType === 1 ? [0, 0] : (options.borderType === 2 ? [5, 1] : options.borderType === 3 ? [5, 2, 1, 2] : [0, 0]),

                            conRealResult: options.conRealResult ? options.conRealResult : 1,
                            content: options.content ? options.content : "TEXT1",
                            dateFormat: "",
                            decimalSeparator: options.decimalSeparator ? options.decimalSeparator : ".",
                            thousandSeparator: options.thousandSeparator ? options.thousandSeparator : ",",

                            fieldCode: "",
                            fillColor: "",
                            fontSize: options.fontSize ? options.fontSize : 14,
                            fontType: options.fontType ? options.fontType : "微软雅黑",

                            ifBold: options.ifBold ? options.ifBold : 0,
                            ifCondition: options.ifCondition ? options.ifCondition : 0,
                            ifItalic: options.ifItalic ? options.ifItalic : 0,
                            ifStrikeThrough: options.ifStrikeThrough ? options.ifStrikeThrough : 0,
                            ifUnderline: options.ifUnderline ? options.ifUnderline : 0,

                            icon: null,
                            itemOrder: options.itemOrder ? options.itemOrder : 1,
                            itemPictureNameId: options.itemPictureNameId ? options.itemPictureNameId : null,
                            layer: options.layer ? options.layer : 0,

                            lineBreak: options.lineBreak ? options.lineBreak : "",
                            lineWeight: options.lineWeight ? options.lineWeight : 0,
                            marginLeft: options.marginLeft ? options.marginLeft : 0,
                            marginTop: options.marginTop ? options.marginTop : 0,

                            maxLines: options.maxLines ? options.maxLines : 3,
                            minFontSize: options.minFontSize ? options.minFontSize : 12,
                            omitStyle: options.omitStyle ? options.omitStyle : 0,
                            postfix: options.postfix ? options.postfix : "",
                            prefix: options.prefix ? options.prefix : "",

                            scaleX: options.scaleX ? options.scaleX : 1,
                            scaleY: options.scaleY ? options.scaleY : 1,
                            templateBaseId: options.templateBaseId ? options.templateBaseId : null,

                            textAdvanceProperty: options.textAdvanceProperty ? options.textAdvanceProperty : 0,  //是自适应还是不使用还是弹性

                            verticalAlign: options.verticalAlign ? options.verticalAlign : 0,
                            horizontalAlign: options.horizontalAlign ? options.horizontalAlign : 0,
                            verticalSpace: options.verticalSpace ? options.verticalSpace : 0,


                            lockRotation: false,
                            flipX: false,
                            flipY: false,
                            lockSkewingX: true,                  //禁掉按住shift时的变形
                            lockSkewingY: true,

                            hasRotatingPoint: true,                          //元素是否旋转

                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,
                        });
                        canvasObject.item(0).set({
                            left: 0,
                            top: 0,

                        });
                        canvasObject.item(1).set({
                            top: -options.height / 2,
                            left: -options.width / 2,
                            width: options.width,
                            height: options.height,

                        });

                        canvasObject.set({
                            clipTo: function (ctx) {
                                ctx.rect(-canvasObject.width / 2,
                                    -canvasObject.height / 2,
                                    canvasObject.width,
                                    canvasObject.height);
                            }
                        });

                        // Utils.registeObjectEvent(this, canvasObject);
                        canvasObject.on('mousedblclick', (e) => {
                            console.log('mousedblclick', e);
                            this.canvas.preserveObjectStacking = true
                            e.target._objects[1].selectable = true
                            e.target._objects[1].evented = true
                            this.canvas.setActiveObject(e.target._objects[1])
                            e.target._objects[1].enterEditing();

                            e.target.selectable = false;
                            e.target._objects[0].evented = false;
                            this.canvas.renderAll.bind(this.canvas);

                            e.target._objects[1].set({
                                top: -e.target.height / 2,
                                left: -e.target.width / 2,
                            });

                        });
                        canvasObject.on('scaling', function (e) {

                            e.target._objects[1].set({
                                width: e.target.width * e.target.scaleX,
                                height: e.target.height * e.target.scaleY,

                                scaleX: 1 / e.target.scaleX,
                                scaleY: 1 / e.target.scaleY,
                            });

                            canvasObject.set({
                                clipTo: function (ctx) {
                                    ctx.rect(-canvasObject.width / 2,
                                        -canvasObject.height / 2,
                                        canvasObject.width,
                                        canvasObject.height);
                                }
                            });


                            this.canvas.requestRenderAll();
                            this.canvas.renderAll();
                        });
                        // let that = this;
                        canvasObject.on('scaled', function (e) {
                            //console.log('scaling',e.target.width,e.target.scaleX);

                            // console.log(e.target.prefix + e.target.content +e.target.postfix);
                            let newtext = that.newtextStyleFormat(e.target._objects[1], e.target.prefix + e.target.content + e.target.postfix);

                            e.target._objects[1].set({
                                text: newtext,
                            });
                            e.target._objects[1].set({
                                top: -e.target.height / 2,
                                left: -e.target.width / 2,
                            });
                            that.canvas.requestRenderAll();
                            that.canvas.renderAll();
                        });


                        canvasObject.setControlsVisibility({
                            bl: true,
                            br: true,
                            mb: true,
                            ml: true,
                            mr: true,
                            mt: true,
                            mtr: true,
                            tl: true,
                            tr: true
                        });
                        break;
                    case 'Html':
                        let styleU = {
                            underline: true,
                        };
                        let styleI = {
                            fontStyle: 'italic',
                        };
                        let styleB = {
                            fontWeight: 'bold',
                        };
                        let styleS = {
                            linethrough: true,
                        };
                        let styleH = {
                            fill: '#f00',
                        };
                        newOptions = {
                            ...options,
                            isType: 'Html',
                            name: options.name ? options.name : 'Html',
                            breakWords: true,
                            fontFamily: "宋体",
                            lineHeight: 1.5,
                            editable: false,
                            /*textBackgroundColor:'#fff',*/
                            backgroundColor: '#FFFFFF',
                            styles: {
                                0: {
                                    23: styleB,
                                    24: styleB,
                                    25: styleB,
                                    26: styleB,

                                    28: styleI,
                                    29: styleI,
                                    30: styleI,
                                    31: styleI,
                                    32: styleI,
                                    33: styleI,

                                    35: styleU,
                                    36: styleU,
                                    37: styleU,
                                    38: styleU,
                                    39: styleU,
                                    40: styleU,
                                    41: styleU,
                                    42: styleU,
                                    43: styleU,

                                    45: styleS,
                                    46: styleS,
                                    47: styleS,
                                    48: styleS,
                                    49: styleS,
                                    50: styleS,
                                    51: styleS,
                                    52: styleS,
                                    53: styleS,
                                    54: styleS,

                                    60: styleH,
                                    61: styleH,
                                    62: styleH,
                                    63: styleH,
                                    64: styleH,


                                },
                                1: {
                                    0: styleB,
                                    1: styleB,
                                    2: styleB,
                                    3: styleB,

                                    5: styleI,
                                    6: styleI,
                                    7: styleI,
                                    8: styleI,
                                    9: styleI,
                                    10: styleI,

                                    12: styleU,
                                    13: styleU,
                                    14: styleU,
                                    15: styleU,
                                    16: styleU,
                                    17: styleU,
                                    18: styleU,
                                    19: styleU,
                                    20: styleU,
                                    21: styleU,

                                },
                                2: {
                                    0: styleS,
                                    1: styleS,
                                    2: styleS,
                                    3: styleS,
                                    4: styleS,
                                    5: styleS,
                                    6: styleS,
                                    7: styleS,
                                    8: styleS,
                                    9: styleS,

                                    15: styleH,
                                    16: styleH,
                                    17: styleH,
                                    18: styleH,
                                    19: styleH,

                                }
                            },
                        };
                        canvasObject = new fabric.Textbox('Test HTML text display ' +
                            'bold italic underline ' +
                            'underscore and color.', {...newOptions});

                        canvasObject.set({height:newOptions.height,
                            clipTo: function (ctx) {
                                ctx.rect(-canvasObject.width / 2,
                                    -canvasObject.height / 2,
                                    canvasObject.width,
                                    canvasObject.height);
                            }
                        });

                        canvasObject.setControlsVisibility({
                            bl: false,
                            br: false,
                            mb: true,
                            ml: true,
                            mr: true,
                            mt: true,
                            mtr: true,
                            tl: false,
                            tr: false
                        });

                        break;
                    case 'TextRect':
                        //-----------------------------------------------------------------------------------------可编辑文本加： 边距 背景 边框
                        // console.warn('文本矩形参数：',options.zIndex);


                        const rectOptions = {
                            id: options.id,
                            zIndex: options.zIndex ? options.zIndex : options.id,

                            copyId: options.copyId,
                            type: options.type,
                            left: options.left,
                            top: options.top,
                            angle: options.angle,

                            xLeft: options.xLeft ? options.xLeft : 0,
                            xRight: options.xRight ? options.xRight : 0,
                            yTop: options.yTop ? options.yTop : 0,
                            yBot: options.yBot ? options.yBot : 0,

                            width: options.width,
                            height: options.height,
                            fill: '',  //options.rectColor?(options.rectColor===''?'rgba(0,0,0,0)':options.rectColor):
                            rectColor: options.rectColor ? options.rectColor : '#ffffff',

                            stroke: options.stroke ? options.stroke : '',
                            strokeWidth: options.strokeWidth ? options.strokeWidth : null,
                            strokeDashArray: [3, 1],

                            fontColor: options.fontColor ? options.fontColor : '#000000',
                            fontSize: options.fontSize ? options.fontSize : 14,
                            fontFamily: options.fontFamily ? options.fontFamily : '微软雅黑',
                            textdemo: options.textdemo ? options.textdemo : 'TextRect',
                            isElasticSize: options.isElasticSize ? options.isElasticSize : 0,

                            minScaleLimit: 0.2,
                            flipX: false,
                            flipY: false,
                            lockSkewingX: true,                  //禁掉按住shift时的变形
                            lockSkewingY: true,
                            lockScalingFlip: true,

                            originX: 'left',
                            originY: 'top',
                            component: "component",
                            isType: 'TextRect',
                            isDiff: 'static',
                            name: options.name ? options.name : 'TextRect',
                            hasRotatingPoint: options.hasRotatingPoint,

                            textAlign: options.textAlign ? options.textAlign : 'left',


                            maxLines: options.maxLines ? options.maxLines : 10,
                            minFontSize: options.minFontSize ? options.minFontSize : 12,
                            omitStyle: options.omitStyle ? options.omitStyle : 0,
                            omitStyleText: options.omitStyleText ? options.omitStyleText : '无',
                            newline: options.newline ? options.newline : '',

                            verticalSpace: options.verticalSpace ? options.verticalSpace : 0,

                            visible: options.visible,
                            eyeshow: options.eyeshow,

                            screenIndex: options.screenIndex,
                        };
                        const textOptions = {
                            id: options.id,
                            zIndex: options.zIndex + 0.5 ? options.zIndex + 0.5 : options.id + 0.5,
                            copyId: options.copyId,
                            type: options.type,
                            angle: options.angle,

                            left: options.left,
                            top: options.top,
                            xLeft: options.xLeft ? options.xLeft : 0,
                            xRight: options.xRight ? options.xRight : 0,
                            yTop: options.yTop ? options.yTop : 0,
                            yBot: options.yBot ? options.yBot : 0,


                            width: options.width,
                            height: options.height,

                            fill: options.fontColor ? options.fontColor : '#000000',
                            fontSize: options.fontSize ? options.fontSize : 14,

                            fontColor: options.fontColor ? options.fontColor : '#000000',
                            fontFamily: options.fontFamily ? options.fontFamily : '微软雅黑',
                            textdemo: options.textdemo ? options.textdemo : 'TextRect',


                            textAlign: options.textAlign ? options.textAlign : 'left',

                            originX: 'left',
                            originY: 'top',
                            component: "component",
                            isType: 'TextRect-text',
                            isDiff: 'static',
                            name: options.name ? options.name : 'TextRect',

                            fontWeight: options.fontWeight ? options.fontWeight : 'normal',
                            linethrough: options.linethrough ? options.linethrough : false,
                            underline: options.underline ? options.underline : false,
                            fontStyle: options.fontStyle ? options.fontStyle : 'normal',

                            splitByGrapheme: true,
                            lockScalingFlip: true,
                            minScaleLimit: 0.2,
                            hasRotatingPoint: options.hasRotatingPoint,

                            isElasticSize: options.isElasticSize ? options.isElasticSize : 0,

                            maxLines: options.maxLines ? options.maxLines : 10,
                            minFontSize: options.minFontSize ? options.minFontSize : 12,
                            omitStyle: options.omitStyle ? options.omitStyle : 0,
                            omitStyleText: options.omitStyleText ? options.omitStyleText : '无',
                            newline: options.newline ? options.newline : '',

                            verticalSpace: options.verticalSpace ? options.verticalSpace : 0,

                            visible: options.visible,
                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,

                        };

                        /*  */
                        //console.warn(textOptions.visible,rectOptions.visible);
                        rectOptions.textRectData = textOptions;
                        canvasObject = new fabric.RectWithText(rectOptions, textOptions, options.textdemo);

                        /* this.$emit('idAdd');   //this.cid = this.cid + 1;
                       this.cid = this.cid + 1;*/

                        canvasObject.setCoords();

                         console.log('999999999999999999999999',canvasObject);
                        break;
                    case 'tableView':
                        let tableStyle = {
                            left: 500,
                            top: 500,
                            width: 300,
                            height: 130,
                            row: 3,
                            col: 3,

                            background: '#ffff00',

                            borderWidth: 0,
                            borderColor: "#000000",
                            borderDashArray: [0, 0],

                            lineRowWidth: 1,
                            lineRowColor: "#666666",
                            lineRowDashArray: [0, 0],

                            lineColWidth: 1,
                            lineColColor: "#666666",
                            lineColDashArray: [0, 0],
                        }
                        let tableHead = {
                            style: {
                                height: 40,
                                fontType: "宋体",
                                fontSize: 18,
                                fontColor: "#000000",
                                bgColor: "#ffffff",
                                lineHeight: 40,
                            },
                            data: [{
                                width: 200,
                                name: "表头名称1",
                                fileType: 0,
                                fileCode: "itemTitle"
                            }, {
                                width: 50,
                                name: "表头名称2",
                                fileType: 0,
                                fileCode: "itemTitle"
                            }, {
                                width: 50,
                                name: "表头名称3",
                                fileType: 0,
                                fileCode: "itemTitle"
                            }]
                        }
                        let tableBody = {
                            style: {
                                fontType: "宋体",
                                fontSize: 16,
                                fontColor: "#ffffff",
                                bgColor: "#000000",
                                lineHeight: 20,
                            },
                            data: [],
                        }
                        canvasObject = new fabric.tableView(canvas, tableStyle, tableHead, tableBody);
                        break;
                    case 'tableList':
                        // console.log('tableList',options.tableinfo.width);
                        let table = {
                            tableinfo: {
                                left: 500,
                                top: 300,
                                row: 3,
                                col: 3,
                                width: 184,
                                height: 134,
                                titleLineHeight: 52,
                                bodyLineHeight: 40,
                                times: 5,
                                animate: 0,
                                borderWidth: 1,
                                borderColor: '#ffff00',
                                borderType: 0,
                                bgColors: ['#A4CFFC', '#AACF98'],

                            },
                            tableList: [{
                                type: 0,
                                col: 1,
                                width: 60,
                                height: 50,
                                fontType: "微软雅黑",
                                fontSize: 16,
                                fontColor: "#000000",
                                value: "中国",
                                bgcolor: "#EEEEEE",
                                position: 5,
                                field: "itemTitle",
                                fieldType: 0,
                            }, {
                                type: 0,
                                col: 2,
                                width: 60,
                                height: 50,
                                fontType: "微软雅黑",
                                fontSize: 16,
                                fontColor: "#000000",
                                value: "标题",
                                bgcolor: "#EEEEEE",
                                position: 5,
                                field: "itemTitle",
                                fieldType: 0,
                            }, {
                                type: 0,
                                col: 3,
                                width: 60,
                                height: 50,
                                fontType: "微软雅黑",
                                fontSize: 16,
                                fontColor: "#000000",
                                value: "加油啊",
                                bgcolor: "#EEEEEE",
                                position: 5,
                                field: "itemTitle",
                                fieldType: 0,
                            }, {
                                type: 1,
                                col: 1,
                                width: 60,
                                height: 40,
                                fontType: "",
                                fontSize: 14,
                                fontColor: "#000000",
                                value: "A列值",
                                bgcolor: "#EEEEEE",
                                position: 5,
                                field: "",
                                fieldType: 0,
                            }, {
                                type: 1,
                                col: 2,
                                width: 60,
                                height: 40,
                                fontType: "",
                                fontSize: 14,
                                fontColor: "#000000",
                                value: "B列值",
                                bgcolor: "#EEEEEE",
                                position: 5,
                                field: "",
                                fieldType: 0,
                            }, {
                                type: 1,
                                col: 3,
                                width: 60,
                                height: 40,
                                fontType: "",
                                fontSize: 12,
                                fontColor: "#ff0000",
                                value: "C列值",
                                bgcolor: "#EEEEEE",
                                position: 9,
                                field: "",
                                fieldType: 0,
                            }]
                        };
                        canvasObject = new fabric.tableList(canvas, table);

                        setTimeout(() => {
                            // console.warn(canvasObject.table);
                            that.setActiveObject(canvasObject.table.group);
                            canvasObject.table.group.setCoords();
                            that.canvas.add(canvasObject);
                            that.setTop();                                         //遮罩置顶
                        }, 100);


                        break;

                    default:

                        //----------------------------------------------------------------------------------------其他
                        console.log("default");
                }

                // console.warn('name:'+ name,canvasObject);


                if (name === 'tableList') {
                    this.canvas.renderAll();
                    resolve(canvasObject);
                    //return canvasObject;
                } else {
                    canvasObject.setCoords();
                    this.setActiveObject(canvasObject);
                    this.canvas.add(canvasObject);

                    this.setTop();                                         //遮罩置顶
                    this.canvas.renderAll();

                    resolve(canvasObject);

                    //return canvasObject;
                }

            });


        },

        //创建矩形
        createOneRect(options) {
            return new Promise(function (resolve, reject) {
                let newOptions = {
                    ...options,
                    isType: 'Rect',
                    name: options.name ? options.name : 'Rect',
                    rx: 0,
                    ry: 0,
                };
                let canvasObject = new fabric.Rect({...newOptions});          //创建
                canvasObject.on('scaled', (e) => {
                    // console.log('scaling',e);
                    e.target.set('width', parseInt(e.target.width * e.target.scaleX));
                    e.target.set('height', parseInt(e.target.height * e.target.scaleY));
                    e.target.set('scaleX', 1);
                    e.target.set('scaleY', 1);
                });
                resolve(canvasObject);
            });

        },


        createoneImage(options) {
            let that = this;
            let canvas = this.canvas;


        },
        //获取创建的图片结果
        createURLImage(options) {
            let that = this;
            let canvas = this.canvas;
            return new Promise(function (resolve, reject) {
                options.src = options.src ? options.src : './static/images/img.svg';

                // console.log(options.src);
                var downImg = new Image();
                downImg.crossOrigin = "anonymous";
                downImg.src = options.src;

                downImg.onload = function () {
                    //console.log('图片加载成功');
                    fabric.Image.fromURL(options.src, function (img) {
                        img.crossOrigin = 'Anonymous';
                        options.crossOrigin = 'Anonymous';

                        img.set({                   //图片不设置宽度高度，来定义图片放大缩小
                            id: options.id ? options.id : 'image',
                            copyId: options.copyId,
                            type: options.type ? options.type : 0,
                            isType: 'Image',
                            component: "component",
                            isDiff: 'static',
                            padding: 0,
                            flipX: false,
                            flipY: false,
                            originX: 'left',
                            originY: 'top',
                            stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                            minScaleLimit: 0.0001,                            //  最小限制
                            lockSkewingX: true,                               //  禁掉按住shift时的变形
                            lockSkewingY: true,

                            left: options.left,
                            top: options.top,
                            angle: options.angle ? options.angle : 0,
                            name: options.name ? options.name : 'Image',

                            scaleX: options.width / img.width,
                            scaleY: options.height / img.height,
                            width: img.width,
                            height: img.height,

                            /* scaleX:options.scaleX,
                            scaleY:options.scaleY,
                            width: options.width,
                            height: options.height,*/
                            stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                            strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                            strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                            selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中  如段码屏中可见不可移动false
                            visible: options.visible,                          //元素是否可见
                            hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转

                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,
                        });
                        /*img.hasControls = true;
                        img.hasBorders = true;*/

                        /* canvas.add(img); // 把图片添加到画布上
                        that.activecanvaobjs.push(img);   //设置活跃元素
                        that.activeobj = img;
                        if (options && options.registeObjectEvent) {
                            Utils.registeObjectEvent(that, img);
                        }
                        img.setCoords();
                        that.setActiveObject(img);
                        canvas.renderAll.bind(canvas);
                        that.setTop();  //遮罩置顶*/

                        resolve(img);

                    });
                };
                downImg.onerror = function () {
                    options.src = './static/images/img.svg';
                    fabric.Image.fromURL(options.src, function (img) {

                        img.set({                   //图片不设置宽度高度，来定义图片放大缩小
                            id: options.id ? options.id : 'image',
                            type: options.type ? options.type : 0,
                            isType: 'Image',
                            component: "component",
                            isDiff: 'static',
                            padding: 0,
                            flipX: false,
                            flipY: false,
                            originX: 'left',
                            originY: 'top',
                            stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                            minScaleLimit: 0.0001,                            //  最小限制
                            lockSkewingX: true,                               //  禁掉按住shift时的变形
                            lockSkewingY: true,

                            left: options.left,
                            top: options.top,
                            angle: options.angle ? options.angle : 0,
                            name: options.name ? options.name : 'Image',
                            /*scaleX:  options.width / img.width,
                            scaleY: options.height / img.height,
                            width: img.width,
                            height: img.height,
            */
                            scaleX: options.scaleX,
                            scaleY: options.scaleY,
                            width: options.width,
                            height: options.height,
                            stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                            strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                            strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                            selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中  如段码屏中可见不可移动false
                            visible: options.visible,                          //元素是否可见

                            hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转

                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,
                        });
                        /*img.hasControls = true;
                        img.hasBorders = true;*/

                        /*canvas.add(img); // 把图片添加到画布上
                        that.activecanvaobjs.push(img);   //设置活跃元素
                        that.activeobj = img;
                        if (options && options.registeObjectEvent) {
                            Utils.registeObjectEvent(that, img);
                        }
                        img.setCoords();
                        that.setActiveObject(img);
                        canvas.renderAll.bind(canvas);
                        that.setTop();  //遮罩置顶*/

                        resolve(img);

                    });
                }


            });

        },

        //获取创建的图片结果
        createIcon(options) {
            let that = this;
            let canvas = this.canvas;
            return new Promise(function (resolve, reject) {
                options.src = options.src ? options.src : './static/images/img.svg';

                // console.log(options.src);
                var downImg = new Image();
                downImg.crossOrigin = "anonymous";
                downImg.src = options.src;

                downImg.onload = function () {
                    //console.log('图片加载成功');
                    fabric.Image.fromURL(options.src, function (img) {
                        img.crossOrigin = 'Anonymous';
                        options.crossOrigin = 'Anonymous';

                        img.set({                   //图片不设置宽度高度，来定义图片放大缩小
                            id: options.id ? options.id : 'image',
                            copyId: options.copyId,
                            zIndex: options.zIndex ? options.zIndex : options.id,
                            type: options.type ? options.type : 0,
                            isType: 'Icon',
                            component: "component",
                            isDiff: 'static',
                            padding: 0,
                            flipX: false,
                            flipY: false,
                            originX: 'left',
                            originY: 'top',
                            stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                            minScaleLimit: 0.0001,                            //  最小限制
                            lockSkewingX: true,                               //  禁掉按住shift时的变形
                            lockSkewingY: true,

                            left: options.left,
                            top: options.top,
                            angle: options.angle ? options.angle : 0,
                            name: options.name ? options.name : 'Image',

                            scaleX: options.width / img.width,
                            scaleY: options.height / img.height,
                            width: img.width,
                            height: img.height,

                            /* scaleX:options.scaleX,
                             scaleY:options.scaleY,
                             width: options.width,
                             height: options.height,*/
                            stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                            strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                            strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                            selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中  如段码屏中可见不可移动false
                            visible: options.visible !== false ? true : options.visible,                          //元素是否可见
                            hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转

                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,
                        });
                        /* img.hasControls = true;
                        img.hasBorders = true;*/

                        canvas.add(img); // 把图片添加到画布上
                        /* that.activecanvaobjs.push(img);   //设置活跃元素
                        that.activeobj = img;
                        if (options && options.registeObjectEvent) {
                            Utils.registeObjectEvent(that, img);
                        }*/
                        img.setCoords();
                        that.setActiveObject(img);
                        canvas.renderAll.bind(canvas);
                        that.setTop();  //遮罩置顶

                        resolve(img);

                    });
                };
                downImg.onerror = function () {
                    options.src = './static/images/img.svg';
                    fabric.Image.fromURL(options.src, function (img) {

                        img.set({                   //图片不设置宽度高度，来定义图片放大缩小
                            id: options.id ? options.id : 'image',
                            copyId: options.copyId,
                            zIndex: options.zIndex ? options.zIndex : options.id,
                            type: options.type ? options.type : 0,
                            isType: 'Icon',
                            component: "component",
                            isDiff: 'static',
                            padding: 0,
                            flipX: false,
                            flipY: false,
                            originX: 'left',
                            originY: 'top',
                            stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                            minScaleLimit: 0.0001,                            //  最小限制
                            lockSkewingX: true,                               //  禁掉按住shift时的变形
                            lockSkewingY: true,

                            left: options.left,
                            top: options.top,
                            angle: options.angle ? options.angle : 0,
                            name: options.name ? options.name : 'Image',
                            /*scaleX:  options.width / img.width,
                            scaleY: options.height / img.height,
                            width: img.width,
                            height: img.height,
            */
                            scaleX: options.scaleX,
                            scaleY: options.scaleY,
                            width: options.width,
                            height: options.height,
                            stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                            strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                            strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                            selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中  如段码屏中可见不可移动false
                            visible: options.visible !== false ? true : options.visible,                          //元素是否可见

                            hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转

                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,
                        });
                        /* img.hasControls = true;
                        img.hasBorders = true;*/

                        canvas.add(img); // 把图片添加到画布上
                        that.activecanvaobjs.push(img);   //设置活跃元素
                        that.activeobj = img;
                        if (options && options.registeObjectEvent) {
                            Utils.registeObjectEvent(that, img);
                        }
                        img.setCoords();
                        that.setActiveObject(img);
                        canvas.renderAll.bind(canvas);
                        that.setTop();  //遮罩置顶

                        resolve(img);

                    });
                }


            });

        },

        //创建段码屏图片
        createDuan(options) {
            let that = this;
            let canvas = this.canvas;
            return new Promise(function (resolve, reject) {
                options.src = options.src ? options.src : './static/images/img.svg';

                // console.log(options.src);
                var downImg = new Image();
                downImg.crossOrigin = "anonymous";
                downImg.src = options.src;

                downImg.onload = function () {
                    //console.log('图片加载成功');
                    fabric.Image.fromURL(options.src, function (img) {
                        img.crossOrigin = 'Anonymous';
                        options.crossOrigin = 'Anonymous';

                        img.set({                   //图片不设置宽度高度，来定义图片放大缩小
                            id: options.id ? options.id : 'image',
                            copyId: options.copyId,
                            zIndex: options.zIndex ? options.zIndex : options.id,
                            isType: 'duan',
                            component: "component",
                            isDiff: 'static',
                            padding: 0,
                            flipX: false,
                            flipY: false,
                            originX: 'left',
                            originY: 'top',
                            stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                            minScaleLimit: 0.0001,                            //  最小限制
                            lockSkewingX: true,                               //  禁掉按住shift时的变形
                            lockSkewingY: true,
                            lockMovementX: true,
                            lockMovementY: true,

                            left: options.left,
                            top: options.top,
                            angle: options.angle ? options.angle : 0,
                            name: options.name ? options.name : 'duanImage',

                            scaleX: options.width / img.width,
                            scaleY: options.height / img.height,
                            width: img.width,
                            height: img.height,

                            selectable: false,                 //元素是否可选中  如段码屏中可见不可移动false
                            visible: options.visible,                          //元素是否可见
                            hasRotatingPoint: false,                          //元素是否旋转
                            hasControls: false,

                        });
                        /* img.hasControls = false;
                        img.hasBorders = false;*/

                        canvas.add(img); // 把图片添加到画布上
                        img.setCoords();
                        that.setActiveObject(img);
                        canvas.renderAll.bind(canvas);
                        that.setTop();  //遮罩置顶

                        resolve(img);

                    });
                };
                downImg.onerror = function () {
                    options.src = './static/images/img.svg';
                    fabric.Image.fromURL(options.src, function (img) {

                        img.set({                   //图片不设置宽度高度，来定义图片放大缩小
                            id: options.id ? options.id : 'image',
                            copyId: options.copyId,
                            zIndex: options.zIndex ? options.zIndex : options.id,
                            type: options.type ? options.type : 0,
                            isType: 'duan',
                            component: "component",
                            isDiff: 'static',
                            padding: 0,
                            flipX: false,
                            flipY: false,
                            originX: 'left',
                            originY: 'top',
                            stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                            minScaleLimit: 0.0001,                            //  最小限制
                            lockSkewingX: true,                               //  禁掉按住shift时的变形
                            lockSkewingY: true,
                            lockMovementX: true,
                            lockMovementY: true,

                            left: options.left,
                            top: options.top,
                            angle: options.angle ? options.angle : 0,
                            name: options.name ? options.name : 'duanImage',

                            scaleX: options.scaleX,
                            scaleY: options.scaleY,
                            width: options.width,
                            height: options.height,
                            stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                            strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                            strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                            selectable: false,                 //元素是否可选中  如段码屏中可见不可移动false
                            visible: options.visible !== false ? true : options.visible,                          //元素是否可见
                            hasControls: false,
                            hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转
                        });
                        /* img.hasControls = false;
                        img.hasBorders = false;*/

                        canvas.add(img); // 把图片添加到画布上
                        that.activecanvaobjs.push(img);   //设置活跃元素
                        that.activeobj = img;
                        if (options && options.registeObjectEvent) {
                            Utils.registeObjectEvent(that, img);
                        }
                        img.setCoords();
                        that.setActiveObject(img);
                        canvas.renderAll.bind(canvas);
                        that.setTop();  //遮罩置顶

                        resolve(img);

                    });
                }


            });

        },

        //改变段码屏图片
        changeURL(id, iconUrl) {
            let objects = this.getObjectsNew();
            let that = this;
            objects.forEach((one) => {
                if (one.id === id && one.isType === 'duan') {
                    let img = new Image();
                    img.src = iconUrl;
                    img.onload = () => {
                        one._element.src = iconUrl;
                        that.setTop();
                    }
                }
            })
        },

        //获取创建二维码的结果
        createQrcode(options) {
            let that = this;
            let canvas = this.canvas;
            return new Promise(function (resolve, reject) {
                if(options.barcodeType===1){
                    let canvasObject;
                    options.imgText = options.imgText ? options.imgText : '12345670';

                    var img = new Image();
                    var svgNode =  DATAMatrix({
                        msg :  options.imgText
                        ,dim :   options.width
                        ,rct :   0
                        ,pad :   0
                        ,pal : [options.lineColor ? options.lineColor : "#000000", "#f2f4f8"]
                        ,vrb :   0
                    });
                    // img.src=svgNode
                    // document.getElementById('datamatix').append(svgNode)

                    console.warn(svgNode)
                    // img.src = 'data:image/svg+xml,' + btoa(unescape(encodeURIComponent(svgNode.innerHTML)));
                    // console.warn(img)

                    // 循环删除历史图片
                    var el = document.getElementById('datamatix');
                    var childs = el.childNodes;
                    for(var i = childs .length - 1; i >= 0; i--) {
                        el.removeChild(childs[i]);
                    }
                    document.getElementById('datamatix').append(svgNode)

                    let curcanvas = canvas;
                    html2canvas(document.getElementById('datamatix')).then(function(canvas) {
                        let url = canvas.toDataURL();
                        console.log(url)

                        let img = new Image();
                        img.crossOrigin = 'Anonymous';
                        img.src = url;

                        img.onload = () => {

                            // console.log(img.width,img.height)

                            document.getElementById('datamatix').append(img)

                            canvasObject = new fabric.Image(img, {
                                left: options.left,
                                top: options.top,
                                id: options.id,

                                // width: options.width,
                                // height: options.height,
                                // scaleX:1,
                                // scaleY:1,

                                // scaleX: options.width / img.width,
                                // scaleY: options.height / img.width,


                                copyId: options.copyId,
                                zIndex: options.zIndex ? options.zIndex : options.id,
                                type: options.type ? options.type : '0',
                                color: options.lineColor,

                                name: options.name ? options.name : 'Qrcode',
                                angle: options.angle,
                                component: "component",
                                isType: 'Qrcode',
                                isDiff: 'static',
                                fill: options.fill ? options.fill : '#000000',
                                flipX: false,
                                flipY: false,
                                lockSkewingX: true,                  //禁掉按住shift时的变形
                                lockSkewingY: true,
                                originX: 'left',
                                originY: 'top',
                                lockUniScaling: true,
                                imgText: options.imgText,
                                content: options.imgText,

                                lineColor: options.lineColor,
                                hasRotatingPoint: false,                          //元素是否旋转

                                barcodeType:1,
                                visible: options.visible !== false ? true : options.visible,                          //元素是否可见
                                eyeshow: options.eyeshow,
                                screenIndex: options.screenIndex,

                            });
                            canvasObject.height = canvasObject.width
                            // console.log(canvasObject.width,canvasObject.height)
                            curcanvas.add(canvasObject);
                            that.setActiveObject(canvasObject);
                            // that.setTop();                                         //遮罩置顶
                            curcanvas.renderAll();


                            resolve(canvasObject);
                        }
                        img.onerror = function () {
                            reject(new Error('barcode error load!'));
                        };
                    });
                }else{
                    let canvasObject;
                    let qrcodeImg = jrQrcode.getQrBase64(options.imgText, {
                        padding: options.margin ? options.margin : 2,   // 二维码四边空白（默认为10px）
                        width: options.width ? options.width : 80,  // 二维码图片宽度（默认为256px）
                        height: options.height ? options.height : 80,  // 二维码图片高度（默认为256px）
                        correctLevel: QRErrorCorrectLevel.H,    // 二维码容错level（默认为高）
                        reverse: false,        // 反色二维码，二维码颜色为上层容器的背景颜色
                        background: options.background ? options.background : "#ffffff",    // 二维码背景颜色（默认白色）
                        foreground: options.lineColor ? options.lineColor : "#000000"     // 二维码颜色（默认黑色）
                    });
                    let newimg = document.createElement('img');
                    newimg.src = qrcodeImg;
                    newimg.id = (new Date()).getTime();

                    newimg.onload = () => {
                        canvasObject = new fabric.Image(newimg, {
                            left: options.left,
                            top: options.top,
                            id: options.id,
                            copyId: options.copyId,
                            zIndex: options.zIndex ? options.zIndex : options.id,
                            type: options.type ? options.type : '0',
                            color: options.lineColor,

                            name: options.name ? options.name : 'Qrcode',
                            angle: options.angle,
                            component: "component",
                            isType: 'Qrcode',
                            isDiff: 'static',
                            fill: options.fill ? options.fill : '#000000',
                            flipX: false,
                            flipY: false,
                            lockSkewingX: true,                  //禁掉按住shift时的变形
                            lockSkewingY: true,
                            originX: 'left',
                            originY: 'top',
                            lockUniScaling: true,
                            imgText: options.imgText,
                            content: options.imgText,

                            lineColor: options.lineColor,
                            hasRotatingPoint: false,                          //元素是否旋转

                            barcodeType:0,
                            visible: options.visible,
                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,

                        });
                        canvas.add(canvasObject);
                        that.setActiveObject(canvasObject);
                        that.setTop();                                         //遮罩置顶
                        canvas.renderAll();
                        /* that.activecanvaobjs.push(canvasObject);   //设置活跃元素
                         that.activeobj = canvasObject;*/
                        resolve(canvasObject);
                    };
                    newimg.onerror = function () {
                        reject(new Error('qrcode error load!'));
                    };
                }
            });
        },

        async createBarcodedatamatrix(options) {
            console.log('创建datamatrix条形码：',options);
            let that = this;
            let curcanvas = this.canvas;
            return new Promise(function (resolve, reject) {
                let canvasObject;
                options.imgText = options.imgText ? options.imgText : '12345670';

                var img = new Image();
                var svgNode =  DATAMatrix({
                    msg :  options.imgText
                    ,dim :   options.barlineWidth
                    ,rct :   0
                    ,pad :   1
                    ,pal : [options.color ? options.color : "#000000", "#f2f4f8"]
                    ,vrb :   0
                });
                // img.src=svgNode
                // document.getElementById('datamatix').append(svgNode)

                console.warn(svgNode)
                // img.src = 'data:image/svg+xml,' + btoa(unescape(encodeURIComponent(svgNode.innerHTML)));
                // console.warn(img)

                document.getElementById('datamatix').append(svgNode)

                html2canvas(document.getElementById('datamatix')).then(function(canvas) {
                    let url = canvas.toDataURL();
                    console.log(url)

                    let img = new Image();
                    img.crossOrigin = 'Anonymous';
                    img.src = url;

                    img.onload = () => {

                        console.log(img)

                        document.getElementById('datamatix').append(img)

                        canvasObject = new fabric.Image(img, {
                            left: options.left,
                            top: options.top,
                            id: options.id,

                            // width: options.width,
                            // height: options.height,
                            // scaleX:1,
                            // scaleY:1,

                            scaleX: options.width / img.width,
                            scaleY: options.height / img.height,


                            copyId: options.copyId,
                            zIndex: options.zIndex ? options.zIndex : options.id,
                            type: options.type ? options.type : '0',
                            color: options.lineColor,

                            name: options.name ? options.name : 'Barcodedatamatrix',
                            angle: options.angle,
                            component: "component",
                            isType: 'Barcodedatamatrix',
                            isDiff: 'static',
                            fill: options.fill ? options.fill : '#000000',
                            flipX: false,
                            flipY: false,
                            lockSkewingX: true,                  //禁掉按住shift时的变形
                            lockSkewingY: true,
                            originX: 'left',
                            originY: 'top',
                            lockUniScaling: true,
                            imgText: options.imgText,
                            content: options.imgText,

                            lineColor: options.lineColor,
                            hasRotatingPoint: false,                          //元素是否旋转

                            visible: options.visible !== false ? true : options.visible,                          //元素是否可见
                            eyeshow: options.eyeshow,
                            screenIndex: options.screenIndex,

                        });

                        console.log(canvasObject)
                        curcanvas.add(canvasObject);
                        that.setActiveObject(canvasObject);
                       // that.setTop();                                         //遮罩置顶
                        curcanvas.renderAll();


                        resolve(canvasObject);
                    }
                    img.onerror = function () {
                        reject(new Error('barcode error load!'));
                    };

                })

            });
        },

        //获取创建条码的结果
        async createBarcode(options) {
            let that = this;
            let canvas = this.canvas;
            return new Promise(function (resolve, reject) {
                let canvasObject;
                options.imgText = options.imgText ? options.imgText : 'barcode123456789';
                options.barlineWidth = options.barlineWidth ? options.barlineWidth : 1;

                let barbox = document.getElementById('barbox');
                let bardom = document.createElement('img');
                let barid = 'barcode' + options.id;
                bardom.id = 'barcode' + options.id;

                let allnode = barbox.childNodes;
                allnode.forEach((node) => {
                    if (node.getAttribute('id') === barid) {
                        document.getElementById('barcode' + options.id).remove();
                    }
                })
                barbox.appendChild(bardom);//为了解决多个条码，他们用图需要不一样

                /*
                条码支持的有:

                CODE128
                CODE128 (自动模式切换)
                CODE128 A/B/C (强制模式)
                EAN
                EAN-13
                EAN-8
                EAN-5
                EAN-2
                UPC (A)
                CODE39
                ITF-14
                MSI
                MSI10
                MSI11
                MSI1010
                MSI1110
                Pharmacode
                Codabar

                https://www.cnblogs.com/huangenai/p/6347607.html

                */

                JsBarcode("#barcode" + options.id, options.imgText, {
                    id: options.id,
                    format: options.format ? options.format : "CODE128",  //条形码的格式
                    lineColor: options.color ? options.color : "#000000",  //线条颜色
                    margin: options.margin ? options.margin : 0, // 条码四边空白（默认为10px）
                    width: options.barlineWidth, //线宽
                    height: options.height ? options.height : 20,  //条码高度
                    displayValue: false //是否显示文字信息
                });

                options.originXY = options.originXY ? options.originXY : ['left', 'top'];
                document.getElementById(barid).onload = () => {

                    const barcodeIMG = new fabric.Image(document.getElementById(barid), {

                        id: options.id,
                        copyId: options.copyId,
                        zIndex: options.zIndex,
                        width: document.getElementById(barid).width,   //document.getElementById('barcode').width, >options.width?document.getElementById('barcode').width:options.width
                        color: options.color ? options.color : "#000000",
                        height: options.height,
                        name: options.name ? options.name : 'barcodeimg',
                        angle: options.angle,
                        component: "component",
                        isType: 'barcodeimg',
                        isDiff: 'static',
                        flipX: false,
                        flipY: false,
                        lockSkewingX: true,                  //禁掉按住shift时的变形
                        lockSkewingY: true,
                        scaleX: 1,
                        scaleY: 1,
                        lockScalingX: true,
                        lockScalingY: true,
                        lockRotation: true,
                        imgText: options.imgText,
                        lineColor: options.lineColor,
                        selectable: false,
                        hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转

                        visible: options.visible,
                        eyeshow: options.eyeshow,
                        screenIndex: options.screenIndex,

                    });

                    const rect = new fabric.Rect({
                        width: options.width,  //document.getElementById('barcode').width>options.width?document.getElementById('barcode').width:
                        height: options.height,
                        fill: '#f1edea',
                        originX: 'left',
                        originY: 'top',
                        left: 0,
                        top: 0,

                        id: options.id,
                        zIndex: options.zIndex,
                        copyId: options.copyId,

                        name: options.name ? options.name : 'barcodebg',
                        angle: options.angle,
                        component: "component",
                        isType: 'barcodebg',
                        isDiff: 'static',
                        selectable: false,
                        hasRotatingPoint: options.hasRotatingPoint !== false ? true : options.hasRotatingPoint,                          //元素是否旋转

                        visible: options.visible,
                        eyeshow: options.eyeshow,
                        screenIndex: options.screenIndex,
                    });

                    canvasObject = new fabric.Group([rect, barcodeIMG], {
                        originX: 'left',
                        originY: 'top',
                        left: options.left,
                        top: options.top,
                        originXY: [options.originXY[0], 'top'],
                        id: options.id,
                        copyId: options.copyId,
                        zIndex: options.zIndex,

                        type: options.type ? options.type : 'Barcode',

                        name: options.name ? options.name : 'Barcode',

                        angle: options.angle,
                        component: "component",
                        isType: 'Barcode',
                        isDiff: 'static',
                        width: options.width,
                        height: options.height,
                        barlineWidth: options.barlineWidth,

                        imgText: options.imgText,
                        lineColor: options.lineColor,

                        fill: options.lineColor,
                        color: options.color ? options.color : "#000000",

                        format: options.format ? options.format : "CODE128",  //条形码的格式

                        lockRotation: true,
                        flipX: false,
                        flipY: false,
                        lockSkewingX: true,                  //禁掉按住shift时的变形
                        lockSkewingY: true,

                        hasRotatingPoint: false,                          //元素是否旋转

                        visible: options.visible,
                        eyeshow: options.eyeshow,
                        screenIndex: options.screenIndex,

                        /*clipTo:(e)=>{
                            if(e){
                                e.canvas.getContext('2d').rect(-options.width/2,-options.height/2,options.width,options.height);
                            }
                        }*/
                    });


                    canvasObject.on('scaling', (e) => {
                        e.target.item(1).set({
                            left: -8000, //e.target.width* e.transform.newScaleX
                            top: 0,
                        });
                        // that.changeBarcodeImage(canvasObject); //改变一下试试
                        canvas.requestRenderAll();
                        canvas.renderAll();
                    });


                    canvas.add(canvasObject);
                    // console.log(options.originXY[0],options.width,document.getElementById('barcode').width);
                    let left = 0;
                    let w = options.width;
                    let barw = document.getElementById(barid).width;
                    if (options.originXY[0] === 'left') {
                        left = w < barw ? Math.abs(barw - w) / 2 : -Math.abs(barw - w) / 2;
                    } else if (options.originXY[0] === 'center') {
                        left = 0;
                    } else if (options.originXY[0] === 'right') {
                        left = w < barw ? -Math.abs(barw - w) / 2 : Math.abs(barw - w) / 2;
                    }
                    canvasObject.item(0).set({
                        left: '-50%',
                    });
                    canvasObject.item(1).set({
                        top: 0,
                        left: left,
                    });
                    that.setActiveObject(canvasObject);

                    that.setTop();                                         //遮罩置顶
                    canvas.renderAll();
                    /*that.activecanvaobjs.push(canvasObject);   //设置活跃元素
                    that.activeobj = canvasObject;*/
                    that.changeBarcodeImage(canvasObject); //改变一下试试
                    resolve(canvasObject);

                }
                document.getElementById(barid).onerror = function () {
                    reject(new Error('barcode error load!'));
                };
            });
        },

        //改变二维码的图片大小和值
        async changeQrcodeImage(options) {
            if (options.isType !== 'Qrcode') {
                return;
            }
            let optionsdata = JSON.parse(JSON.stringify(options));
            this.removeObj(options);

            let left = optionsdata.left + this.xLeft;
            let top = optionsdata.top + this.yTop;
            // console.log('change image:',options.height);
            await this.createElement(options.isType, {
                ...options,
                imgText: options.imgText,
                lineColor: options.lineColor,
                left: left,
                top: top,
                width: parseInt(options.width * options.scaleX),
                height: parseInt(options.height * options.scaleY),
                scaleX: 1,
                scaleY: 1,

                visible: options.visible,
                eyeshow: options.eyeshow,
                screenIndex: options.screenIndex,


            });
        },

        async changeTextRectBoxContent(options) {
            // console.log('changeTextRectBoxContent');
            options.set({
                width: options.width * options.scaleX,
                height: options.height * options.scaleY,
                scaleX: 1,
                scaleY: 1,
            });
            options.item(0).set({
                width: options.width * options.scaleX,
                height: options.height * options.scaleY,
                scaleX: 1,
                scaleY: 1,
            });
            // console.log(options.item(1).text);
            options.item(1).set({
                width: options.width * options.scaleX,
                height: options.height * options.scaleY,
                scaleX: 1,
                scaleY: 1,
            });

            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },
        //改变条码的图片和大小
        async changeBarcodeImage(options) {

            // console.log(options.item(1).width,options.item(1).scaleX,options.width,options.scaleX);
            let lineWidth = options.barlineWidth;
            lineWidth = parseInt(options.barlineWidth * ((options.width * options.scaleX) / (options.item(1).width * options.item(1).scaleX)));

            if (lineWidth === 0) {
                lineWidth = 1;
            }
            // console.log('条码线宽：',lineWidth);

            options.set({
                width: options.width * options.scaleX,
                scaleX: 1,
                barlineWidth: lineWidth,
            });
            options.item(0).set({
                width: options.width * options.scaleX,
                scaleX: 1,
            });

            let newoptions = {
                id: options.id ? options.id : 0,
                format: options.item(1).format ? options.item(1).format : "CODE128",  //条形码的格式
                lineColor: options.color ? options.color : '#000000',  //线条颜色
                margin: 0, // 条码四边空白（默认为10px）
                lineWidth: lineWidth, //线宽
                height: options.item(1).height ? options.item(1).height : 20,  //条码高度

                visible: options.visible,
                eyeshow: options.eyeshow,
                screenIndex: options.screenIndex,
            };
            let img = await this.drawbarcode(options.imgText, newoptions);

            let left = 0;
            let w = options.width;
            let barw = document.getElementById('barcode' + newoptions.id).width;
            if (options.originXY[0] === 'left') {
                left = w < barw ? Math.abs(barw - w) / 2 : -Math.abs(barw - w) / 2;
            } else if (options.originXY[0] === 'center') {
                left = 0;
            } else if (options.originXY[0] === 'right') {
                left = w < barw ? -Math.abs(barw - w) / 2 : Math.abs(barw - w) / 2;
            }

            options.item(1)._element.src = img;
            options.item(1).set({
                left: left,
                width: options.item(1)._element.width,
                scaleX: 1,
            });


            if (options.barlineWidth * ((options.width * options.scaleX) / (options.item(1).width * options.item(1).scaleX)) < 1) {
                console.log('小于条码1倍');
                options.item(0).set({
                    width: options.item(1)._element.width,
                    scaleX: 1,
                });
                options.set({
                    width: options.item(1)._element.width,
                    scaleX: 1,
                });
                options.item(1).set({
                    left: 0,
                })
            }


            /**/

            /*if(islineWidth===0){
              console.log(options.item(1).width*options.item(1).scaleX,options.width,options.scaleX);
              options.set({
                  width:options.item(1).width*options.item(1).scaleX,
              });
              options.item(1)._element.src = img;
              options.item(1).set({
                  left:left,
                  width:options.item(1)._element.width,
                  scaleX:1,
              });
          }*/

            options.setCoords();
            /*this.setZoom(this.canvasZoom+0.01);
            this.setZoom(this.canvasZoom-0.01);*/
            this.canvas.requestRenderAll();
            this.canvas.renderAll();

            /*

            setTimeout(()=>{
                this.setZoom(this.canvasZoom - 0.00001);
            },100)*/

            //console.log('barcode:',options.item(1)._element,img);
        },


        //创建非跨域图片最大缩放图片
        createEqualImageImage(options) {

            // console.log('00000000000000000000');

            let that = this;
            let canvas = this.canvas;

            return new Promise(function (resolve, reject) {
                options.url = options.url ? options.url : './static/images/img.svg';
                var img = document.createElement("img");

                img.crossOrigin = 'Anonymous';
                img.src = options.url;

                img.onload = function () {

                    let imgwidth = 0;
                    let imgheight = 0;

                    if (img.width / img.height > options.width / options.height) {
                        imgwidth = options.width;
                        imgheight = options.width / (img.width / img.height);
                    } else {
                        imgheight = options.height;
                        imgwidth = options.height * (img.width / img.height);
                    }


                    var canvasImage = new fabric.Image(img, {
                        id: options.id ? options.id : 'image',
                        isType: 'equalImage-img',
                        padding: 0,
                        flipX: false,
                        flipY: false,
                        stopContextMenu: true,                            //  禁掉鼠标右键默认事件
                        minScaleLimit: 0.0001,                            //  最小限制
                        lockSkewingX: true,                               //  禁掉按住shift时的变形
                        lockSkewingY: true,

                        originX: "center",
                        originY: "center",
                        /*left:0,
                        top:0,*/
                        /*scaleX: width / img.width,
                        scaleY: height / img.height,*/

                        scaleX: imgwidth / img.width,
                        scaleY: imgheight / img.height,

                        angle: options.angle ? options.angle : 0,
                        name: options.name ? options.name : 'Image',

                        stroke: options.stroke ? options.stroke : '',                              // 边框颜色
                        strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                        strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],              // 边框样式 虚线 [5,1]     直线[0,0]  线段也是这个参数

                        selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中  如段码屏中可见不可移动false
                        visible: options.visible !== false ? true : options.visible,                          //元素是否可见

                        eyeshow: options.eyeshow,
                        screenIndex: options.screenIndex,
                    });

                    /*canvasImage.hasControls = true;
                    canvasImage.hasBorders = true;*/

                    var rect = new fabric.Rect({
                        isType: 'equalImage-bg',
                        padding: 0,
                        originX: "center",
                        originY: "center",
                        width: options.width ? options.width : 100,
                        height: options.height ? options.height : 100,
                        fill: options.background ? options.background : '#eeeeee',

                    });

                    var group = new fabric.Group([rect, canvasImage], {
                        isType: 'equalImage',
                        left: options.left,
                        top: options.top,
                        width: options.width,
                        height: options.height,
                        originX: "left",
                        originY: "top",
                        padding: 0,
                        id: options.id,

                        hasRotatingPoint: false,
                        lockScalingFlip: true,
                        minScaleLimit: 0.2,

                        eyeshow: options.eyeshow,
                        screenIndex: options.screenIndex,
                    });

                    group.on('scaling', function (e) {
                        let newimgwidth = 0;
                        let newimgheight = 0;

                        if (img.width / img.height > (group.width * group.scaleX) / (group.height * group.scaleY)) {
                            newimgwidth = (group.width * group.scaleX);
                            newimgheight = (group.width * group.scaleX) / (img.width / img.height);
                            group.item(1).set('scaleX', newimgwidth / img.width / group.scaleX);
                            group.item(1).set('scaleY', newimgheight / img.height / group.scaleY);
                        } else {
                            newimgheight = (group.height * group.scaleY);
                            newimgwidth = (group.height * group.scaleY) * (img.width / img.height);
                            group.item(1).set('scaleX', newimgwidth / img.width / group.scaleX);
                            group.item(1).set('scaleY', newimgheight / img.height / group.scaleY);
                        }
                        canvas.requestRenderAll();
                        canvas.renderAll();
                    });


                    group.setControlsVisibility({
                        bl: true,
                        br: true,
                        mb: true,
                        ml: true,
                        mr: true,
                        mt: true,
                        mtr: false,
                        tl: true,
                        tr: true
                    });
                    canvas.add(group); // 把图片添加到画布上

                    if (options && options.registeObjectEvent) {
                        Utils.registeObjectEvent(that, img);
                    }
                    group.setCoords();
                    that.setActiveObject(group);
                    canvas.renderAll.bind(canvas);

                    resolve(group);

                };

            });
        },


        //刷新渲染页面
        renderCanvas() {
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
            this.setTop();
            //this.setZoom(this.canvasZoom + 0.00001);
        },


        //预览
        async todata() {
            this.discardActive();
            var dataURL = canvas.toDataURL({
                format: 'jpeg',
                multiplier: 2,
            });
            let newdata = await this.cutImg(dataURL, -this.xLeft, -this.yTop, -this.xLeft + this.width, -this.yTop + this.height);
            this.$emit('previewshow', newdata);
        },

        //切割画布
        cutImg(img, xStart, yStart, xEnd, yEnd) {
            xStart = xStart * this.canvasZoom;
            yStart = yStart * this.canvasZoom;
            xEnd = xEnd * this.canvasZoom;
            yEnd = yEnd * this.canvasZoom;
            return new Promise(function (resolve, reject) {
                var dirtyWidth = xEnd - xStart;
                var dirtyHeight = yEnd - yStart;
                var nowText = canvas.getContext("2d");//获取2d环境
                var img1 = new Image();
                // img1.crossOrigin="anonymous";
                img1.src = img;
                var newCanvas = document.createElement("canvas");
                var newText = newCanvas.getContext("2d");

                img1.onload = function () {
                    nowText.drawImage(img1, 0, 0, canvas.width, canvas.height);//绘制图像
                    var imgData = nowText.getImageData(xStart, yStart, dirtyWidth, dirtyHeight);//获取截图画布像素数据
                    newCanvas.width = dirtyWidth;
                    newCanvas.height = dirtyHeight;
                    newText.putImageData(imgData, 0, 0, 0, 0, newCanvas.width, newCanvas.height);//将截取的图像放回画布上
                    var imgUrl = newCanvas.toDataURL("image/png");//将图片转为dataURL(base64);
                    resolve(imgUrl);
                };
                img1.onerror = function () {
                    reject(new Error('Could not load image at '));
                };

            });
        },

        /**
         * 根据字，字体，字号画图，计算边距变形整体缩放
         *
         *
         * */
        getFontImgdata(text, fontFamily, fontSize, scaleX, scaleY) {
            /* console.log(text,fontFamily,fontSize,scaleX,scaleY)
            console.warn('getFontImgdata....');*/

            let result = new Promise(function (resolve, reject) {
                let ncanvas = new fabric.Canvas('fontcanvas', {preserveObjectStacking: true});
                /* fabric.Object.prototype.originX = 'left';  //设置中心为左上角
               fabric.Object.prototype.originY = 'top';*/

                let textdaemo = new fabric.Text(text, {
                    fill: '#ff0',
                    splitByGrapheme: true,
                    lockScalingFlip: true,
                    fontFamily: fontFamily,
                    fontSize: fontSize,
                    originX: 'left',
                    originY: 'top',
                    scaleX: scaleX,
                    scaleY: scaleY,
                });

                /*const rect1 = new fabric.Rect({
                    lockScalingFlip:true,
                });
                const text1 = new fabric.Text(text, {
                    fill:'#ff0',
                    splitByGrapheme: true,
                    lockScalingFlip:true,
                    fontFamily:fontFamily,
                    fontSize:fontSize,

                    scaleX:scaleX,
                    scaleY:scaleY,

                });
                let textdaemo = new fabric.Group([rect1,text1], {
                    width:text1.width,
                    height:text1.height,
                    originX:'left',
                    originY:'top',
                    flipX: false,
                    flipY: false,
                    lockSkewingX: true,                  //禁掉按住shift时的变形
                    lockSkewingY:true,
                    lockUniScaling:true,
                    id:0,
                    left: 0,
                    top: 0,
                    angle:0,
                    isElasticSize:1,



                    clipTo:function(ctx) {
                        ctx.rect(-text1.width*scaleX/2,-text1.height*scaleY/2,text1.width*scaleX,text1.height*scaleY);
                    }
                });
                textdaemo.item(0).set({'width':text1.width*scaleX, 'height':textdaemo.height*scaleY,});
                textdaemo.item(1).set({'width':text1.width, 'height':text1.height,});*/

                ncanvas.setWidth(textdaemo.width * scaleX);
                ncanvas.setHeight(textdaemo.height * scaleY);

                ncanvas.backgroundColor = '#000';


                textdaemo.set({
                    left: 0,
                    top: 0,
                });

                textdaemo.setCoords();

                ncanvas.add(textdaemo);
                ncanvas.requestRenderAll();
                ncanvas.renderAll();

                let ctxcontent = ncanvas.getContext("2d");

                var data = ctxcontent.getImageData(0, 0, textdaemo.width * scaleX, textdaemo.height * scaleY).data;
                let morew = ctxcontent.getImageData(0, 0, textdaemo.width * scaleX, textdaemo.height * scaleY).width;
                let moreh = ctxcontent.getImageData(0, 0, textdaemo.width * scaleX, textdaemo.height * scaleY).height;

                let coor = [];
                let fontw = [];
                let fonth = [];
                for (let j = 0; j < 2; j++) {
                    coor[j] = [];
                }
                let realdata = [];
                for (let i = 0, len = data.length; i < len; i += 4) {
                    let red = data[i],
                        green = data[i + 1],
                        blue = data[i + 2],
                        alpha = data[i + 3];
                    if (`${red} ${green} ${blue}` === '0 0 0') {
                        realdata.push(0);
                    } else {
                        realdata.push(1);
                    }
                }

                //计算二维图像
                let lines = [];
                for (var l = 0; l < realdata.length; l += morew) {
                    lines[l / morew] = [];
                    for (var m = 0; m < morew; m++) {
                        lines[l / morew][m] = realdata[l + m];
                        if (realdata[l + m] === 1) {
                            fonth.push(parseInt(l / morew));
                            fontw.push(m)
                        }
                    }
                }
                //生成base64图像
                let dataUrl = ncanvas.toDataURL({
                    format: 'jpeg',
                    multiplier: 1,
                });
                // console.log(dataUrl);

                //计算宽高
                //console.log(fontw,fonth,morew,moreh);

                let w = new Set(fontw);
                let neww = Array.from(w); //去重
                let neww2 = neww.sort(function (a, b) {
                    return a - b;
                }); //从小到大排列
                let truefontwidth = neww2[neww2.length - 1] - neww2[0] + 1;

                let h = new Set(fonth);
                let newh = Array.from(h);//去重
                let newh2 = newh.sort(function (a, b) {
                    return a - b;
                }); //从小到大排列
                let truefontheight = newh2[newh2.length - 1] - newh2[0] + 1;

                let returndata = {
                    offset: [neww2[0] - 0, morew - neww2[neww2.length - 1] - 1, newh2[0] - 0, moreh - newh2[newh2.length - 1] - 1], //[左，右，上，下]
                    fontTruewidth: truefontwidth,
                    fontTrueheight: truefontheight,
                    fontSize: fontSize,
                    width: morew,
                    height: moreh,
                    url: dataUrl,
                    lines: lines,
                };
                let img = new Image();
                img.src = dataUrl;
                img.onload = () => {
                    resolve(returndata)
                };
            });

            return result;


        },

        /**
         * 创建矩形√、 圆角矩形 、平行四边形
         * @options {
         *     id, width, height, left, top, padding, angle, scaleX,  scaleY, selectable, visible,   与原数据同名
         *     fillColor，backgroundColor, stroke, strokeWidth, strokeDashArray,           原数据名改造
         *     rx, ry, skewX,    影响圆角和形状
         * }
         * */
        async createRect(options) {
            //   console.log('create rect',JSON.stringify(options));
            options = Object.assign({
                width: 50,
                height: 30,
                left: -this.xLeft,
                top: -this.yTop,
                padding: 0,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
            }, options);
            let rect = new fabric.Rect({
                ...options,
                left: -this.xLeft + options.left,
                top: -this.yTop + options.top,
                id: options.id,
                name: options.name ? options.name : 'Rect',
                component: "component",
                isType: 'Rect',
                isDiff: 'static',

                selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中
                visible: options.visible !== false ? true : options.visible,                          //元素是否可见

                fill: options.fill ? options.fill : '#000',                                            // 填充的颜色（矩形）
                fillColor: options.fillColor ? options.fillColor : '#000',                              // 填充的颜色

                backgroundColor: options.backgroundColor ? options.backgroundColor : '#000000',   // 边框填充的颜色
                stroke: options.stroke ? options.stroke : 'rgba(0,0,0,0)',                              // 边框颜色
                strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],                    // 边框样式 虚线 [5,1]     直线[0,0]

                minScaleLimit: 0.0001,                            //  最小限制

                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',

                stopContextMenu: true,                            //禁掉鼠标右键默认事件
            });
            rect.setCoords();
            this.canvas.add(rect);
            this.setTop();  //遮罩置顶
            this.canvas.renderAll();
            return rect;
        },


        //创建文本
        createText(text, options) {
            options = Object.assign({
                width: 50,
                height: 30,
                left: -this.xLeft,
                top: -this.yTop,
                padding: 0,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
            }, options);
            var canvasObj = new fabric.Textbox(text, {
                ...options,
                splitByGrapheme: true,
                width: options.width,
                height: options.height,
                left: options.left,
                top: options.top,
                id: options.id,
                name: options.name ? options.name : 'Text',
                component: "component",
                isType: 'Text',
                isDiff: 'static',

                selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中
                visible: options.visible !== false ? true : options.visible,                          //元素是否可见

                fill: options.fill ? options.fill : '#000',                                            // 填充的颜色（矩形）
                fillColor: options.fillColor ? options.fillColor : '#000',                              // 填充的颜色

                backgroundColor: options.backgroundColor ? options.backgroundColor : 'rgba(0,0,0,0)',   // 边框填充的颜色
                stroke: options.stroke ? options.stroke : 'rgba(0,0,0,0)',                              // 边框颜色
                strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],                    // 边框样式 虚线 [5,1]     直线[0,0]

                minScaleLimit: 0.0001,                            //  最小限制

                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                lockSkewingX: true,                  //禁掉按住shift时的变形
                lockSkewingY: true,
                stopContextMenu: true,                            //禁掉鼠标右键默认事件
            });


            /* let topdata = {
                size:      1.13, // fontSize factor
                baseline: 0.5  // baseline-shift factor (upwards)
            };
          canvasObj._setScript(0, 10, topdata);*/
            canvasObj.setCoords();
            this.canvas.add(canvasObj);
            this.setTop();  //遮罩置顶
            this.canvas.renderAll();
            return canvasObj;
        },

        //创建文本
        createText2(text, options) {
            options = Object.assign({
                width: 50,
                height: 30,
                left: -this.xLeft,
                top: -this.yTop,
                padding: 0,
                angle: 0,
                scaleX: 1,
                scaleY: 1,
            }, options);
            var canvasObj = new fabric.Text(text, {
                ...options,
                left: -this.xLeft + options.left,
                top: -this.yTop + options.top,
                id: options.id,
                name: options.name ? options.name : 'Time',
                component: "component",
                isType: 'Time',
                isDiff: 'static',
                textAlign: 'left',

                selectable: options.selectable !== false ? true : options.selectable,                 //元素是否可选中
                visible: options.visible !== false ? true : options.visible,                          //元素是否可见

                fill: options.fill ? options.fill : '#000',                                            // 填充的颜色（矩形）
                fillColor: options.fillColor ? options.fillColor : '#000',                              // 填充的颜色

                backgroundColor: options.backgroundColor ? options.backgroundColor : 'rgba(0,0,0,0)',   // 边框填充的颜色
                stroke: options.stroke ? options.stroke : 'rgba(0,0,0,0)',                              // 边框颜色
                strokeWidth: options.strokeWidth ? options.strokeWidth : 0,                             // 边框宽度
                strokeDashArray: options.strokeDashArray ? options.strokeDashArray : [0, 0],                    // 边框样式 虚线 [5,1]     直线[0,0]

                minScaleLimit: 0.0001,                            //  最小限制

                flipX: false,
                flipY: false,
                originX: 'left',
                originY: 'top',
                lockSkewingX: true,                  //禁掉按住shift时的变形
                lockSkewingY: true,
                stopContextMenu: true,                            //禁掉鼠标右键默认事件


            });
            canvasObj.setCoords();
            this.canvas.add(canvasObj);
            this.setTop();  //遮罩置顶
            this.canvas.renderAll();
            return canvasObj;
        },

        //返回灰边框边距
        returnXY() {
            return {x: this.xLeft, y: this.yTop};
        },

        //设置画布上元素禁止选中
        setCompunentsNoselect() {
            let objects = this.getObjects();
            for (let i in objects) {
                if (objects[i].component === 'component') {
                    objects[i].set('selectable', false);
                    this.canvas.requestRenderAll();
                    this.canvas.renderAll();
                }
            }
        },

        //取消上面禁止选中
        setCompunentsCanselect() {
            let objects = this.getObjects();
            for (let i in objects) {
                if (objects[i].component === 'component' && objects[i].visible !== false) {
                    objects[i].set('selectable', true);
                    this.canvas.requestRenderAll();
                    this.canvas.renderAll();
                }
            }
        },

        //获取自己组装的元素
        getObjectsNew() {
            let objects = this.getObjects();
            let newobj = [];
            for (let i in objects) {
                if (objects[i].component === 'component') {
                    newobj.push(objects[i]);
                }
            }
            return newobj;
        },
        //清空画布所有元素
        ClearAllObjects() {
            let objects = this.getObjects();
            let newobj = [];
            for (let i in objects) {
                if (objects[i].component === 'component') {
                    newobj.push(objects[i]);
                    this.canvas.remove(objects[i]);
                    this.canvas.requestRenderAll();
                    this.canvas.renderAll();
                }
            }
            return newobj;
        },

        //文本编辑时，自动切割
        clipText(cur) {
            this.setActiveObject(cur);
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },


        //设置鼠标手
        setCursor(status) {
            if (status == 1) {
                fabric.Canvas.prototype.defaultCursor = "url('data:image/ico;base64,AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////EPPz80y5ubmxx8fHif///x7///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/gTz8/NgdXV16Wpqav9zc3P5srKyqff39x4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E9fX1RIiIiN1zc3P/YWFh/7S0tP9tbW3/w8PDnf///wwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////BObm5kyPj4/PkZGR//Hx8f/Jycn/ampq/5GRkf+Hh4fh////NgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wT///9AiYmJ2YuLi//8/Pz///////////+7u7v/Hh4e/8HBwbX///8OAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E5OTkTIuLi9OVlZX/9PT0///////+/v7/5OTk/3h4ePusrKzJ+Pj4SgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////BP///0CLi4vTiIiI//n5+f///////////+zs7P9zc3P/p6entf///yr+/v4CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///wTm5uZMiYmJ2ZWVlf/5+fn//v7+//7+/v/h4eH/dXV1+6+vr6v4+Pgk////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+/v4E9fX1RI+Pj8+Li4v/9PT0///////+/v7/8PDw/3Jycv2kpKS3////Kv///wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////BO7u7kaIiIjdkZGR//z8/P///////////+Hh4f9ycnL9s7Ozqf///yYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/gLq6upKkJCQzY+Pj//y8vL///////7+/v/s7Oz/dXV1+6SkpLf///8m////AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8E/v7+QIiIiN2NjY3//Pz8////////////5OTk/3Nzc/+vr6+r////KgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////BOTk5EyNjY3Pk5OT//Pz8////////v7+/+bm5v94eHj7p6entfj4+CT///8CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///84ioqK1YiIiP/8/Pz////////////p6en/dHR0/6mpqbH///8q////AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/hbIyMiLtbW10eDg4FYAAAAA/f39IqSkpNVUVFT/tra2//7+/v/+/v7/4uLi/3d3d/usrKyv9fX1Jv7+/gIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA3d3dXnZ2dvOAgID/q6urzf///xT8/Pw8cHBw/7CwsP92dnb/sLCw/+3t7f9xcXH/pqamt////yr+/v4CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADW1tZ4b29v/7Gxsf+hoaHn////JMPDw614eHj/9vb2//X19f9tbW3/MjIy/bm5ubf///8kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANbW1nhvb2//sbGx/6Ghoef+/v5UkJCQ57Ozs//IyMj/aGho/19fX/2mpqbX////Tv///wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1tbWeG9vb/+xsbH/oaGh5/7+/l6IiIjrgoKC/3t7e/PY2Nit+vr6ev///xgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADW1tZ4b29v/7Gxsf+hoaHn////JtPT02LKysqV6OjoPv///w7///8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP7+/gL///8a////Gv///xr///8a////GtbW1nhvb2//sbGx/6Ghoef///8s////Gv///xr///8a////Gv7+/hAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8YyMjIiaSkpOekpKTnpKSk56SkpOekpKTno6Oj72lpaf+0tLT/ioqK/aSkpOekpKTnpKSk56SkpOekpKTnra2tzeDg4FYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP///0xpaWnzra2t/62trf+tra3/ra2t/62trf+tra3/vLy8/+bm5v+ysrL/ra2t/62trf+tra3/ra2t/62trf9+fn7/tbW10QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/v7+LJeXl8VsbGz/bGxs/2xsbP9sbGz/bGxs/2tra/9nZ2f/vr6+/2ZmZv9sbGz/bGxs/2xsbP9sbGz/bGxs/3R0dPPIyMiLAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8G9/f3LNra2nLa2tpy2tractra2nLa2tpy0NDQpW9vb/+xsbH/oqKi79vb23ba2tpy2tractra2nLa2tpy4eHhWv7+/hYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADW1tZ4b29v/7Gxsf+hoaHn////IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANbW1nhvb2//sbGx/6Ghoef///8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1tbWeG9vb/+xsbH/oaGh5////yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADW1tZ4b29v/7Gxsf+hoaHn////IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANbW1nhvb2//sbGx/6Ghoef///8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA9vb2LJeXl8VpaWnzx8fHif///wIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD///8G/v7+LP///0z///8YAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA////5////8P///+B////Af///gH///wD///4B///8A///+Af///AP///gH///wD///4B///8A///OAf//xgP//8QH///ED///xD///8b////H///gAB//4AAP/+AAD///h////8f////H////x////8f////H////x////////8=') ,auto";
                this.cursor = 1;

            } else if (status == 2) {
                fabric.Canvas.prototype.defaultCursor = 'grab';
                this.cursor = 2;
            } else if (status == 3) {
                fabric.Canvas.prototype.defaultCursor = 'grabbing';
                this.cursor = 3;
            } else if (status == 4) {
                fabric.Canvas.prototype.defaultCursor = 'zoom-in';  //+
                this.cursor = 4;
            } else if (status == 5) {
                fabric.Canvas.prototype.defaultCursor = 'zoom-out'; //-
                this.cursor = 5;
            } else {
                fabric.Canvas.prototype.defaultCursor = 'default';
                this.cursor = 0;
            }
        },

        //获取当前画布的缩放比例
        getZoom() {
            let zoom = this.canvas.getZoom();
            return zoom;

        },


        //判断是表格的表头还是表体 group.dirty = true
        judeisTableHeadorBody(options) {
            let objects = options.target._objects;
            let col = 0;
            let row = 0;

            objects.forEach((object) => {
                if (object.left + options.target.width / 2 < options.pointer.x - options.target.left
                    && options.pointer.x - options.target.left < object.left + options.target.width / 2 + object.width) {
                    col = object.no;
                }
                if (object.top + options.target.height / 2 < options.pointer.y - options.target.top
                    && options.pointer.y - options.target.top < object.top + options.target.height / 2 + object.height) {
                    row = object.nrow;
                }
            });
            return {row: row, col: col}
        },

        //改表头的文字
        setTableHeadData(groups, nrow, no, text) {
            groups.tableHead.data[no - 1].name = text;
            groups._objects.forEach((object) => {
                if (object.isType === 'table-theadtext' && object.nrow === nrow && object.no === no) {
                    object.set('text', text);
                }
            });
            this.canvas.requestRenderAll();
            this.canvas.renderAll();
        },

        //改表头的样式
        setTableHeadStyle(groups, tableHeadstyle) {
            groups.tableHead.style = {...groups.tableHead.style, ...tableHeadstyle};
            groups._objects.forEach((object) => {
                if (object.isType === 'table-theadbg') {
                    object.set('fill', tableHeadstyle.bgColor);
                }
                if (object.isType === 'table-theadtext') {
                    object.set('fontSize', tableHeadstyle.fontSize);
                    object.set('fill', tableHeadstyle.fontColor);
                    object.set('fontType', tableHeadstyle.fontType);
                    object.set('lineHeight', tableHeadstyle.lineHeight);
                }
                this.canvas.requestRenderAll();
                this.canvas.renderAll();
            })
        },

        //改表体的样式
        setTableBodyStyle(groups, tabletbodystyle) {
            groups.tableBody.style = {...groups.tableBody.style, ...tabletbodystyle};
            groups._objects.forEach((object) => {
                if (object.isType === 'table-tbodybg') {
                    object.set('fill', tabletbodystyle.bgColor);
                }
                if (object.isType === 'table-tbodytext') {
                    object.set('fontSize', tabletbodystyle.fontSize);
                    object.set('fill', tabletbodystyle.fontColor);
                    object.set('fontType', tabletbodystyle.fontType);
                    object.set('lineHeight', tabletbodystyle.lineHeight);
                }
                this.canvas.requestRenderAll();
                this.canvas.renderAll();
            })
        },
        //设置表头的高度
        setTableHeadHeight(group, height) {
            if (!height) {
                return;
            }
            let canvas = this.canvas;
            let tableStyle2 = group.item(0).tableStyle;
            let tableHead2 = group.item(0).tableHead;
            let tableBody2 = group.item(0).tableBody;

            group.tableHead.style.height = height; //修改表格表头数据
            tableHead2.style.height = height;             //表头高度修改

            canvas.remove(group);

            new fabric.tableView(canvas, tableStyle2, tableHead2, tableBody2);

            canvas.requestRenderAll();
            canvas.renderAll();
        },


        //设置 某列的样式和宽度
        //style: width ,bgcolor, fontType, fontSize, fontColor, position
        setTableHeadHeight(group, no, style) {
            if (!style || !style) {
                return;
            }

            let canvas = this.canvas;
            let tableStyle2 = group.item(0).tableStyle;
            let tableHead2 = group.item(0).tableHead;
            let tableBody2 = group.item(0).tableBody;

            group.tableHead.style.height = height; //修改表格表头数据
            tableHead2.style.height = height;             //表头高度修改

            canvas.remove(group);

            new fabric.tableView(canvas, tableStyle2, tableHead2, tableBody2);

            canvas.requestRenderAll();
            canvas.renderAll();
        },


        //按原来的id表格
        setNewTable(groups, table) {
            if (!table) {
                table = groups.item(0).tableStyle;
            }
            let canvas = this.canvas;
            canvas.remove(groups);
            //console.log(table);
            let canvasObject = new fabric.tableList(this.canvas, table);
            let that = this;
            setTimeout(() => {
                // console.warn(canvasObject.table);
                that.setActiveObject(canvasObject.table.group);
                canvasObject.table.group.setCoords();
                that.canvas.add(canvasObject);
                that.setTop();                                         //遮罩置顶
            }, 1);
            canvas.requestRenderAll();
            canvas.renderAll();
        },


        //重新做文本
        setNewTextRect(groups, data) {
            if (!data) {
                return;
            }

            let canvas = this.canvas;
            canvas.remove(groups);

            let canvasObject = new fabric.RectWithText(data.rectOptions, data.textOptions, data.textdemo);

            let that = this;
            setTimeout(() => {
                // console.warn(canvasObject);
                that.setActiveObject(canvasObject);
                canvasObject.setCoords();
                that.canvas.add(canvasObject);
                that.setTop();                                         //遮罩置顶
            }, 1);
            canvas.requestRenderAll();
            canvas.renderAll();
        },


        //文本不使用 的文本
        textStyleFormat: function (target, text) {

            //  console.log(target.maxLines,target.omitStyleText,target.newline);
            if (!target.maxLines) {
                return target.text;
            }
            if (!target.omitStyleText) {
                return target.text;
            }

            let linewords = target.text;
            let wordJoiners = /[\n\t\r]/;
            // console.log(target.text,text)
            //  console.warn('linewords*******************0',linewords);
            let lines = linewords.split(wordJoiners);     //先按照回车符等分隔多行
            let newtext = linewords;

            if (target.newline !== '') {

                if (target.newline && target.newline !== '') {   //换行符 newline
                    let newwordJoiners = target.newline;
                    lines.forEach((line, i) => {
                        if (line.indexOf(newwordJoiners) !== -1) {   //如果遇到填写的分隔符
                            let moreline = line.split(newwordJoiners);
                            lines.splice(i, 1);
                            lines.splice(i, 0, ...moreline);
                        }
                    });
                    newtext = '';
                    for (var i = 0; i < lines.length; i++) {
                        if (i === lines.length - 1) {
                            newtext = newtext + lines[i];
                        } else {
                            newtext = newtext + lines[i] + '\n';
                        }

                    }
                }
            }

            // console.log(newtext);
            let widthlines = target._splitTextIntoLines(newtext).lines; //根据宽度切割行
            for (var j = 0; j < widthlines.length; j++) {
                if (widthlines[j] === '') {
                    widthlines.splice(j, 1);
                }
            }
            //console.log(widthlines);

            if (target.maxLines && widthlines.length > target.maxLines) { //最大行数 maxLines
                //console.log('符合最大行数限制',target.maxLines);
                newtext = '';
                for (var i = 0; i < target.maxLines; i++) {
                    if (i === target.maxLines - 1) {
                        newtext = newtext + widthlines[i]; //重新组装显示行
                    } else {
                        newtext = newtext + widthlines[i] + '\n'; //重新组装显示行
                    }

                }
                if (target.omitStyleText !== '无') { //超出替换 omitStyle
                    newtext = newtext.substring(0, newtext.length - 1) + target.omitStyleText;  //.substring(0, newtext.length - 3)
                    target.selectionEnd = target.selectionStart = newtext.length;
                } else {
                    target.selectionEnd = target.selectionStart = newtext.length;
                }
            }

            // console.log(newtext);
            return newtext;

        },

        //文本不使用 的文本
        newtextStyleFormat: function (target, text) {

            //   console.log('触发文本裁剪',target.width);
            //  console.log(target.maxLines,target.omitStyleText,target.newline);
            if (!target.maxLines) {
                return target.text;
            }
            if (!target.omitStyleText) {
                return target.text;
            }

            let linewords = text;
            let wordJoiners = /[\n\t\r]/;
            // console.log(target.text,text)
            //  console.warn('linewords*******************0',linewords);
            let lines = linewords.split(wordJoiners);     //先按照回车符等分隔多行
            let newtext = linewords;

            if (target.newline !== '') {

                if (target.newline && target.newline !== '') {   //换行符 newline
                    let newwordJoiners = target.newline;
                    lines.forEach((line, i) => {
                        if (line.indexOf(newwordJoiners) !== -1) {   //如果遇到填写的分隔符
                            let moreline = line.split(newwordJoiners);
                            lines.splice(i, 1);
                            lines.splice(i, 0, ...moreline);
                        }
                    });
                    newtext = '';
                    for (var i = 0; i < lines.length; i++) {
                        if (i === lines.length - 1) {
                            newtext = newtext + lines[i];
                        } else {
                            newtext = newtext + lines[i] + '\n';
                        }

                    }
                }
            }

            // console.log(newtext);
            let widthlines = target._splitTextIntoLines(newtext).lines; //根据宽度切割行
            for (var j = 0; j < widthlines.length; j++) {
                if (widthlines[j] === '') {
                    widthlines.splice(j, 1);
                }
            }
            //console.log(widthlines);

            if (target.maxLines && widthlines.length > target.maxLines) { //最大行数 maxLines
                //console.log('符合最大行数限制',target.maxLines);
                newtext = '';
                for (var i = 0; i < target.maxLines; i++) {
                    if (i === target.maxLines - 1) {
                        newtext = newtext + widthlines[i]; //重新组装显示行
                    } else {
                        newtext = newtext + widthlines[i] + '\n'; //重新组装显示行
                    }

                }
                if (target.omitStyleText !== '无') { //超出替换 omitStyle
                    newtext = newtext.substring(0, newtext.length - 1) + target.omitStyleText;  //.substring(0, newtext.length - 3)
                    target.selectionEnd = target.selectionStart = newtext.length;
                } else {
                    target.selectionEnd = target.selectionStart = newtext.length;
                }
            }

            // console.log(newtext);
            return newtext;

        },

        //文本前后缀加背景颜色
        newstyles(options, newtext) {
            let prenumber = options.prefix.length;
            let postnumber = options.postfix.length;
            let number = (options.prefix + options.content).length;
            let styles = {0: {}};
            for (var i = 0; i < prenumber; i++) {
                styles[0][i] = {textBackgroundColor: '#ff0'}
            }
            for (var j = 0; j < postnumber; j++) {
                styles[0][number + j] = {textBackgroundColor: '#ff0'};
            }

            if (options.lineBreak !== '' && newtext.length === (options.prefix + options.content + options.postfix).length && newtext.indexOf(options.postfix) > -1) {
                //按规则换行省略后的文字和原文字数相同，且包含后缀
                let linArray = newtext.split(/[\n\t\r]/);
                let postnumber = options.postfix.length;
                let startno = linArray[linArray.length - 1].length - options.postfix.length;
                styles[linArray.length - 1] = {};
                for (var s = 0; s < postnumber; s++) {
                    styles[linArray.length - 1][startno + s] = {textBackgroundColor: '#ff0'};
                }

            }
            return styles;
        },

        /**  文本不使用时:
         * isElasticSize === 0
         * 文本内容切换时 content
         * 最大行数切换时 maxLines
         * 换行符切换时 omitStyleText omitStyle
         * 结尾符切换时 newline
         *
         * target =====> TextRect
         */
        async textIsUsually(target, text) {
            //console.log('isElasticSize-----',target.isElasticSize);

            if (target.isElasticSize === 0) {
                let allobjects = this.getObjectsNew();
                allobjects.forEach((obj) => {

                    if (obj.id === target.id && obj.isType === 'TextRect') {
                        obj.textdemo = text;
                        obj.content = text;
                    }

                    if (obj.id === target.id && obj.isType === 'TextRect-text') {

                        let realtext = this.textStyleFormat(obj, text);

                        obj.set('text', realtext);
                        obj.set('textdemo', text);
                        obj.set('height', target.height - obj.yTop - obj.yBot);


                        this.renderCanvas(); //渲染一下
                    }
                });
            }

        },

        //文本切换类型需要重绘
        async changeTextType(target, text) {


            let newtext = target.textdemo.replace(/[\r\n]/g, "");

            //  console.warn('textRectdata',target.id,target.isElasticSize,target.textdemo,newtext);

            let newtextdata = {
                id: JSON.parse(JSON.stringify(target.id)),

                angle: JSON.parse(JSON.stringify(target.angle)),
                left: JSON.parse(JSON.stringify(target.left)) + this.returnXY().x,
                top: JSON.parse(JSON.stringify(target.top)) + this.returnXY().y,
                width: JSON.parse(JSON.stringify(target.width)),
                height: JSON.parse(JSON.stringify(target.height)),
                fontColor: JSON.parse(JSON.stringify(target.fontColor)),
                color: JSON.parse(JSON.stringify(target.fontColor)),
                fontFamily: JSON.parse(JSON.stringify(target.fontFamily)),
                textAlign: JSON.parse(JSON.stringify(target.textAlign ? target.textAlign : 'left')),
                fontStyle: JSON.parse(JSON.stringify(target.fontStyle ? target.fontStyle : 'normal')),

                maxLines: JSON.parse(JSON.stringify(target.maxLines ? target.maxLines : 3)),
                omitStyleText: JSON.parse(JSON.stringify(target.omitStyleText ? target.omitStyleText : '无')),
                omitStyle: JSON.parse(JSON.stringify(target.omitStyle ? target.omitStyle : 0)),
                newline: JSON.parse(JSON.stringify(target.newline ? target.newline : '')),

                minFontSize: JSON.parse(JSON.stringify(target.minFontSize ? target.minFontSize : 12)),

                isElasticSize: JSON.parse(JSON.stringify(target.isElasticSize ? target.isElasticSize : 0)),
                fontSize: JSON.parse(JSON.stringify(target.fontSize ? target.fontSize : 12)),
                textdemo: JSON.parse(JSON.stringify(newtext ? newtext : 'TEXT')),   //
                verticalSpace: target.verticalSpace ? target.verticalSpace : 0,
                scaleX: 1,
                scaleY: 1,

                visible: JSON.parse(JSON.stringify(target.visible)),
                zIndex: JSON.parse(JSON.stringify(target.zIndex)),
            };

            let canvas = this.canvas;
            canvas.remove(target);
            let allobjects = this.getObjectsNew();
            allobjects.forEach((obj) => {
                if (obj.id === target.id && obj.isType === 'TextRect-text') {
                    canvas.remove(obj);
                }
            });

            // console.log('new',newtextdata);

            let obj = await this.createElement('TextRect', {...newtextdata});
            // console.log(obj.id);

            let that = this;
            setTimeout(() => {


                that.setTop();                              //遮罩置顶
                canvas.requestRenderAll();
                canvas.renderAll();
            }, 10);
        },

        //获取画布的相对定位
       async getoriginx(){
            let objects = this.getObjects();
            let poiter;
            objects.forEach((one)=>{
               // console.log(one);
                if(one.type==='sBg'){
                    poiter = one.oCoords.tl;
                }
            });
            return poiter;
        },

        //改变文本的属性 new
        async changeTextRender(options,text,target){
            console.log(options,text,target);
            return new Promise(async (resolve ,reject)=> {
                let newtext = text;
                if(options.isElasticSize===2){  //自适应的文本需要去空格保持一行
                    newtext = text.replace(/[\r\n]/g, "");
                }
                let xy = await this.getoriginx();
                console.log(xy);
                let newtextdata = {
                    id: JSON.parse(JSON.stringify(options.id)),

                    angle: JSON.parse(JSON.stringify(options.angle)),
                    left: JSON.parse(JSON.stringify(options.left)),       // - xy.x,
                    top: JSON.parse(JSON.stringify(options.top)),          // - xy.y,
                    width: JSON.parse(JSON.stringify(options.width)),
                    height: JSON.parse(JSON.stringify(options.height)),
                    fontColor: JSON.parse(JSON.stringify(options.fontColor)),
                    color: JSON.parse(JSON.stringify(options.fontColor)),
                    fontFamily: JSON.parse(JSON.stringify(options.fontFamily)),
                    fontType: JSON.parse(JSON.stringify(options.fontType)),
                    textAlign: JSON.parse(JSON.stringify(options.textAlign ? options.textAlign : 'left')),

                    fontWeight: JSON.parse(JSON.stringify(options.fontWeight ? options.fontWeight : 'normal')),
                    linethrough: JSON.parse(JSON.stringify(options.linethrough ? options.linethrough :false)),
                    underline: JSON.parse(JSON.stringify(options.underline ? options.underline : false)),
                    fontStyle: JSON.parse(JSON.stringify(options.fontStyle ? options.fontStyle : 'normal')),

                    maxLines: JSON.parse(JSON.stringify(options.maxLines ? options.maxLines : 3)),
                    omitStyleText: JSON.parse(JSON.stringify(options.omitStyleText ? options.omitStyleText : '无')),
                    omitStyle: JSON.parse(JSON.stringify(options.omitStyle ? options.omitStyle : 0)),
                    newline: JSON.parse(JSON.stringify(options.lineBreak ? options.lineBreak : '')),

                    minFontSize: JSON.parse(JSON.stringify(options.minFontSize ? options.minFontSize : 12)),

                    isElasticSize: JSON.parse(JSON.stringify(options.isElasticSize ? options.isElasticSize : 0)),
                    fontSize: JSON.parse(JSON.stringify(options.fontSize ? options.fontSize : 12)),
                    textdemo: JSON.parse(JSON.stringify(newtext ? newtext : 'TEXT')),   //
                    verticalSpace: options.verticalSpace ? options.verticalSpace : 0,
                    scaleX: 1,
                    scaleY: 1,

                    visible: JSON.parse(JSON.stringify(options.visible)),
                    zIndex: JSON.parse(JSON.stringify(options.zIndex)),
                };

                console.log('newtextdata:',newtextdata)

                let canvas = this.canvas;
                canvas.remove(target);
                let allobjects = this.getObjectsNew();
                allobjects.forEach((obj) => {
                    if (obj.id === options.id ) { //&& obj.isType === 'TextRect'
                        canvas.remove(obj);
                    }
                });
                let newobj = await this.createElement('TextRect', {...newtextdata});
               // console.warn(newobj);

                setTimeout(()=>{
                    //图层排序 开始
                    let newallobjects = this.getObjects();
                    newallobjects.sort((a,b)=>{
                        return a.zIndex-b.zIndex;
                    });
                    let newindex = 1;
                    newallobjects.forEach((onelayer,i)=>{
                       // console.log(onelayer.component,onelayer.isType,onelayer.id);
                        if(onelayer.component ==='component'){
                            this.moveToshow(onelayer,newindex); //移动图层
                            newindex = newindex + 1;
                        }
                    });
                    //图层排序 结束

                    canvas.requestRenderAll();
                    canvas.renderAll();

                    resolve(newobj);
                },10);


            });

        },


        //改变画布的变形操作
        changeCanvas(data){
           console.log(this.canvas);
           if(data===1 || data === true){
               fabric.Object.prototype.borderColor = '#0062B2';
               fabric.Object.prototype.cornerColor = '#0062B2';

               fabric.Object.prototype.hasControls = false;
               fabric.Object.prototype.hasRotatingPoint = false;
           }
           else{
               fabric.Object.prototype.borderColor = '#999';
               fabric.Object.prototype.cornerColor = '#999';

               fabric.Object.prototype.hasControls = true;
               fabric.Object.prototype.hasRotatingPoint = true;
           }
           let obj = this.canvas.getActiveObject();
            obj.setCoords();
            this.canvas.renderTop();
            this.canvas.renderAll();

        },






    }
  }
</script>



<style lang="scss">
    .btnchange{
        opacity: 0;
        cursor: col-resize;
        outline: none;
        &:hover{
             opacity: 1;
         }
    }
</style>
<style scoped lang="scss">


  .bigbox{
      position:relative;
      max-height: 100vh;
      /*border: 1px solid #ddd;*/
      /*margin:50px auto;*/
      overflow: hidden;
      /*border: 1px solid #E5E9F2;
      box-sizing: border-box;*/
  }
  .content{
    position:relative;
    overflow: auto;
    /*background: url("../../../static/images/psbg.png") repeat;*/
    background: #f1f1f1;
  }
  .x-line{
    width: 100%;
    height: 18px;
    left: 18px;
    opacity: 0.8;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAYAAAAZk42HAAAACXBIWXMAAAsTAAALEwEAmpwYAAA6mGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDIwLTEwLTE0VDE0OjUwOjIwKzA4OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjAtMTAtMTRUMTc6NTY6MjMrMDg6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIwLTEwLTE0VDE3OjU2OjIzKzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPgogICAgICAgICAgICA8cmRmOkJhZz4KICAgICAgICAgICAgICAgPHJkZjpsaT54bXAuZGlkOjYwMWNmMzFmLTI5Y2UtZWY0ZC1iYzNiLWZmMDNhNzFmNTM2ZTwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpCYWc+CiAgICAgICAgIDwvcGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOmU0MTdkNzFiLTk0OTQtZTQ0Mi1hNjRiLTFkYjBhY2Q0YzUyYzwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDo1MmNmMGFlNi0wYjk5LWIyNDMtODA2Mi04NWIwNDk2MDljYmQ8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDo1MmNmMGFlNi0wYjk5LWIyNDMtODA2Mi04NWIwNDk2MDljYmQ8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6NTJjZjBhZTYtMGI5OS1iMjQzLTgwNjItODViMDQ5NjA5Y2JkPC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDIwLTEwLTE0VDE0OjUwOjIwKzA4OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDplNDE3ZDcxYi05NDk0LWU0NDItYTY0Yi0xZGIwYWNkNGM1MmM8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMjAtMTAtMTRUMTc6NTY6MjMrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjUwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz6N3U9SAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABESURBVHja7M+xEQAgDMNA779BphUtBTUXggo1PjefqgLI3otbhAi5CDnV/fcfpHtChAgRIkSIEEgmIEZBFgAAAP//AwBdbXYX1O3j3gAAAABJRU5ErkJggg==);
    /*background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAYAAAAZk42HAAAACXBIWXMAAAsTAAALEwEAmpwYAAA5z2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDIwLTEwLTE0VDE0OjUwOjIwKzA4OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjAtMTAtMTRUMTQ6NTM6MTgrMDg6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIwLTEwLTE0VDE0OjUzOjE4KzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjJlNGFiNGFiLTQ5MDQtNzg0Mi04MjQyLTM0ZjE5MWQ5NzQ3MDwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDpmZGQ2MzFhNC0yOWQwLTAwNDktYWRiZi1jZmM1ODI0OGMwYTc8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDpmZGQ2MzFhNC0yOWQwLTAwNDktYWRiZi1jZmM1ODI0OGMwYTc8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6ZmRkNjMxYTQtMjlkMC0wMDQ5LWFkYmYtY2ZjNTgyNDhjMGE3PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDIwLTEwLTE0VDE0OjUwOjIwKzA4OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDoyZTRhYjRhYi00OTA0LTc4NDItODI0Mi0zNGYxOTFkOTc0NzA8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMjAtMTAtMTRUMTQ6NTM6MTgrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjUwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz44Q+t8AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAA8SURBVHja7M+xDQAACAJB99/gp9U1FJ+EhtBcAZ3QAjohQoQIESJEiJCXkO2/bMjFTchKSEIHAAD//wMAQq9ONkf1DTcAAAAASUVORK5CYII=);*/
    border-right:1px dashed #000;
  }
  .y-line{
    width: 18px;
    height: 100%;
    top: 18px;
    opacity: 0.8;
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAyCAYAAABRYothAAAACXBIWXMAAAsTAAALEwEAmpwYAAA5z2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDIwLTEwLTE0VDE0OjU1OjUzKzA4OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjAtMTAtMTRUMTg6MDM6MzgrMDg6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIwLTEwLTE0VDE4OjAzOjM4KzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOjYwMWNmMzFmLTI5Y2UtZWY0ZC1iYzNiLWZmMDNhNzFmNTM2ZTwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkluc3RhbmNlSUQ+eG1wLmlpZDpmNTBlYmMyZC01MmE4LTUzNDMtYjVjNS0zZTY4YzAzMDY2ZGU8L3htcE1NOkluc3RhbmNlSUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDo2MDFjZjMxZi0yOWNlLWVmNGQtYmMzYi1mZjAzYTcxZjUzNmU8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6N2ZlNmViZDgtYTQwNS1jMTRhLTk2MTEtYjczNDg4MDU5Yjc4PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDIwLTEwLTE0VDE0OjU1OjUzKzA4OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDpmNTBlYmMyZC01MmE4LTUzNDMtYjVjNS0zZTY4YzAzMDY2ZGU8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMjAtMTAtMTRUMTg6MDM6MzgrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjUwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz4gLB/dAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAABKSURBVHja7NKhDQAwDMTA33+DTOuilpUkUkFl8FJQwMmpKiYDAiT7mO7nRzc8jR5gd9HFtmzLFtuyLduyxbZsy/bR2QIAAP//AwDgonYXrvU/uwAAAABJRU5ErkJggg==);

    border-bottom:1px dashed #000;
  }
  .number{
    position: absolute;
    font: 10px/1 Arial, sans-serif;
    color: #333;
    cursor: default;
  }
  .x-line .number{
    top: 7px;
  }
  .y-line .number{
    width: 8px;
    left: 8px;
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
