<template>
    <div class="demobox">
        <!--<div style=" background: red; height: 500px;">{{123}}</div>-->

        <div style="position: fixed; top:0; margin-left:250px; z-index:99999; width: 500px; height:auto; box-shadow: 3px 4px 3px #eee; background: #999; border:1px solid #000;" v-if="showimg">
            <img :src="img" alt="" width="100%">
        </div>

        <div style="display: flex; flex-direction: row;">
            <div style="width: 100px; height: calc(100vh - 100px);">
                <GeminiScrollbar>
                    <div style=" height: 1000px; padding-left: 10px; padding-top: 50px; display:flex; flex-direction: column;">
                        <button @click="toHorizontalCenterDistribution">水平分布</button>

                        <button @click="toshow" class="btn" > 预 览 </button>
                        <button  class="btn" @click="addCom('Rect')"> 矩 形 </button>
                        <button  class="btn" @click="addCom('Circle')"> 椭 圆 </button>
                        <button  class="btn" @click="addCom('Rectangle')"> 圆角矩形 </button>
                        <button  class="btn" @click="addCom('Parallelogram')"> 平行四边 </button>
                        <button  class="btn" @click="addCom('Dottedline',{ strokeWidth:2,DottedlineType:2,})"> 直 线 </button>
                        <button  class="btn" @click="addCom('EqualTriangle')"> 三角形 </button>
                        <button  class="btn" @click="addCom('Image',{width:80,height:80,})"> 图 形 </button>
                        <button  class="btn" @click="addCom('Barcode',{originXY:['center','top'] })"> 条 码 </button>
                        <button  class="btn" @click="addCom('Qrcode',{width:80,height:80,})"> 二维码 </button>

                        <button  class="btn" @click="addCom('Time',{text:'123456789,.:1234567890'})"> 时间 </button>

                        <button  class="btn" @click="addCom('Text',{width:150,height:300,fontSize:14,fontFamily:'微软雅黑',textback:'#fff',textcolor:'#f00',textdemo:'中国的文字总是这么的有韵味哦',originXY:['left','top']})"> 文 本1 </button>

                        <button  class="btn" @click="addCom('Text2',{width:150,height:300,textback:'#ff0',textcolor:'#f00',textdemo:'aaaaaaaaaaaaaaaaaaaaaa',originXY:['center','center']})"> 文 本2 </button>

                        <button  class="btn" @click="addCom('test',{width:150,height:300,textback:'#ff0',textcolor:'#f00',textdemo:'abcdefghijklmnopqrstuvwxyz&ABCDEFGHIJKLMNOPQRSTUVWXYZ&aaaa',originXY:['right','bottom']})"> 文 本3 </button>
                    </div>
                </GeminiScrollbar>

            </div>


            <div  style="width: 300px;height: 800px; position: fixed ; top:100px; right:0; z-index: 100; overflow:hidden;">
                <GeminiScrollbar>
                    <div style="width: 300px; height: 1000px; background: #fff; overflow:hidden; padding: 20px;">

                        <h3>X: {{originx }} Y: {{originy}}</h3>
                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">w:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.width"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>
                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">h:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.height"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>
                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">x:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.left"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>
                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">y:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.top"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>

                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">size:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.fontSize" :min="currentObj.minFontSize"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>

                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">maxline:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.maxLines"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/></div>


                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">br:</b>
                            <input type="text" @change="changeInputObj" v-model="currentObj.br"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>

                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">omit:</b>
                            <input type="text" @change="changeInputObj" v-model="currentObj.omit"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>

                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">lH:</b>
                            <input type="number" @change="changeInputObj" v-model="currentObj.lineHeight"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>



                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">imgText:</b>
                            <input type="text" @change="changeInputObj" v-model="currentObj.imgText"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>


                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">isElasticSize:</b>
                            <input type="text" @change="changeInputObj" v-model="currentObj.isElasticSize"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>


                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">scaleY:</b>
                            <input type="text" @change="changeInputObj" v-model="currentObj.scaleY"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>

                        <div style="line-height: 40px; height: 40px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">TOP:</b>
                            <input type="text" @change="changeInputObj" v-model="currentObj.texttop"  style="border:1px solid #ddd;height: 30px; line-height: 30px; font-size: 14px;"/> </div>

                        <div style="line-height: 30px; height: 80px;"> <b style="width: 50px; display: inline-block; text-align: right;margin-right: 10px;">text:</b>
                            <textarea  @change="changeInputObj" v-model="currentObj.textdemo"  style="border:1px solid #ddd;height:80px; line-height: 30px; font-size: 14px;"></textarea> </div>
                    </div>

                </GeminiScrollbar>
            </div>

            <div :style="'min-width: calc(100vw - 200px);height: calc(100vh - 100px);width:'+boxWidth+'px;'">
                <Fabric-Canvas ref="canvas" :idno="id" :width="width" :height="height" :boxWidth="boxWidth" :boxHeight="boxHeight"
                               :showRuler="showRuler" :stepLengthp="stepLength" @idAdd="idAdd" @preview ="preview" @setlefttop="setlefttop"
                               @object:selected = "objectselected"
                               @selection:updated="selectionupdated"

                               @object:scaling="objectscaling"
                               @object:scaled = "objectscaled"
                               @object:moved = "objectmoved"
                               @object:rotating = "objectrotating"
                               id="can"></Fabric-Canvas>
            </div>
        </div>




    </div>
</template>

<script>

    export default {
        name: "index2",
        data() {
            return {
                data: '123',
                id: 1,
                width: 800,      //标尺、画布的宽
                height: 500,     //标尺、画布的高
                boxWidth: document.documentElement.clientWidth-250,  //外框宽
                boxHeight: 800,   //外框高
                stepLength: 50,  //标尺单位 每格
                showRuler: [true, true],  //横纵标尺是否显示
                img:'',   //预览图片的
                showimg:false, //显示预览
                origin:[0,0],
                currentObj:{},
                originx:0,
                originy:0,
            }
        },
        mounted() {
            this.boxWidth = document.documentElement.clientWidth-250;
            let _this = this;
            window.onresize = ()=>{
                return (()=>{
                    _this.boxWidth = document.documentElement.clientWidth-250;
                    this.$refs.canvas.setZoom(1);
                    this.$refs.canvas.initBgRect();
                })();
            };
            this.$refs.canvas.setZoom(1);
            this.$refs.canvas.initBgRect();




            this.init();




            /* setTimeout(()=>{
               this.$refs.canvas.setCursor(1); //设置画笔
             },1000);*/

            /*setTimeout(() => {
              this.$refs.canvas.setZoom(1.5);
            }, 2000);*/
        },
        methods: {
            //模板使用调用方法
            idAdd() {
                this.id = this.id + 1;
                // console.warn(this.id);
            },

            setlefttop(x,y){
                this.originx = x;
                this.originy = y;
            },


            //
            addCom(name,options){
                if(!options){
                    options = {};
                }
                this.origin[0] =  this.origin[0] + 10;
                this.origin[1] = this.origin[1] + 10;
                options['left'] = this.origin[0];
                options['top'] = this.origin[1];
                this.$refs.canvas.createElement(name,{...options});
            },

            //预览
            preview(data){
                this.img = data;
            },
            //预览框开关
            toshow(){
                this.$refs.canvas.todata();
                this.showimg = !this.showimg;
            },
            //左对齐
            toHorizontalCenterDistribution(){
                this.$refs.canvas.toHorizontalCenterDistribution();

            },

            //对象选择
            objectselected(obj){
                // console.log('dian',obj);
                // console.log(obj.target );
                if(obj.target){
                    this.changeTargetObj(obj.target);
                }

            },

            //对象选择更新
            selectionupdated(obj){
                // console.log('hua',obj);
                // console.log(obj.target );
                if(obj.target){
                    this.changeTargetObj(obj.target);
                }
            },

            //对象放大
            objectscaled(obj){
                //  console.log('objectscaled');
                if(obj.target){
                    this.changeTargetObj(obj.target);

                    this.changeInputObj();
                }
            },
            //拖拽放大时
            objectscaling(e){
                let cur = this.$refs.canvas.getEditObj();
                let that = this;
                //console.log(e,cur);
                /* if(cur.isType==='Text'){
                     e.target.item(1).set({scaleX: 1});
                     e.target.item(1).set({width: e.transform.width * e.transform.newScaleX});
                     that.$refs.canvas.renderCanvas();
                     cur.setCoords();
                 }*/
            },
            //对象移动
            objectmoved(obj){
                // console.log('objectmoved');
                if(obj.target){
                    this.changeTargetObj(obj.target);
                }
            },
            //对象旋转
            objectrotating(obj){
                // console.log('objectrotating');
                if(obj.target){
                    this.changeTargetObj(obj.target);
                }
            },

            //画布赋值输入框
            changeTargetObj(target){
                if(target){
                    this.$set(this.currentObj,'width',parseInt(target.width ));
                    this.$set(this.currentObj,'height',parseInt(target.height  ));
                    this.$set(this.currentObj,'left',parseInt(target.left - this.originx));
                    this.$set(this.currentObj,'top',parseInt(target.top - this.originy));

                    if(target.isType==='Text2'){
                        console.log(target);
                        this.$set(this.currentObj,'textdemo',target.textdemo);
                        this.$set(this.currentObj,'fontSize',target._objects[1].fontSize);
                        this.$set(this.currentObj,'lineHeight',target._objects[1].lineHeight);

                        this.$set(this.currentObj,'minFontSize',14);

                        this.$set(this.currentObj,'maxLines',target.maxLines);
                        this.$set(this.currentObj,'br',target.br);
                        this.$set(this.currentObj,'omit',target.omit);

                        this.$set(this.currentObj,'originXY',['left','top']);
                    }

                    if(target.isType==='Barcode'){

                        this.$set(this.currentObj,'imgText',target.imgText);
                    }

                    if(target.isType==='Qrcode'){

                        this.$set(this.currentObj,'imgText',target.imgText);
                    }

                    if(target.isType==='Time'){

                        this.$set(this.currentObj,'imgText',target.imgText);
                        this.$set(this.currentObj,'isElasticSize',target.isElasticSize);

                    }
                }
            },

            drawLogo: function(text, fontFamily,fontSize) {
                // 创建画布
                let canvas = document.createElement('canvas');
                // 绘制文字环境
                let context = canvas.getContext('2d');
                // 设置字体
                context.font = fontFamily;
                // 获取字体宽度
                let width = context.measureText(text).width *(fontSize/10);
                // 如果宽度不够 240
                /*if (width < 240) {
                  width = 240;
                } else {
                  width = width + 30;
                }*/
                // 画布宽度
                canvas.width = width;
                // 画布高度
                canvas.height = fontSize;
                // 填充白色
                context.fillStyle = '#000000';
                // 绘制文字之前填充白色
                context.fillRect(0, 0, canvas.width, canvas.height);
                // 设置字体
                context.font = fontSize+ 'px '+ fontFamily;
                // 设置水平对齐方式
                context.textAlign = 'center';
                // 设置垂直对齐方式
                context.textBaseline = 'middle';
                // 设置字体颜色
                context.fillStyle = '#ffffff';
                // 绘制文字（参数：要写的字，x坐标，y坐标）
                context.fillText(text, canvas.width / 2, canvas.height / 2);
                //画布图片的信息
                var data = context.getImageData(0, 0, canvas.width, canvas.height).data;
                let morew = context.getImageData(0, 0, canvas.width, canvas.height).width;
                let moreh = context.getImageData(0, 0, canvas.width, canvas.height).height;

                let coor = [];
                let fontw = [];
                let fonth = [];
                for(let j =0;j<2;j++){
                    coor[j] = [];
                }
                let realdata = [];
                for(let i=0,len=data.length;i<len;i+=4){
                    let red = data[i],
                        green=data[i+1],
                        blue=data[i+2],
                        alpha= data[i+3];
                    if(`${red} ${green} ${blue}` === '0 0 0'){
                        realdata.push(0);
                    }else{
                        realdata.push(1);
                    }
                }

                //计算二维图像
                let lines = [];
                for(var l=0;l<realdata.length;l+=morew){
                    lines[l/morew]=[];
                    for(var m=0;m<morew;m++){
                        lines[l/morew][m] = realdata[l+m];
                        if( realdata[l+m]===1){
                            fonth.push(parseInt(l/morew));
                            fontw.push(m)
                        }
                    }
                }
                //生成base64图像
                let dataUrl = canvas.toDataURL('image/png');

                //计算宽高
                console.log(fontw,fonth,morew,moreh);

                let w = new Set(fontw);
                let neww = Array.from(w); //去重
                let neww2 = neww.sort(function(a,b){return a-b;}); //从小到大排列
                let truefontwidth =neww2[neww2.length-1]-neww2[0]+1;

                let h = new Set(fonth);
                let newh = Array.from(h);//去重
                let newh2 = newh.sort(function(a,b){return a-b;}); //从小到大排列
                let truefontheight =newh2[newh2.length-1]-newh2[0]+1;

                let returndata = {
                    offset:[neww2[0]-0, morew-neww2[neww2.length-1]-1, newh2[0]-0, moreh-newh2[newh2.length-1]-1 ],
                    fontwidth:truefontwidth,
                    fontheight:truefontheight,
                    width:morew,
                    height:moreh,
                    url:dataUrl,
                    lines:lines,
                };

                return returndata;
            },

            //输入框值改变画布
            changeInputObj(){
                //console.log(JSON.stringify(this.currentObj));
                let cur = this.$refs.canvas.getEditObj();
                cur.set({width: parseInt(this.currentObj.width)});
                cur.set({height: parseInt(this.currentObj.height)});
                cur.set({left: parseInt(this.currentObj.left) + parseInt(this.originx)});
                cur.set({top: parseInt(this.currentObj.top) + parseInt(this.originy)});


                if(cur.isType==='Text'){
                    /*cur.item(1).set({fontSize: this.currentObj.fontSize});
                    cur.item(1).set({lineHeight: this.currentObj.lineHeight});


                    let newtext = '';
                    if(this.currentObj.maxLines){
                      let text = this.currentObj.textdemo;      //输入框文案
                      let maxlines = this.currentObj.maxLines;  //最大行数
                      let br = this.currentObj.br;       //句尾换行符
                      let omit = this.currentObj.omit;  //末尾省略符
                      let truetextline = [];            //实际行数

                      let textlines =[];         //根据条件行数
                      let brtext ='';             //换行后文案

                      if(br){
                        textlines = text.split(br);
                        for(var i=0;i<textlines.length;i++){
                          brtext = brtext + textlines[i] +'\n';
                        }
                      }else{
                        brtext = text;
                      }
                      truetextline = [];
                      truetextline = cur.item(1)._splitTextIntoLines(brtext).lines;

                      for(var i=0;i<truetextline.length;i++){
                        if(i<maxlines){
                          newtext = newtext + truetextline[i] +'\n';
                        }
                      }
                      if(text.length>newtext.length){
                        newtext = newtext.substring(0, newtext.length - 4) + omit;
                      }
                    }else{
                      newtext = this.currentObj.textdemo;
                    }

                    cur.item(1).set({text: newtext});
                    cur.set({br: this.currentObj.br});
                    cur.set({maxLines: this.currentObj.maxLines});
                    cur.set({textdemo: this.currentObj.textdemo});
                    cur.set({omit: this.currentObj.omit});*/


                }

                if(cur.isType === 'Barcode'){
                    cur.set({imgText: parseInt(this.currentObj.imgText)});

                    this.$refs.canvas.changeQrcodeImage(cur);
                }

                if(cur.isType === 'Time'){
                    cur.item(1).set({text: this.currentObj.imgText});
                    cur.set({imgText: this.currentObj.imgText});
                    cur.set({width: parseInt(cur.item(1).width)});
                    let that = this;

                    if(parseInt(this.currentObj.isElasticSize) === 2){

                        this.isTime(cur).then((data)=>{
                            console.info(data);

                            cur.item(1).set({
                                scaleY:parseFloat(this.currentObj.scaleY?this.currentObj.scaleY : data.scaleY ),
                                top:parseFloat(this.currentObj.texttop?this.currentObj.texttop : data.top),
                            });

                            cur.set({
                                lockUniScaling:false,

                                clipTo:function(ctx) {
                                    ctx.rect(-cur.item(1).width/2,-cur.item(1).height/2,cur.item(1).width,cur.item(1).height);
                                }
                            });



                            that.$refs.canvas.renderCanvas();
                            cur.setCoords();

                        });




                    }else{
                        cur.item(1).set({scaleY: parseFloat(this.currentObj.scaleY?this.currentObj.scaleY :1 ),top:0});   //cur.height/ cur.item(1).height

                        /*  this.testimgdata(cur).then((testimgdata)=>{
                              console.warn(testimgdata);

                          });*/


                        cur.set({isElasticSize: parseInt(this.currentObj.isElasticSize),lockUniScaling:true, });

                    }

                }

                this.$refs.canvas.renderCanvas();
                cur.setCoords();
            },

            async testimgdata(cur){
                let scaleY2 = cur.scaleY*this.currentObj.scaleY;
                let newimg =await this.$refs.canvas.getFontImgdata(this.currentObj.imgText,cur.item(1).fontFamily,cur.item(1).fontSize,cur.scaleX,scaleY2);
                return newimg;

            },

            async isTime(cur){
                let top = cur.item(1).canvas.contextCache.measureText(cur.item(1).text).actualBoundingBoxAscent;
                let bottom = cur.item(1).canvas.contextCache.measureText(cur.item(1).text).actualBoundingBoxDescent;

                /*let data = this.drawLogo(this.currentObj.imgText,cur.item(1).fontFamily,cur.item(1).fontSize);
                let scaleY = (cur.item(1).fontSize+(cur.item(1).fontSize*0.15))/data.fontheight;  //Math.ceil
                let topkong = (data.height*0.15+data.offset[2]);
                let moreh = (data.height*0.15+ data.height)/2;
                let toph = (moreh - topkong)*(scaleY-1) - (topkong) ;*/

                let data =  await this.$refs.canvas.getFontImgdata(this.currentObj.imgText,cur.item(1).fontFamily,cur.item(1).fontSize,1,1);

                let trueScaleY = cur.height * cur.scaleY / (data.fontheight * cur.scaleY);

                console.log('(',top,bottom,')',data.url,data)

                //  let newimg = await this.$refs.canvas.getFontImgdata(this.currentObj.imgText,cur.item(1).fontFamily,cur.item(1).fontSize,cur.scaleX,cur.scaleY*trueScaleY);

                //  console.warn(newdata,cur.scaleY*(newdata.height/newdata.fontheight));
                //let scaleY2 = cur.scaleY*(newdata.height/newdata.fontheight)

                // let newimg = await this.$refs.canvas.getFontImgdata(this.currentObj.imgText,cur.item(1).fontFamily,cur.item(1).fontSize,cur.scaleX,scaleY2);

                //  console.log(newimg);

                //  let newscaleY = newimg.height/newimg.fontheight;
                //   let newtop = - newimg.offset[2];


                let newtop = -data.offset[2];

                if(data.height/2 > data.offset[2]){
                    newtop = (data.height/2 - data.offset[2])*trueScaleY - data.height/2;

                }else{
                    newtop = -((data.offset[2] - data.height/2 )*trueScaleY + data.height/2);
                    // console.log((data.offset[2] - data.height/2 )*trueScaleY ,data.height/2)
                }

                let newtop2 = 0;
                if(data.height/2 > data.offset[2]){
                    newtop2 = -((data.fontSize/2 - (data.fontSize/2 - (data.height-data.fontSize)))*trueScaleY -data.fontSize/2) +(data.height-data.fontSize);
                }else{
                    newtop2 = -((data.offset[2] - data.height/2 )*trueScaleY + data.height/2);
                }



                //  let data2 =  await this.$refs.canvas.getFontImgdata(this.currentObj.imgText,cur.item(1).fontFamily,cur.item(1).fontSize,1,trueScaleY);

                //  console.log(data2,data2.url);


                //console.log('精确计算缩放top：',newtop,'粗略计算的缩放比：',cur.height * cur.scaleY / (data.fontheight * cur.scaleY));

                console.log(newtop,newtop2,trueScaleY);
                return {scaleY:trueScaleY,top:newtop};
            },

            //初始化
            init() {
                var canvas = this.$refs.canvas;
                // fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';


                this.idAdd();
                canvas.createText('ZKONG11111',{
                    fontSize: 26,
                    left:200,
                    fill:'#ff0000',
                    top:40,
                })

                //圆角矩形
                /*let rectdata = canvas.createRect({
                  id: this.id,
                  width: 100,
                  height: 200,
                  left: 100,
                  top: 400,
                  padding: 0,
                  angle: 0,
                  fill: '#ffffff',
                  stroke: '#000000',
                  strokeWidth: 1,
                  strokeDashArray: [0, 0],
                  scaleX: 1,
                  scaleY: 1,
                  rx: 20,
                  ry: 20,
                  skewX: 10,
                  skewY: 0,
                });*/
                /*this.idAdd();
                canvas.createRect({
                  id: this.id,
                  width: 400,
                  height: 100,
                  left: 0,
                  top: 100,
                  fill: '#ffffff',
                  stroke: '#000000',
                  strokeWidth: 1,
                  strokeDashArray: [10, 4, 3, 4],
                  skewX: 0,
                  skewY: 0,
                });*/


                /*this.idAdd();
                this.$refs.canvas.createRect({
                  id: this.id,
                  width: 30,
                  height: 80,
                  left: 0,
                  top: 200,
                  fill:'#ff0000',
                });

                this.idAdd();
                this.$refs.canvas.createRect({
                  id: this.id,
                  width: 100,
                  height: 10,
                  left: 200,
                  top: 313,
                  fill:'#ff0000',
                  skewX:-40,
                });

                this.idAdd();
                this.$refs.canvas.createRect({
                  id: this.id,
                  width: 300,
                  height:20,
                  left: 310,
                  top: 300,
                  fill:'#000000',
                  skewX:-40,
                });




                this.idAdd();
                canvas.createRect({
                  id: this.id,
                  width: 540,
                  height: 300,
                  left: 10,
                  top: 10,
                  fill: 'rgba(0,0,0,0)',
                  stroke: '#000000',
                  strokeWidth: 1,
                  strokeDashArray: [5,3],
                  skewX: 0,
                  skewY: 0,
                });

                this.idAdd();
                this.$refs.canvas.createRect({
                  id: this.id,
                  width: 560,
                  height: 3,
                  left: 0,
                  top: 130,
                  fill: '#ff0000',
                });

                this.idAdd();
                canvas.createText('ZKONG',{
                  fontSize: 26,
                  left:200,
                  fill:'#ff0000',
                  top:40,
                })

                this.idAdd();
                canvas.createText('PRICETAG MADE IN',{
                  fontSize: 12,
                  left:90,
                  width:150,
                  top:80,
                })

                this.idAdd();
                canvas.createText('ZHANG SAN',{
                  fontSize: 30,
                  left:80,
                  top:198,
                  width:200,
                })

                this.idAdd();
                canvas.createText('DEVELOPMENT ENGINEER',{
                  fontSize: 14,
                  left:80,
                  top:230,
                  width:200,
                })

                this.idAdd();
                canvas.createText('TEL:13801234567',{
                  fontSize: 14,
                  left:80,
                  top:260,
                  width:200,
                })

                this.idAdd();
                canvas.createText('Address:',{
                  fontSize: 16,
                  left:300,
                  top:200,
                  width:60,
                })
                this.idAdd();
                canvas.createText(' Building No. 17, Singapore Tech Park, Hangzhou',{
                  fontSize: 16,
                  left:360,
                  top:200,
                  width:200,
                })

                this.idAdd();
                canvas.createText('Phone:',{
                  fontSize: 16,
                  left:300,
                  top:240,
                  width:60,
                })
                this.idAdd();
                canvas.createText('400-856-9811',{
                  fontSize: 16,
                  left:360,
                  top:240,
                  width:200,
                })

                this.idAdd();
                canvas.createText('Email:',{
                  fontSize: 16,
                  left:300,
                  top:260,
                  width:60,
                })
                this.idAdd();
                canvas.createText('info@zkong.com',{
                  fontSize: 16,
                  left:360,
                  top:260,
                  width:200,
                })

                this.idAdd();
                canvas.createCircle({
                  width:100,
                  height:100,
                  fill:'#ffffff',
                  stroke: '#ff0000',
                  strokeWidth: 3,
                  strokeDashArray: [5,3],
                });

                this.idAdd();
                canvas.createCircle2({
                  left:100,
                  radius:50,
                  fill:'#ffffff',
                  stroke: '#ff0000',
                  strokeWidth: 3,
                  strokeDashArray: [5,3],
                });



                this.idAdd();
                this.$refs.canvas.createParallelogram({
                  id: this.id,
                  width:50,
                  left: 0,
                  top: 130,
                  fill: '#ff0000',
                });

                this.idAdd();
                this.$refs.canvas.createRectangle({
                  id: this.id,
                  width:50,
                  left: 0,
                  top: 300,
                  fill: '#ff0000',
                });

                this.idAdd();
                this.$refs.canvas.createImage('./static/images/img.svg', {
                  id: this.id,
                  left:400,
                  top:200,
                  width:100,
                  height:100,
                });


                this.idAdd();
                this.$refs.canvas.drawDottedline({
                  id: this.id,
                  left:360,
                  top:80,
                  width:100,
                  drawWidth:2,
                });


                this.idAdd();
                this.$refs.canvas.createEllipse({
                  id: this.id,
                  left:360,
                  top:80,
                  width:100,
                  drawWidth:2,
                });

                this.idAdd();
                this.$refs.canvas.createEqualTriangle({
                  id: this.id,
                  left:360,
                  top:80,
                  width:100,
                  drawWidth:2,
                });


                this.idAdd();

                this.$refs.canvas.createQrcode('http://www.zkong.com', {
                  id: this.id,
                  left:700,
                  top:0,
                  width:100,
                  height:100,
                });


                this.idAdd();

                this.$refs.canvas.createBarcode('690000001', {
                  id: this.id,
                  left:500,
                  top:400,
                  width:100,
                  height:100,
                });*/

                /* this.idAdd();
                 this.$refs.canvas.createElement('Rect',{
                   id: this.id,
                   width:500,
                   height:300,
                   fill:'#F2F2F2',
                 })*/

                /* this.idAdd();
                 this.$refs.canvas.createElement('Image',{
                   id: this.id,
                   src:'./static/images/img.svg',
                   width:50,
                   height:50,
                   top:100,
                   left:20,
                   scaleX:1,
                   scaleY:1,
                 })

                 this.idAdd();
                 this.$refs.canvas.createImage('./static/images/img.svg',{
                   id: this.id,
                   width:50,
                   height:50,
                   top:200,
                   left:600,
                 })*/


                /* this.idAdd();
                 let qrcode =  this.$refs.canvas.createElement('Qrcode',{
                   id: this.id,
                   imgText:'水陆草木之花，可爱者甚蕃。晋陶渊明独爱菊。自李唐来，世人甚爱牡丹。予独爱莲之出淤泥而不染，濯清涟而不妖，中通外直，不蔓不枝，香远益清，亭亭净植，可远观而不可亵玩焉。\n' +
                           '予谓菊，花之隐逸者也；牡丹，花之富贵者也；莲，花之君子者也。噫！菊之爱，陶后鲜有闻。莲之爱，同予者何人？牡丹之爱，宜乎众矣！',
                   width:80,
                   height:80,
                   top:100,
                   left:600,
                 })*/

                /*  this.idAdd();
                  this.$refs.canvas.createBarcode('690000001', {
                    id: this.id,
                    left:500,
                    top:400,
                    width:100,
                    height:100,
                  });
          */
                /* this.idAdd();
                 this.$refs.canvas.createElement('Barcode',{
                   id: this.id,
                   imgText:'A1B2',
                   width:90,
                   height:50,
                   top:200,
                   left:300,
                   originXY:['center','top'],
                 })*/






                /*     this.idAdd();
                     this.$refs.canvas.createElement('Text',{
                       id: this.id,
                       text:'123456789',
                       width:100,
                       height:50,
                       top:200,
                       left:200,
                     })*/



                // this.$refs.canvas.setNomove();

                // canvas.rename(1, '我是边框矩形');
                // this.$refs.canvas.setTop();






            },
        },
    }
</script>

<style scoped>
    .demobox {
        width: 100vw;
        height:100vh;
        padding-top: 50px;
        box-sizing: border-box;
        margin:0 auto;
        background: #f5f5f5;
        display: flex;
        flex-direction: row;
        /*justify-content: center;*/
        justify-content: space-between;

    }
    .btn{
        width:60px;line-height: 30px; cursor: pointer; margin-bottom: 10px;
    }



</style>
