<template>
    <div>
        <vue-fabric ref="canvas" :width="width" :height="height" id="can"></vue-fabric>
    </div>
</template>

<script>
    export default {
        name: "index",
        data(){
            return{
                data: '123',
                width: document.documentElement.clientWidth,
                height:document.documentElement.clientHeight,
            }
        },
        mounted () {
            var canvas =  this.$refs.canvas.canvas;

            fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';


            //圆角矩形
            let rectdata = this.$refs.canvas.createRect({
                id: 1,
                width: 500,
                height: 200,
                left: 100,
                top: 100,
                padding: 0,
                angle: 0,
                fillColor:'#eee',
                bordersColor: '#f00',
                bordersWidth: 1,
                bordersStyle: [0,0],
                scaleX:1,
                scaleY:1,
                rx: 5,
                ry: 5,
                skewX: 0,
                skewY: 0,
            });

            let rectdata2 = this.$refs.canvas.createRect({
                id: 1,
                width: 500,
                height: 200,
                left: 800,
                top: 300,
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
            });


        },
        methods: {

        },
    }
</script>

<style scoped>

</style>
