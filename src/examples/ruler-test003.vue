<template>
    <div>

        <ruler-component :value="value" :contentLayout="contentLayout"
                         :step-length="stepLength"  :xLeft="xLeft" :yTop="yTop" :parent="parent"
                         @setLine="setLine"></ruler-component>

        <!--<div style="position: fixed; z-index:99991; left: 68px; top:50px;">
            123456789
            <canvas id="canvas" :width="1000" :height="1000"></canvas>
        </div>-->
       <!-- <vue-fabric  style="position: fixed; z-index:9999; left: 18px; top:18px;" ref="canvas" :width="width" :height="height" id="can"></vue-fabric>-->
    </div>

</template>

<script>
    import rulerComponent from './ruler-component'
    export default {
        name: "index",
        components:{
            rulerComponent
        },
        data(){
            return{
                data: '123',
                width: 2000,
                height:1000,

                parent:false,
                stepLength:10,
                xLeft:-80,
                yTop:-20,
                value:[{ type: 'v', site: 80 },{ type: 'h', site: 20 }],
                contentLayout:{ top: 0, left: 0 }
            }
        },
        created () {
            this.width = document.body.offsetWidth;
            if (window.innerHeight)
                this.height = window.innerHeight;
            else if ((document.body) && (document.body.clientHeight))
                this.height = document.body.clientHeight;


        },
        mounted () {
            this.canvas = new fabric.Canvas('canvas', { preserveObjectStacking: true });
            let canvas = this.canvas;
           // canvas.backgroundColor = '#eeeeee';

            let rectdata2 = new fabric.Rect({width:20,height:30,fillColor:'#000',});
            this.canvas.add(rectdata2);
            this.canvas.renderAll();
            /*var canvas =  this.$refs.canvas.canvas;

            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';


            //平行四边形
            let rectdata2 = this.$refs.canvas.createRect({id:2,padding:10,});
            let rectdata3 = this.$refs.canvas.createRect({id:3,left:60,fillColor:'blue', visible:true,selectable:false});
            let rectdata4 = this.$refs.canvas.createRect({id:4,top:60,fillColor:'red',});

            //圆角矩形
            let rectdata = this.$refs.canvas.createRect({
                id: 1,
                width: 500,
                height: 200,
                left: 70,
                top: 70,
                padding: 0,
                angle: 0,
                fillColor:'#eee',
                bordersColor: '#f00',
                bordersWidth: 1,
                bordersStyle: [0,0],
                scaleX:1,
                scaleY:1,
                rx: 0,
                ry: 0,
                skewX: 0,
                skewY: 0,
            });*/

        },
        methods:{
            setLine(data){
                this.value = data;
            }
        }
    }
</script>

<style scoped>

</style>
