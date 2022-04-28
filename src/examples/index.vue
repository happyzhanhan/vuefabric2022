<template>
<div class="copy-ps">
    <div class="ps-head"  id="capture">
        <div class="psh-logo">
            zk
        </div>
        <div class="psh-button">
            <b>文件(F)</b>
        </div>
        <div  class="psh-button">
            <b>编辑(E)</b>
        </div>
        <div class="psh-button">
            <b>图像(I)</b>
        </div>
        <div class="psh-button">
            <b class="hover">图层(L)</b>
        </div>
        <div class="psh-button">
            <b>类型(Y)</b>
        </div>
        <div class="psh-button">
            <b>选择(S)</b>
        </div>
        <div class="psh-button">
            <b>滤镜(T)</b>
        </div>
        <div class="psh-button">
            <b>视图(V)</b>
        </div>
        <div class="psh-button">
            <b>窗口(W)</b>
        </div>
        <div class="psh-button">
            <b>帮助(H)</b>
        </div>
        <div class="psh-button" @click="handleSave">
            <b>截屏(C)</b>
        </div>
        <div class="psh-button" @click="barcodeshow">
            <b>生成条码(s)</b>
        </div>
    </div>

    <div class="ps-head">
        <!--图层多选-->
        <div class="duoxuan" v-if="currentMenu==='suofang'">
            <div class="psh-cur">
                <i style="margin-top:4px; margin-left:5px;margin-right:5px;"><img src="../../static/images/photoshop_06.jpg" alt=""></i>

                <i class="currentMenuIcon" :class="currentMenu"></i>
            </div>
            <div class="ps-block">
                <div class="ps-fangda" :class="suofangdirection?'hover':''"  @click="suofangdirection=true;$refs.canvas.setCursor(4);">
                </div>
                <div class="ps-suoxiao" :class="!suofangdirection?'hover':''"   @click="suofangdirection=false;$refs.canvas.setCursor(5);">
                </div>
            </div>

            <div class="ps-fenge"></div>

            <div class="ps-block">
                <div class="ps-button-new" @click="changeOneZoom">
                    100%
                </div>
                <div class="ps-button-new" @click = "changeBigZoom" >
                    适应屏幕
                </div>
                <div class="ps-button-new" @click = "changeOrigin" >
                    按当前缩放比例居中
                </div>
                <div class="ps-button-new" @click="changedirection">
                    切换横纵
                </div>
            </div>
        </div>

        <div class="duoxuan" v-if="currentMenu==='tuozhuai'">
            <div class="psh-cur">
                <i style="margin-top:4px; margin-left:5px;margin-right:5px;"><img src="../../static/images/photoshop_06.jpg" alt=""></i>

                <i class="currentMenuIcon zhuashou" ></i>
            </div>
            <div class="ps-block">

            </div>

           <!-- <div class="ps-fenge"></div>-->

            <div class="ps-block">
                <div class="ps-button-new" @click = "changeOrigin" >
                    按当前缩放比例居中
                </div>
                <div class="ps-button-new" @click = "changeLefttop" >
                    ↖
                </div>

                <div class="ps-button-new" @click = "changeTopcenter" >
                    ↑
                </div>
                <div class="ps-button-new" @click = "changeRighttop" >
                    ↗
                </div>
                <div class="ps-button-new" @click = "changeLeft" >
                    ←
                </div>
                <div class="ps-button-new" @click = "changeRight" >
                    →
                </div>
                <div class="ps-button-new" @click = "changeLeftbottom" >
                    ↙
                </div>
                <div class="ps-button-new" @click = "changeBottomcenter" >
                    ↓
                </div>
                <div class="ps-button-new" @click = "changeRightbottom" >
                    ↘
                </div>


            </div>

        </div>

        <div class="duoxuan" v-if="currentMenu==='xuanze'">
            <div class="psh-cur">
                <i style="margin-top:4px; margin-left:5px;margin-right:5px;"><img src="../../static/images/photoshop_06.jpg" alt=""></i>

                <i class="currentMenuIcon" ></i>
            </div>
            <div class="ps-block">

            </div>

            <!-- <div class="ps-fenge"></div>-->

            <div class="ps-block">
                <div class="ps-button-new" @click="toTopAlign">
                    <img src="../../static/images/ps-button-01.jpg" alt="">
                </div>
                <div class="ps-button-new"  @click="toVerticalCenterAlign">
                    <img src="../../static/images/ps-button-02.jpg" alt="">
                </div>
                <div class="ps-button-new"  @click="toBottomAlign">
                    <img src="../../static/images/ps-button-03.jpg" alt="">
                </div>
                <div class="ps-button-new" @click="toLeftAlign" >
                    <img src="../../static/images/ps-button-04.jpg" alt="">
                </div>
                <div class="ps-button-new"  @click="toHorizontalCenterAlign">
                    <img src="../../static/images/ps-button-05.jpg" alt="">
                </div>
                <div class="ps-button-new"  @click="toRightAlign">
                    <img src="../../static/images/ps-button-06.jpg" alt="">
                </div>

                <div class="ps-button-new"  @click="toHorizontalCenterDistribution">
                    水平居中分布
                </div>

                <div class="ps-button-new"  @click="toVerticalCenterDistribution">
                    垂直居中分布
                </div>

                <div  class="ps-button-new"  @click="copypaste">
                    复制粘贴
                </div>

                <div class="ps-button-new" @click = "changeShow" >
                    显示
                </div>
                <div class="ps-button-new" @click = "changeHide" >
                    隐藏
                </div>

                <div class="ps-button-new" @click = "changeisElasticSize" >
                    改变自适应
                </div>

            </div>

        </div>

    </div>


    <div class="ps-body" >
        <!--组件选择-->
        <div class="ps-left">
            <i><img src="../../static/images/photoshop_47.jpg" alt=""></i>

            <!--@contextmenu.prevent="openMenu1($event)"-->
            <i class="ps-icon1 ps-icon " :class="hover1index=='1'? (currentMenu==='xuanze'?'ps-icon92 hover':'ps-icon92'):(currentMenu==='xuanze'?'hover':'')"
               @click="changeSelect">
                <ul :class="hover1?'hover':''" >
                    <li :class="hover1index===0?'hover':''" @click="selectLi1(0)"> <i class="icon9i"></i> <b>画布仅单选</b></li>
                    <li :class="hover1index===1?'hover':''" @click="selectLi1(1)"> <i class="icon9i2"></i> <b>画布可多选</b></li>
                </ul>
            </i>

           <!-- <i class="ps-icon2 ps-icon"></i>-->

           <!-- <i class="ps-icon3 ps-icon"></i>
            <i class="ps-icon4 ps-icon"></i>-->

            <i class="line-h"></i>

            <i class="ps-icon5 ps-icon"></i>
            <i class="ps-icon6 ps-icon"></i>

            <i class="line-h"></i>

            <i class="ps-icon7 ps-icon"
               @dblclick="draw('TextRect')"
            ></i>

            <i class="ps-icon7 ps-icon"
               @dblclick="draw('TextRectBox')"
            ></i>

            <i class="ps-icon8 ps-icon"
               @dblclick="draw('Rectangle')"
            ></i>


            <i class="ps-icon82 ps-icon"
               @dblclick="draw('Html')"
            ></i>

            <i class="ps-icon82 ps-icon"
               @dblclick="draw('Rect')"
            ></i>

            <i class="ps-icon83 ps-icon"
               @dblclick="draw('Circle')"
            ></i>

            <!--二维码-->
            <i class="ps-icon83 ps-icon"
               @dblclick="draw('Qrcode')"
            ></i>

            <!--条码-->
            <i class="ps-icon83 ps-icon"
               @dblclick="draw('Barcode')"
            ></i>

            <i class="ps-icon84 ps-icon"
               @dblclick="draw('Dottedline')"
            ></i>

            <i class="line-h"></i>
            <!-- @contextmenu.prevent="openMenu($event)"-->
            <i class="ps-icon9 ps-icon"  :class="hover9index=='1'? (currentMenu==='tuozhuai'?'ps-icon92 hover':'ps-icon92'):(currentMenu==='tuozhuai'?'hover':'')"

               @click="changeTuozhuai"
                @dblclick = changeBigZoom>
                <ul :class=" currentMenu==='tuozhuai' &&open9 ?'hover':''">
                    <li :class="hover9index===0?'hover':''" @click="selectLi(0)"> <i class="icon9i"></i> <b>画布可移动</b></li>
                    <li :class="hover9index===1?'hover':''" @click="selectLi(1)"> <i class="icon9i2"></i> <b>画布不可移动</b></li>
                </ul>
            </i>

            <i class="ps-icon10 ps-icon" @dblclick="changeOneZoom"
               @click="changeSuofang"
               :class="currentMenu==='suofang'?'hover':''"></i>
           <!-- <i class="ps-icon11 "></i>
            <i class="ps-icon12 "></i>-->

        </div>

        <div class="ps-mid">

            <!--<div style="position: fixed; top:0;left:900px;color:red;">
                translateX:{{translateX}},
                xLeft:{{xLeft}},
                zoom:{{zoom}}
            </div>-->

            <!--左上角-->
            <div class="zuoshang" v-if="zoom===1">

            </div>
            <!--X轴-->
            <div class="xZhou" id="xZhou" :style="'width:'+(boxWidth-18)+'px;'" v-if="zoom===1">
                <div class="x-line"
                     :style="'width: '+(boxWidth-18-translateX)+'px;transform-origin:0 0; transform:scaleX('+zoom+') translateX('+ translateX +'px) ; '">  <!---->
                    <span class="number" v-for="(item,index) in xScale"
                          :key="index"
                          :style="{left:index * 50 + 2 + 'px',transform:'scaleX('+1/zoom+')'}"
                          >{{item.id}}</span>
                </div>
            </div>

            <!--Y轴-->
            <div class="yZhou" id="yZhou" :style="'height: '+ (boxHeight-18) +'px; '" v-if="zoom===1">
                <div class="y-line"  :style="'height: '+(boxHeight-18-translateY)+'px;　transform:translateY('+ translateY +'px) scaleY('+zoom+') ;'">
                    <span  class="number" v-for="(item,index) in yScale"
                           :key="index"
                           :style="{top:index * 50 + 2 + 'px',transform:'scaleY('+1/zoom+') '}"
                    >{{item.id}}</span>
                </div>
            </div>


            <Fabric-Canvas v-if="showcanvas"
                           ref="canvas" :idno="id" :width="width" :height="height" :boxWidth="boxWidth" :boxHeight="boxHeight"
                           :showRuler="showRuler" :stepLengthp="stepLength"
                           @idAdd="idAdd" @preview ="preview" @setlefttop="setlefttop"
                           @object:selected = "objectselected"
                           @selection:updated="selectionupdated"
                           @object:scaled = "objectscaled"
                           @object:moved = "objectmoved"
                           @object:rotating = "objectrotating"
                           @mouse:move="mousemove"

                           @canvasToData = "canvasToData"

                           @changeZoomTo="changeZoomTo"
                           @copydata="copydata"
                           @deleteidsdata="deleteidsdata"

                           @setW="setW"
                           @setH="setH"
                           id="can"></Fabric-Canvas>

        </div>

        <!--细节菜单-->
        <div class="ps-right">
            <i class="right-top"><img src="../../static/images/photoshop_47.jpg" alt=""></i>

            <div class="one-but" :class="showhistory?'hover':''">
                <span  @click="showhistory = !showhistory">
                    <i><img src="../../static/newps/images/icon-lishi.png" alt=""></i><b>历史</b>
                </span>


                <div class="ps-layerbox" v-if="showhistory">
                    <p class="ps-layer-title"><span><b>历史</b></span>  </p>

                    <div  class="ps-history-data">
                        <p v-for="history in historylist" :class="currentHistory === history.id?'hover':(currentHistory < history.id?'disabled':'')"
                            @click="changeHistory(history)">
                            <i class="ficon-add" :class="history.type!=='add'?history.type:''"></i>
                            <b>{{history.name}}</b>
                        </p>

                    </div>
                    <div  class="ps-layer-botButton">

                    </div>
                </div>

            </div>
            <div class="one-but" :class="showlayer?'hover':''" >
                <span @click="showlayer = !showlayer">
                    <i><img src="../../static/newps/images/icon-tuceng.png" alt="" ></i><b>图层</b>
                </span>

                <div class="ps-layerbox" v-if="showlayer">
                    <p class="ps-layer-title"><span><b>图层</b></span>  </p>
                    <div  class="ps-layer-search">
                        <div>
                            <select name="" id="">
                                <i class="ps-icon-fangdajing">
                                    <img src="../../static/newps/images/icon-fangdajing.png" alt="">
                                </i>
                                <option value="类型" >类型</option>
                                <option value="名称">名称</option>
                            </select>

                        </div>
                        <div>
                            <input type="text">
                        </div>
                    </div>
                    <div  class="ps-layer-button">
                        锁定：
                        <i class="psicon-suo" :class="currentSuo===1?'hover':''" @click="suoAllLine(currentSuo)" ></i>
                        <i class="psicon-shan"></i>
                    </div>
                    <div  class="ps-layer-data">
                        <p v-for="layer in layerlist" >
                            <span class="icon-show" @click="layer.isShow===1?layer.isShow=0:layer.isShow=1">
                                <i v-if="layer.isShow===0">
                                    <img src="../../static/newps/images/icon-pseye.png" alt="" >
                                </i>
                                <i v-if="layer.isShow===1">
                                    <img src="../../static/newps/images/icon-pseye-2.png" alt="">
                                </i>
                            </span>
                            <span class="layer-list" :class="currentLayer.indexOf(layer.id)>-1?'hover':''"
                                    @click="chooseOneLine(layer)">
                                <span>
                                     <i></i>
                                    <b>
                                        {{layer.name}}
                                    </b>
                                </span>

                                <div class="right" v-if="layer.isSuo===1" >

                                </div>
                            </span>
                        </p>

                    </div>
                    <div  class="ps-layer-botButton">

                    </div>
                </div>
            </div>
        </div>
    </div>

    <div id="datamax"></div>
</div>
</template>

<script>
    import html2canvas from 'html2canvas'
    export default {
        name: "index",
        data(){
            return{
                showcanvas:true,
                id: 1,
                width: 600,      //标尺、画布的宽
                height: 500,     //标尺、画布的高
                boxWidth: document.documentElement.clientWidth-121,  //外框宽
                boxHeight: document.documentElement.clientHeight-60,   //外框高
                stepLength: 50,  //标尺单位 每格
                translateX:-18,
                translateY:-18,
                xLeft:-18,
                yTop:-18,

                showRuler: [true, true],  //横纵标尺是否显示
                showR:true,

                open9:false,
                hover9index:0,

                hover1:false,
                hover1index:1,


                layerlist:[
                    {
                        id:0,
                        type:0,
                        name:'我是图层',
                        isShow:1,
                        isSuo:1,

                    },
                    {
                        id:1,
                        type:0,
                        name:'我是图层',
                        isShow:0,
                        isSuo:1,

                    },
                    {
                        id:2,
                        type:0,
                        name:'我是图层',
                        isShow:1,
                        isSuo:1,

                    },
                    {
                        id:3,
                        type:0,
                        name:'我是图层',
                        isShow:1,
                        isSuo:0,

                    },
                    {
                        id:4,
                        type:0,
                        name:'我是图层',
                        isShow:1,
                        isSuo:0,

                    },

                ],
                currentLayer:[0,1],
                currentSuo:0,
                showlayer:false,

                historylist:[
                    {
                        id:0,
                        name:"新建",
                        type:'add',
                        data:[],
                    },
                    {
                        id:1,
                        type:'add',
                        name:"新建矩形",
                        data:[],
                    },
                    {
                        id:2,
                        type:'bianse',
                        name:"改变属性",
                        data:[],
                    },
                    {
                        id:3,
                        type:'shanchu',
                        name:"删除元素",
                        data:[],
                    },
                    {
                        id:4,
                        type:'yidong',
                        name:"移动",
                        data:[],
                    },
                    {
                        id:5,
                        type:'fuzhi',
                        name:"复制",
                        data:[],
                    },],
                sumHistory:3,
                currentHistory:1,
                showhistory:false,

                currentMenu:'suofang',
                suofangdirection:true,

                xScale:[],
                yScale:[],
                zoom:1,
            }
        },
        components:{html2canvas},
        async mounted(){
            window.onresize = (() => {
                this.boxWidth = document.documentElement.clientWidth-121;  //外框宽
                this.boxHeight = document.documentElement.clientHeight-60;   //外框高
                this.$refs.canvas.changebg(document.documentElement.clientWidth-121,document.documentElement.clientHeight-60);
                /*this.showcanvas = false;

                setTimeout(()=>{
                    this.showcanvas = true;
                })*/
            });



            window.onload = function() {
                var el = document.getElementById("app"); //右键禁用
                el.oncontextmenu = function (e) {
                    //左键--button属性=1，右键button属性=2
                    if (e.button == 2) {
                        e.preventDefault();

                    }
                }
            }


            /*this.draw('TextRect');

            setTimeout(()=>{
                this.draw('Barcode');
            },10);*/



          //  this.draw('TextRectBox');
            this.draw('Rect');

           // this.draw('Qrcode');
            //this.draw('Html');

            let bardata = await this.$refs.canvas.createElement('Barcodematrix',
                {imgText:'989874',
                 barlineWidth:50,
                 width:50,
                 height:50,
                 color:"#ff0000",
                 left:0,
                 top:0,
                id:9} );
            console.warn('bardata',bardata)

            this.$refs.canvas.SetNewZoom(1,0,0);

            this.scaleCalc(); //计算刻度
            this.$refs.canvas.changemoveing(false);
        },
        methods:{
            barcodeshow(){
                // var value = '12345670';
                // var btype = 'datamatrix';
                // var settings = {
                //     addQuietZone: false,
                //     barHeight: "50",
                //     barWidth: "1",
                //     bgColor: "#FFFFFF",
                //     color: "#000000",
                //     fontSize: 10,
                //     marginHRI: 5,
                //     moduleSize: "5",
                //     output: "css",
                //     posX: "10",
                //     posY: "20",
                //     showHRI: true
                // }
                // console.log(document.querySelector("#showqrcode"), $('#showqrcode'))
                // this.barcode(document.querySelector("#showqrcode"),  value, "datamatrix",{barWidth:2, barHeight:30,showHRI:false});
                var svgNode =  DATAMatrix({
                    msg :  "3962123456"
                    ,dim :   300
                    ,rct :   0
                    ,pad :   1
                    ,pal : ["#ff0000", "#f2f4f8"]
                    ,vrb :   0

                });
                console.log(svgNode)
                document.querySelector("#datamax").appendChild(svgNode)
            },
            handleSave() {
                html2canvas(document.querySelector("#capture")).then(canvas => {
                    // document.body.appendChild(canvas)
                    this.changeCanvasToImg(canvas)
                });
            },
            changeCanvasToImg(canvas){
                var myBlob = this.dataURLtoBlob(canvas.toDataURL('img/png', 0.92))
                var myUrl = URL.createObjectURL(myBlob)
                this.downImg(myUrl)
            },
            dataURLtoBlob(dataurl) {
                var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
            },
            downImg(url) {
                // 创建a标签 并设置其相关属性，最后触发其点击事件
                let a = document.createElement("a")
                let clickEvent = document.createEvent("MouseEvents");
                a.setAttribute("href", url)
                a.setAttribute("download", "filename")
                a.setAttribute("target", '_blank')
                clickEvent.initEvent('click', true, true)
                a.dispatchEvent(clickEvent);
            },
            idAdd(){

            },
            preview(){

            },
            setlefttop(){

            },
            objectselected(){

            },
            selectionupdated(){

            },
            objectscaled(){

            },
            objectmoved(){

            },
            objectrotating(){

            },
            canvasToData(){

            },
            changeZoomTo(n){
                this.zoom = n;
               // this.$refs.canvas.getBlack();//黑色遮罩
            },
            copydata(){

            },
            deleteidsdata(){

            },

            //横纵切换
            changedirection(){
                let w = JSON.parse(JSON.stringify(this.width));
                let h = JSON.parse(JSON.stringify(this.height));
                this.width = h;
                this.height = w;
                this.$refs.canvas.resetInitbg({left:this.xLeft,top:this.yTop,width:h,height:w});
                this.scaleCalc(); //计算刻度
                this.mousemove(); // 移动

            },
            //回调设置宽
            setW(w){
                this.width = parseInt(w);
            },
            //回调设置高
            setH(h){
                this.height = parseInt(h);
            },
            //鼠标移动计算标尺
            mousemove(){
                let objects = this.$refs.canvas.getObjects();
                objects.forEach((one)=>{
                    if(one.type==='sBg'){
                        //console.log(one.oCoords.tl)
                        this.setRulerlefttop(one.oCoords.tl)
                    }
                });
            },

            //点击画组件
            async draw(name){
                this.id = this.id+1;
                let canvaobj,options;
                switch(name){
                    case 'TextRect':
                        options = {
                            /*angle:45,*/
                            left:22,
                            top:10,
                            hasRotatingPoint:true,
                            width:400,
                            height:100,
                            fontColor:'#f00',
                            rectColor:'',
                            /*stroke:'#f00',*/
                            strokeWidth: 0,
                            xLeft:0,
                            yTop:0,
                            xRight:0,
                            yBot:0,
                            fontFamily:'微软雅黑',
                            textAlign:'right',
                            maxLines:3,
                            omitStyleText:'...',
                            omitStyle:1,
                            newline:'',
                            minFontSize:12,
                            isElasticSize:2,
                            visible:true,
                            fontSize:20,
                            textdemo:'123',
                            originXY:['right','bottom'],

                           // fontWeight:'bold',
                          //  linethrough:true,
                          //  underline:true,
                          //  fontStyle:"italic"

                        }
                        break;

                    case 'TextRectBox':
                        options = {
                            left: 60,
                            top: 29,
                            angle: 0, //外部
                            barcodeType: 10,

                           /* borderColor: "#f00",
                            borderType: 3,
                            lineWeight: 5,*/

                            color: "#000000",
                            conRealResult: 1,
                            content: "思源黑体%在线显示文字多多展示会怎么样的显示清空呢",
                            dateFormat: "YYYY.MM.dd HH:mm:ss",
                            decimalSeparator: ".",
                            fieldCode: "",
                            fillColor: "",
                            fontSize: 14,
                            fontType: "微软雅黑",
                            height: 100,

                            horizontalAlign: 0,
                            verticalAlign: 0,

                            icon: null,
                            ifBold: 0,
                            ifCondition: 0,
                            ifItalic: 0,
                            ifStrikeThrough: 0,
                            ifUnderline: 0,

                            itemOrder: 1,
                            itemPictureNameId: null,
                            layer: 0,

                            textAdvanceProperty: 0, //是否自适应
                            verticalSpace: 0,
                            lineBreak: '%',
                            maxLines: 2,
                            minFontSize: 12,
                            omitStyle: 1,

                            postfix: "/500g",
                            prefix: "$",

                            scaleX: 0,
                            scaleY: 0,
                            screenIndex: 0,
                            templateBaseId: 790,
                            thousandSeparator: ",",
                            type: 1,

                            width: 500,

                            visible:true,
                        }
                        break;
                    case 'Rect':
                        options = {
                            left:200,
                            top:50,
                            width:200,
                            height:100,
                            color:'#f00',
                            visible:true,
                        };
                        break;
                    case  'Dottedline':
                        options = {
                            left:20,
                            top:40,
                            width:200,
                            height:3,
                            hasRotatingPoint:false,
                            strokeWidth:3,
                            DottedlineType:1,
                            stroke:'#ff0000',
                            visible:true,
                        };
                        break;
                    case  'Barcode':
                        options = {
                            left:60,
                            top:40,
                            width:200,
                            height:30,
                            hasRotatingPoint:false,
                            imgText: '69012345679',
                            color:'#f00',
                            visible:true,

                        };
                        break;
                    case  'Qrcode':
                        options = {
                            left:100,
                            top:40,
                            width:50,
                            height:50,
                            hasRotatingPoint:false,
                            imgText: '69012345679',
                            color:'#f00',
                            lineColor:'#ff0000',
                            visible:true,
                        };
                        break;
                    case  'Html':
                        options = {
                            left:200,
                            top:40,
                            width:186,
                            height:50,
                            fontSize:16,
                            content:"",
                            visible:true,
                        };
                        break;
                    default:
                        options = {
                            left:0,
                            top:0,
                            visible:true,
                        };

                }
               // console.log(options);
                options.id =  JSON.parse(JSON.stringify(this.id));
                canvaobj = await this.$refs.canvas.createElement(name,options);
                console.log('canvaobj:',canvaobj);
            },


            //选择 右键
            openMenu1(e){
                this.hover1 = !this.hover1;
                this.currentMenu = 'xuanze';
            },
            //选择 右键 选择
            selectLi1(index){
                this.hover1index = parseInt(index);
                this.$refs.canvas.changeSelection(parseInt(index)===1?true:false);
                this.openMenu1();
            },

            //拖拽 右键
            openMenu(e){
                //console.log(e);
                this.currentMenu = 'tuozhuai';
                this.open9 = !this.open9;
            },
            //拖拽 右键 选择
            selectLi(index){
                this.hover9index = parseInt(index);
                this.$refs.canvas.changemoveing(parseInt(index)===0?true:false);
                if(index===0){
                    this.$refs.canvas.setCursor(2);
                }else{
                    this.$refs.canvas.setCursor();
                }
                this.openMenu();
            },



            //选择图层
            chooseOneLine(layer){
                //console.log(layer);
                if(this.currentLayer.indexOf(layer.id)>-1){
                    let i = this.currentLayer.indexOf(layer.id);
                    this.currentLayer.splice(i,1);
                }else{
                    this.currentLayer.push(layer.id);
                }
                setTimeout(()=>{
                    this.currentSuo = this.returnFirstSuo();
                },10)

            },
            //判断多个是锁定还是待锁定
            returnFirstSuo(){
                let returndata = 0;
                this.layerlist.forEach((one)=>{
                    if(this.currentLayer[0]===one.id){
                        returndata = one.isSuo;
                    }
                });
                return returndata;
            },
            //批量锁定
            suoAllLine(Bol){
                if(this.currentLayer.length>0){
                    this.layerlist.forEach((one,i)=>{
                        this.currentLayer.forEach((cur)=>{
                            if(one.id===cur){
                                this.$set(this.layerlist[i],'isSuo',Bol===1?0:1);
                            }
                        })
                    });
                    this.currentSuo ===1 ? this.currentSuo=0:this.currentSuo=1;
                }
            },
            //改变历史
            changeHistory(history){
                this.currentHistory = history.id;

            },


            //双击拖拽 100%恢复
            changeOneZoom(){
                this.$refs.canvas.changeOneZoom(40,60);

                this.changeSuofang(); // 单击 拖拽

            },
            //双击缩放 自适应
            changeBigZoom(){
                this.$refs.canvas.changeBigZoom(40,0);

                this.changeTuozhuai(); //单击 缩放
            },
            //按缩放比例居中
            changeOrigin(){
                this.$refs.canvas.changeOrigin(40,0);
            },
            //按缩放比例左上角对齐
            changeLefttop(){
                this.$refs.canvas.changeLefttop(40,0);
            },
            //上中
            changeTopcenter(){
                this.$refs.canvas.changeTopcenter(40,0);
            },
            //上右
            changeRighttop(){
                this.$refs.canvas.changeRighttop(40,0);
            },
            //左
            changeLeft(){
                this.$refs.canvas.changeLeft(40,0);
            },
            //右
            changeRight(){
                this.$refs.canvas.changeRight(40,0);
            },
            changeLeftbottom(){
                this.$refs.canvas.changeRight(40,0);
            },
            changeRightbottom(){
                this.$refs.canvas.changeRightbottom(40,0);
            },
            changeBottomcenter(){
                this.$refs.canvas.changeBottomcenter(40,0);
            },

            //显示
            changeShow(){
                let obj = this.$refs.canvas.getActiveObject();
                this.$refs.canvas.setShow(obj.id);
            },
            //隐藏
            changeHide(){
                let obj = this.$refs.canvas.getActiveObject();
                this.$refs.canvas.setHidden(obj.id);
            },

            //改变自适应
            async changeisElasticSize(){
                console.log('changeisElasticSize');
                let obj = this.$refs.canvas.getActiveObject();
                console.log(obj.toJSON());

                let newobj = await this.$refs.canvas.changeTextRender({...obj.toJSON(),
                    fontFamily:'宋体',
                    fontType:'宋体',
                    fontColor:'#0f0',
                    isElasticSize: 2,
                    maxLines:2,
                    omitStyleText:'┛',
                    left:100,
                    top:100,
                },'我是新文字我是新文字我是新文字我',obj);
                console.log(newobj);
            },



            //点击切换选择
            changeSelect(){
                this.currentMenu = 'xuanze';
                this.$refs.canvas.setCursor(0);
                this.$refs.canvas.changemoveing(false);
            },
            //单击 切换抓手
            changeTuozhuai(){
                this.currentMenu='tuozhuai';
                this.$refs.canvas.setCursor(2);
                this.$refs.canvas.changemoveing(true);
            },

            //单击 切换缩放
            changeSuofang(){
                this.currentMenu='suofang';
                this.$refs.canvas.setCursor(4);
                this.$refs.canvas.changemoveing(false);
                this.suofangdirection = true; //选择放大
            },

            // 计算刻度
            scaleCalc () {
                let w = this.boxWidth;
                let h = this.boxHeight;
                this.xScale = this.getCalc(this.xScale, w,'x');
               // console.log('this.xScale',this.xScale,w)
                this.yScale = this.getCalc(this.yScale, h,'y');
            },
            // 获取刻度方法
            getCalc (array,length, direction) {
                array = [];
                if(direction ==='x'){
                    for (let i = this.xLeft; i < (this.xLeft+length)*this.zoom * this.stepLength / 50; i += this.stepLength) {
                        /*if (i % this.stepLength=== 0) {
                          array.push({ id: i })
                        }*/
                        this.translateX = (-i % this.stepLength-18);  //

                        if(i % this.stepLength<0){
                            array.push({ id: i - i % this.stepLength - this.stepLength })
                        }else{
                            array.push({ id: i - i % this.stepLength })
                        }

                    }
                }else if(direction ==='y'){
                    for (let i = this.yTop; i < (this.yTop+length)*this.zoom * this.stepLength / 50; i += this.stepLength) {
                        /*if (i % this.stepLength === 0) {
                          array.push({ id: i })
                        }*/
                        this.translateY = -i % this.stepLength-18;
                        if(i % this.stepLength<0){
                            array.push({ id: i - i % this.stepLength - this.stepLength })
                        }else{
                            array.push({ id: i - i % this.stepLength })
                        }
                    }
                }else{
                    // console.log('未计算');
                    for (let i = 0; i < length * this.stepLength / 50; i += this.stepLength) {
                        if (i % this.stepLength === 0) {
                            array.push({ id: i })
                        }
                    }
                }

                //console.log('new',direction,JSON.stringify(array));
                return array;

            },

            //画布移动改变标尺
            setRulerlefttop(pointer){
                this.xLeft = -pointer.x;
                this.yTop = -pointer.y;

                this.scaleCalc();
            },


            //组件上对齐
            toTopAlign(){
                this.$refs.canvas.toTopAlign();
            },
            //组件垂直中对齐
            toVerticalCenterAlign(){
                this.$refs.canvas.toVerticalCenterAlign();
            },
            //组件下对齐
            toBottomAlign(){
                this.$refs.canvas.toBottomAlign();
            },
            //组件左对齐
            toLeftAlign(){
                this.$refs.canvas.toLeftAlign();
            },
            //组件水平中对齐
            toHorizontalCenterAlign(){
                this.$refs.canvas.toHorizontalCenterAlign();
            },
            //组件右对齐
            toRightAlign(){
                this.$refs.canvas.toRightAlign();
            },

            //水平居中分布
            toHorizontalCenterDistribution(){
                this.$refs.canvas.toHorizontalCenterDistribution();
            },

            //水平居中分布
            toVerticalCenterDistribution(){
                this.$refs.canvas.toVerticalCenterDistribution();
            },

            //复制粘贴
            copypaste(){
                this.$refs.canvas.copypaste(); //复制方法
            },

        }
    }
</script>

<style scoped lang="scss">
    .copy-ps{
        width: 100%;
        height: 100vh;
        font-family: "微软雅黑";
        /*background: url("./../../static/images/photoshop.jpg") no-repeat;*/
    }
    .ps-head{
        width: 100%;
        height: 30px;
        background:url("./../../static/images/ps_title_bg.jpg") repeat-x;
        display: flex;
        flex-direction: row;

        color:#fff;

        b{
            font-weight: normal;
            font-size: 12px;
            padding: 2px 4px;
            border-radius: 4px;
            cursor: pointer;
            border:1px solid #535353;

            &:hover{
                border:1px solid #2c2c2c;
                background:url("./../../static/images/ps-button-bg.png") repeat-x;
               /* background: black;*/
            }
            &.hover{
                border:1px solid #2c2c2c;
                background: #393939;
            }
            &:active{
                border:1px solid #000;
                background: #000;
            }
        }
        i{
           /* padding: 5px 0;*/
        }
        .psh-logo{
            width: 40px;
            text-align: center;
            line-height: 30px;
        }
        .psh-button{
           margin:0 4px;
            padding: 2px 0;
        }
        .duoxuan{
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
        }
        .psh-cur{
            display: flex;
            flex-direction: row;
            align-items: center;
            padding-right:20px;
            position: relative;
            width: 36px;

            &:after{
                content:"";
                position: absolute;
                top:3px;
                right: 0;
                width: 1px;
                height: 20px;
                background: #000;
            }

            .currentMenuIcon{
                width: 24px;
                height: 24px;
                display: inline-block;
                background: url('../../static/newps/images/head-yidong.png') no-repeat;
                background-size: 100% 100%;

                &.suofang{
                    background: url('../../static/newps/images/head-suofang.png') no-repeat;
                }

                &.zhuashou{
                    background: url('../../static/newps/images/head-zhuashou.png') no-repeat;
                }


                &.text{
                    background: url('../../static/newps/images/head-text.png') no-repeat;
                }
            }
        }

        .ps-block{
            padding: 0 5px;
            display: flex;
            flex-direction: row;
            align-items: center;


        }

        .ps-button-new{
            font-size: 12px;
            color:#fff;
            padding: 1px 10px;
            margin:3px 5px;
            border-radius: 4px;
            background: linear-gradient(0deg, #606060 20%, #6c6c6c 50%, #707070 70%);
            border: 1px solid rgba(44,44,44,1);
            user-select: none;

            &:active,&.hover{
                background: #393939;
                border: 1px solid rgba(44,44,44,1);
            }
        }
        .ps-fangda{
            width: 22px;
            height: 22px;
            margin-right: 5px;
            background-size: 100% 100%;
            background: url('../../static/newps/images/head-fangda.png') no-repeat;
            &:active,&.hover{
                background: url('../../static/newps/images/head-fangda-2.png') no-repeat;
            }
        }
        .ps-suoxiao{
            width: 22px;
            height: 22px;
            background-size: 100% 100%;
            background: url('../../static/newps/images/head-suoxiao.png') no-repeat;
            &:active,&.hover{
                background: url('../../static/newps/images/head-suoxiao-2.png') no-repeat;
            }
        }

        .ps-fenge{
            width: 1px;
            height: 20px;
            background: #000;
            margin-top:4px;
        }
    }

    .ps-body{
        display: flex;
        flex-direction: row;

    }
    .ps-left{
        width: 40px;
        height: calc(100vh - 60px);
        background:url("./../../static/images/photoshop_109.jpg") repeat-y;

        i{
            margin: 1px 3px;
            border:1px solid #535353;
            border-radius: 3px;
            /*&.ps-icon{
                &:hover{
                    border:1px solid #000;
                    opacity: 0.8;
                }
                &.hover{
                    &:hover{
                        border:1px solid #535353;
                    }
                }
            }*/
        }
        i.ps-icon1{
            position: relative;

            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon1.png") no-repeat;

            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon1-2.png") no-repeat;

                &:hover{
                    background: url("./../../static/newps/images/ps-icon1-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon1-3.png") no-repeat;
            }

            ul{
                position: absolute;
                top:0;
                left:32px;
                z-index: 999;
                background: #535353;
                padding: 3px 5px;
                border:1px solid #3a3a3a;
                display: none;

                &.hover{
                    display: block;
                }

                >li{
                    width: 150px;
                    list-style: none;
                    display: flex;
                    flex-direction: row;
                    justify-items: center;
                    align-items: center;
                    line-height: 22px;

                    &:hover{
                        background: rgb(109,125,146);
                    }
                    &:before{
                        content:"";
                        width: 5px;
                        height: 5px;
                        background: #fff;
                        margin-right: 5px;
                        margin-left: 5px;
                        visibility: hidden;
                    }

                    &.hover{
                        &:before{
                            visibility: visible;
                        }
                    }

                    i.icon9i{
                        border:none;
                        width: 24px;
                        height: 22px;
                        display: inline-block;
                        background: url("./../../static/newps/images/ps-icon1.png") no-repeat;
                    }
                    i.icon9i2{
                        border:none;
                        width: 24px;
                        height: 22px;
                        display: inline-block;
                        background: url("./../../static/newps/images/ps-icon22.png") no-repeat;
                    }
                    b{
                        color:#fff;
                        font-size: 12px;
                        font-weight: normal;
                        font-style: normal;
                        margin-left: 5px;
                        user-select: none;
                    }
                }
            }
        }
        i.ps-icon2{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon22.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon22-2.png") no-repeat;

                &:hover{
                    background: url("./../../static/newps/images/ps-icon22-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon22-3.png") no-repeat;
            }
        }

        i.ps-icon3{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon3.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon3-2.png") no-repeat;

                &:hover{
                    background: url("./../../static/newps/images/ps-icon3-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon3-3.png") no-repeat;
            }
        }
        i.ps-icon4{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon4.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon4-2.png") no-repeat;

                &:hover{
                    background: url("./../../static/newps/images/ps-icon4-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon4-3.png") no-repeat;
            }
        }
        i.ps-icon5{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon5.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon5-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon5-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon5-3.png") no-repeat;
            }
        }
        i.ps-icon6{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon6.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon6-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon6-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon6-3.png") no-repeat;
            }
        }
        i.ps-icon7{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon7.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon7-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon7-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon7-3.png") no-repeat;
            }
        }
        i.ps-icon8{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon8.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon8-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon8-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon8-3.png") no-repeat;
            }
        }
        i.ps-icon82{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon82.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon82-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon82-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon82-3.png") no-repeat;
            }
        }
        i.ps-icon83{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon83.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon83-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon83-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon83-3.png") no-repeat;
            }
        }
        i.ps-icon84{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon84.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon84-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon84-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon84-3.png") no-repeat;
            }
        }
        i.ps-icon9{
            position: relative;

            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon9.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon9-2.png") no-repeat;


                &:hover{
                    background: url("./../../static/newps/images/ps-icon9-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon9-3.png") no-repeat;
            }

            ul{
                position: absolute;
                top:0;
                left:32px;
                z-index: 999;
                background: #606060;
                padding: 3px 5px;
                border:1px solid #3a3a3a;
                display: none;

                &.hover{
                    display: block;
                }

                >li{
                    width: 150px;
                    list-style: none;
                    display: flex;
                    flex-direction: row;
                    justify-items: center;
                    align-items: center;
                    line-height: 22px;

                    &:hover{
                        background: rgb(109,125,146);
                    }
                    &:before{
                        content:"";
                        width: 5px;
                        height: 5px;
                        background: #fff;
                        margin-right: 5px;
                        margin-left: 5px;
                       visibility: hidden;
                    }

                    &.hover{
                        &:before{
                            visibility: visible;
                        }
                    }

                    i.icon9i{
                        border:none;
                        width: 20px;
                        height: 20px;
                        display: inline-block;
                        background: url("./../../static/newps/images/icon9_i.png") no-repeat;
                    }
                    i.icon9i2{
                        border:none;
                        width: 20px;
                        height: 20px;
                        display: inline-block;
                        background: url("./../../static/newps/images/icon9_i2.png") no-repeat;
                    }
                    b{
                        color:#fff;
                        font-size: 12px;
                        font-weight: normal;
                        font-style: normal;
                        margin-left: 5px;
                        user-select: none;
                    }
                }
            }
        }
        i.ps-icon92{
            position: relative;

            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon92-1.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon92-2.png") no-repeat;


                &:hover{
                    background: url("./../../static/newps/images/ps-icon92-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon92-3.png") no-repeat;
            }

            ul{
                position: absolute;
                top:0;
                left:32px;
                z-index: 999;
                background: #606060;
                padding: 3px 5px;
                border:1px solid #3a3a3a;
                display: none;

                &.hover{
                    display: block;
                }

                >li{
                    width: 150px;
                    list-style: none;
                    display: flex;
                    flex-direction: row;
                    justify-items: center;
                    align-items: center;
                    line-height: 22px;

                    &:hover{
                        background: rgb(109,125,146);
                    }
                    &:before{
                        content:"";
                        width: 5px;
                        height: 5px;
                        background: #fff;
                        margin-right: 5px;
                        margin-left: 5px;
                        visibility: hidden;
                    }

                    &.hover{
                        &:before{
                            visibility: visible;
                        }
                    }

                    i.icon9i{
                        border:none;
                        width: 20px;
                        height: 20px;
                        display: inline-block;
                        background: url("./../../static/newps/images/icon9_i.png") no-repeat;
                    }
                    i.icon9i2{
                        border:none;
                        width: 20px;
                        height: 20px;
                        display: inline-block;
                        background: url("./../../static/newps/images/icon9_i2.png") no-repeat;
                    }
                    b{
                        color:#fff;
                        font-size: 12px;
                        font-weight: normal;
                        font-style: normal;
                        margin-left: 5px;
                        user-select: none;
                    }
                }
            }
        }
        i.ps-icon10{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon10.png") no-repeat;
            &.hover,&:active{
                background: url("./../../static/newps/images/ps-icon10-2.png") no-repeat;
                &:hover{
                    background: url("./../../static/newps/images/ps-icon10-2.png") no-repeat;
                }
            }
            &:hover{
                background: url("./../../static/newps/images/ps-icon10-3.png") no-repeat;
            }
        }
        i.ps-icon11{
            width: 30px;
            height: 51px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon11.png") no-repeat;
        }
        i.ps-icon12{
            width: 30px;
            height: 25px;
            display: inline-block;
            background: url("./../../static/newps/images/ps-icon12.png") no-repeat;
            &:hover,&:active{
                background: url("./../../static/newps/images/ps-icon12-3.png") no-repeat;
            }
        }
        i.line-h{
            width: 30px;
            height: 2px;
            margin-top:0;
            display: block;
            background: url("./../../static/newps/images/line-h.png") no-repeat;
        }
    }

    .ps-mid{
        width: calc(100vw - 121px);
        background: #282828;
        position: relative;
        overflow: hidden;
    }
    .ps-right{
       /* position: fixed;
        right: 0;
        top:60px;*/
        width: 81px;
        height: calc(100vh - 60px);
        background: url("./../../static/images/photoshop-menu-bg.jpg") repeat-y;

        .right-top{
            text-align: center;
            margin:0 auto;
            display: block;
        }
        .one-but{
            position: relative;

            font-size: 12px;
            color:#fff;
            padding: 0 4px;
            margin:3px 8px;
            border-radius: 4px;
            border: 1px solid rgba(44,44,44,0);
            user-select: none;


            &:hover{

                background: linear-gradient(0deg, #606060 20%, #6c6c6c 50%, #707070 70%);
                border: 1px solid rgba(44,44,44,1);
            }
            &:active,&.hover{
                background: #393939;
                border: 1px solid rgba(44,44,44,1);
            }

            span{
                display: flex;
                flex-direction: row;
                align-items: center;


                i{
                    display: inline-block;
                }
                b{
                    font-weight: normal;
                    line-height: 22px;
                    margin-left: 5px;
                }
                /*&:hover{
                    background: black;
                }*/
            }


            .ps-layerbox{
                position: absolute;
                top:0;
                right:66px;
                width:242px;
                background:rgba(83,83,83,1);
                border:1px solid #282828;
                display: flex;
                flex-direction: column;

                .ps-layer-title{
                    height: 16px;
                    border-bottom: 1px solid #282828;
                    background: #393939;
                    span{
                        display: inline-block;
                        background: #535353;
                        padding: 0 5px 0 0;
                        position: relative;

                        &:after{
                            content:"";
                            position:absolute;
                            bottom:-1px;
                            left:0;
                            width: 34px;
                            display: inline-block;
                            height:2px;
                            background: #535353;
                        }
                        b{
                            font-size: 12px;
                            line-height: 16px;
                        }
                    }

                }

                .ps-layer-search{
                    height:28px;
                    border-top:1px solid #707070;
                    border-bottom:1px solid #282828;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    padding: 0 5px;

                    select{
                        border:1px solid #282828;
                        height: 22px;
                        outline: none;
                        background:url("../../static/newps/images/icon-fangdajing.png") no-repeat 5px center;
                        background-size:12px 12px;
                    /*linear-gradient(0deg, #606060 20%, #6c6c6c 50%, #707070 70%)*/
                        border-radius: 3px;
                        color:#fff;
                        font-size: 12px;
                        position: relative;
                        text-indent: 20px;
                        width: 80px;

                        .ps-icon-fangdajing{
                            display: inline-block;
                            position: absolute;
                            left:2px;
                            top:1px;
                        }


                        option{
                            color:#333;
                            font-size: 12px;
                        }

                        &:active{
                            background:#3a3a3a url("../../static/newps/images/icon-fangdajing.png") no-repeat 5px center;
                            background-size:12px 12px;
                        }
                    }

                    input{
                        background:#3a3a3a;
                        width: 148px;
                        height: 20px;
                        outline: none;
                        text-indent: 5px;
                        margin-left:5px;

                        &:focus{
                            background:#ffffff;
                        }
                    }

                }

                .ps-layer-button{
                    height: 28px;
                    border-top:1px solid #707070;
                    border-bottom:1px solid #282828;
                    padding: 0 5px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;

                    i.psicon-suo{
                        cursor: pointer;
                        width: 22px;
                        height: 23px;
                        background:url("../../static/newps/images/yisuo.png") no-repeat;

                        &:hover{
                            background:url("../../static/newps/images/yisuo-3.png") no-repeat;
                        }
                        &:active,&.hover{
                            background:url("../../static/newps/images/yisuo-2.png") no-repeat;
                        }
                    }
                    i.psicon-shan{
                        cursor: pointer;
                        width: 22px;
                        height: 23px;
                        background:url("../../static/newps/images/yishan.png") no-repeat;

                        &:hover{
                            background:url("../../static/newps/images/yishan-3.png") no-repeat;
                        }
                        &:active,&.hover{
                            background:url("../../static/newps/images/yishan-2.png") no-repeat;
                        }
                    }

                    img{
                        line-height: 30px;
                    }
                }
                .ps-history-data{
                    border-bottom:1px solid #282828;
                    height: 350px;
                    overflow-y: scroll;
                    cursor: pointer;

                    p {
                        height: 22px;
                        line-height: 22px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        border-bottom: 1px solid #282828;
                        background: #525252;

                        &.hover{
                            background: rgb(109,125,146);
                        }



                        i{
                            position: relative;
                            width: 20px;
                            height: 20px;
                            margin:0 10px;
                            background: url('../../static/newps/images/icon-history-add.png') no-repeat;

                            &.yidong{
                                background: url('../../static/newps/images/icon-history-yidong.png') no-repeat;
                            }
                            &.fuzhi{
                                background: url('../../static/newps/images/icon-history-fuzhi.png') no-repeat;
                            }
                            &.shanchu{
                                background: url('../../static/newps/images/icon-history-shanchu.png') no-repeat;
                            }
                            &.bianse{
                                background: url('../../static/newps/images/icon-history-bianse.png') no-repeat;
                            }
                        }
                        b{
                            font-weight: normal;
                        }

                        &.disabled{

                            i{
                                /*&:after{
                                    position: absolute;
                                    top: 0;
                                    left: 0;
                                    content: "";
                                    background-color: #999;
                                    opacity: 0.2;
                                    z-index: 1;
                                    width: 100%;
                                    height: 100%;
                                }*/
                            }
                            b{
                                font-style: italic;
                                color:#767676;
                            }
                        }
                    }
                }
                .ps-layer-data{
                    border-bottom:1px solid #282828;
                    height: 350px;
                    overflow-y: scroll;



                    p{
                        height: 40px;
                        line-height: 40px;
                        display: flex;
                        flex-direction: row;
                        align-items: center;
                        border-bottom:1px solid #282828;
                        background: #525252;

                        span.icon-show{
                            width: 30px;
                            display: inline-block;
                            border-right: 1px solid #282828;
                            text-align: center;
                            background: #535353;
                            cursor: pointer;
                        }
                        span.layer-list{
                            width: 100%;
                            height: 40px;
                            display: flex;
                            flex-direction: row;
                            justify-content: space-between;
                            cursor: pointer;

                            i{
                                position: relative;
                                width: 30px;
                                height: 30px;
                                border:1px solid #000;
                                margin-left: 5px;
                                margin-right: 10px;
                                background: #fff;

                                &:before{
                                    content:"";
                                    position: absolute;
                                    top:-3px;
                                    left:-3px;
                                    z-index: 2;
                                    width: 36px;
                                    height: 36px;
                                    background: url("../../static/newps/images/icon-xuanze.png") no-repeat ;
                                    background-size: 100% 100%;

                                    display: none;

                                }

                            }
                            .right{
                                margin-right: 16px;
                                text-align: right;
                                width: 14px;
                                height: 14px;
                                background: url('../../static/newps/images/icon-pssuo-2.png') no-repeat;
                               /* background-size: contain;*/
                            }

                            &.hover{

                                background: rgb(109,125,146);
                               i:before{
                                    display: inline-block;
                                }
                                .right{
                                    background: url('../../static/newps/images/icon-pssuo.png') no-repeat;
                                    /*background-size: contain;*/
                                }
                            }
                        }

                    }

                }

                .ps-layer-botButton{
                    padding: 0 5px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    height: 20px;
                    border-top:1px solid #707070;
                    padding: 0 5px;
                    display: flex;
                    flex-direction: row;
                    align-items: center;;
                }

            }

        }
    }



    .x-line{
        width: 100%;
        height: 18px;
        left: 18px;
        opacity: 0.8;
        background: #303030 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAYAAAAZk42HAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo1MmNmMGFlNi0wYjk5LWIyNDMtODA2Mi04NWIwNDk2MDljYmQiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NDM5OTQ4ODMxNUQ5MTFFQ0JEQzM4RDdCRTZCNDY5REUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NDM5OTQ4ODIxNUQ5MTFFQ0JEQzM4RDdCRTZCNDY5REUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmU0MTdkNzFiLTk0OTQtZTQ0Mi1hNjRiLTFkYjBhY2Q0YzUyYyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1MmNmMGFlNi0wYjk5LWIyNDMtODA2Mi04NWIwNDk2MDljYmQiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4duvYiAAAASUlEQVR42mKYOXPmfyBgGOqYiWGYgFGPjHpk1COjHhn1yKhHRj1CikdmzZr1fzCrG94xMthDH5u60cw+6hEaAUZQx2o4eAQgwACJLrFYUjy2MAAAAABJRU5ErkJggg==);

        /*background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAASCAYAAAAZk42HAAAACXBIWXMAAAsTAAALEwEAmpwYAAA5z2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMTQgNzkuMTUxNDgxLCAyMDEzLzAzLzEzLTEyOjA5OjE1ICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIKICAgICAgICAgICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgICAgICAgICB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIKICAgICAgICAgICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC94bXA6Q3JlYXRvclRvb2w+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDIwLTEwLTE0VDE0OjUwOjIwKzA4OjAwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjAtMTAtMTRUMTQ6NTM6MTgrMDg6MDA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDIwLTEwLTE0VDE0OjUzOjE4KzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL3BuZzwvZGM6Zm9ybWF0PgogICAgICAgICA8cGhvdG9zaG9wOkNvbG9yTW9kZT4zPC9waG90b3Nob3A6Q29sb3JNb2RlPgogICAgICAgICA8eG1wTU06SW5zdGFuY2VJRD54bXAuaWlkOjJlNGFiNGFiLTQ5MDQtNzg0Mi04MjQyLTM0ZjE5MWQ5NzQ3MDwveG1wTU06SW5zdGFuY2VJRD4KICAgICAgICAgPHhtcE1NOkRvY3VtZW50SUQ+eG1wLmRpZDpmZGQ2MzFhNC0yOWQwLTAwNDktYWRiZi1jZmM1ODI0OGMwYTc8L3htcE1NOkRvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+eG1wLmRpZDpmZGQ2MzFhNC0yOWQwLTAwNDktYWRiZi1jZmM1ODI0OGMwYTc8L3htcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5jcmVhdGVkPC9zdEV2dDphY3Rpb24+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDppbnN0YW5jZUlEPnhtcC5paWQ6ZmRkNjMxYTQtMjlkMC0wMDQ5LWFkYmYtY2ZjNTgyNDhjMGE3PC9zdEV2dDppbnN0YW5jZUlEPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6d2hlbj4yMDIwLTEwLTE0VDE0OjUwOjIwKzA4OjAwPC9zdEV2dDp3aGVuPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6c29mdHdhcmVBZ2VudD5BZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpPC9zdEV2dDpzb2Z0d2FyZUFnZW50PgogICAgICAgICAgICAgICA8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaSByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDphY3Rpb24+c2F2ZWQ8L3N0RXZ0OmFjdGlvbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0Omluc3RhbmNlSUQ+eG1wLmlpZDoyZTRhYjRhYi00OTA0LTc4NDItODI0Mi0zNGYxOTFkOTc0NzA8L3N0RXZ0Omluc3RhbmNlSUQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDp3aGVuPjIwMjAtMTAtMTRUMTQ6NTM6MTgrMDg6MDA8L3N0RXZ0OndoZW4+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpzb2Z0d2FyZUFnZW50PkFkb2JlIFBob3Rvc2hvcCBDQyAoV2luZG93cyk8L3N0RXZ0OnNvZnR3YXJlQWdlbnQ+CiAgICAgICAgICAgICAgICAgIDxzdEV2dDpjaGFuZ2VkPi88L3N0RXZ0OmNoYW5nZWQ+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwveG1wTU06SGlzdG9yeT4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzIwMDAwLzEwMDAwPC90aWZmOlhSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpZUmVzb2x1dGlvbj43MjAwMDAvMTAwMDA8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOlJlc29sdXRpb25Vbml0PjI8L3RpZmY6UmVzb2x1dGlvblVuaXQ+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+NjU1MzU8L2V4aWY6Q29sb3JTcGFjZT4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjUwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxZRGltZW5zaW9uPjE4PC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz44Q+t8AAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAA8SURBVHja7M+xDQAACAJB99/gp9U1FJ+EhtBcAZ3QAjohQoQIESJEiJCXkO2/bMjFTchKSEIHAAD//wMAQq9ONkf1DTcAAAAASUVORK5CYII=);*/
        border-right:1px dashed #000;
    }
    .y-line{
        width: 18px;
        height: 100%;
        top: 18px;
        opacity: 0.8;
        background:#303030 url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAyCAYAAABRYothAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3FpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNS1jMDE0IDc5LjE1MTQ4MSwgMjAxMy8wMy8xMy0xMjowOToxNSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2MDFjZjMxZi0yOWNlLWVmNGQtYmMzYi1mZjAzYTcxZjUzNmUiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QUNGODdFMkQxNUQ5MTFFQ0JEMTNCRUI2MEM2Q0Q2MTUiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QUNGODdFMkMxNUQ5MTFFQ0JEMTNCRUI2MEM2Q0Q2MTUiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOmY1MGViYzJkLTUyYTgtNTM0My1iNWM1LTNlNjhjMDMwNjZkZSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo2MDFjZjMxZi0yOWNlLWVmNGQtYmMzYi1mZjAzYTcxZjUzNmUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz47V/1ZAAAATElEQVR42uzSMQoAIAwEwSj+v08+e8FWrDSCxR5YKrJMc3dZxSRdn/mZbkX776FxcikiROzHsbeRiY1sZBMb2chGNrKRjWxir0sBBgCG0DRl49d7GwAAAABJRU5ErkJggg==);

        border-bottom:1px dashed #000;
    }
    .number{
        position: absolute;
        font: 10px/1 Arial, sans-serif;
        color: #999;
        cursor: default;
    }
    .x-line .number{
        top: 1px;
    }
    .y-line .number{
        width: 8px;
        left: 1px;
        word-wrap: break-word;
    }

    .zuoshang{
        position: absolute;
        left:0;
        top:0;
        width: 18px;
        height: 18px;
        background: #999;
        z-index: 9;
        color:red;
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
</style>

<style>
    ::-webkit-scrollbar{
        background:-webkit-gradient(linear,left top,right top,color-stop(0%,rgba(202,202,202,0.07)),color-stop(100%,rgba(229,229,229,0.07)));
        background:-webkit-linear-gradient(left,rgba(202,202,202,0.07) 0%,rgba(229,229,229,0.07) 100%);
        background-color:rgba(229,229,229,.3);
        -webkit-box-shadow:0 0 1px 0 rgba(0,0,0,.15) inset,0 1px 0 0 #000;
        box-shadow:0 0 1px 0 rgba(0,0,0,.15) inset,0 1px 0 0 #000;
        overflow:visible;
        border-radius:4px;
        border:solid 1px #A6A6A6;
    }

    ::-webkit-scrollbar-track-piece{
        background: #434343;
    }
    ::-webkit-scrollbar-thumb {
        background:-webkit-gradient(linear,left top,right top,color-stop(0%,rgba(126,126,126,0.05)),color-stop(100%,rgba(117,117,117,0.05)));
        background:-webkit-linear-gradient(left,rgba(126,126,126,0.05) 0%,rgba(117,117,117,0.05) 100%);

        -webkit-box-shadow:0 2px 1px 0 rgba(0,0,0,.05),inset 1px 1px 0 0 #484848;
        box-shadow:0 2px 1px 0 rgba(0,0,0,.05),inset 1px 1px 0 0 #484848;
        background-color:rgba(124,124,124,.9);
        overflow:visible;
        border-radius:4px;
        border:solid 1px #484848;
    }
</style>
