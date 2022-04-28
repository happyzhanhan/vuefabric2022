<template>
  <div class="container"  id="parentBox" >
    <!---有画布 有标尺 有辅助线 （但是标尺不固定） 的应用 v0.0.2 -->
    <div  :style="'width:'+width+'px;height:'+height+'px;'" >
      <vue-fabric ref="canvas" :width="width" :height="height" id="can"
                  :value="value" :contentLayout="contentLayout" :visible="visible"
                  :step-length="stepLength"  :xLeft="xLeft" :yTop="yTop" :parent="parent"
                  @setLine="setLine"></vue-fabric>
    </div>



  </div>
</template>

<script>
  import { on, off } from './event'
export default {
  components: { },
  data () {
    return {
      visible:true,
      parent:true,
      stepLength:50,
      xLeft:0,
      yTop:0,
      value:[/*{ type: 'v', site: 100 },{ type: 'v', site: 600 },{ type: 'h', site: 100 }*/],
      contentLayout:{top: 0, left: 0, }, //top: 0, left: 0

      data: '123',
      width: 5020,  //加20算上滚动条的宽度
      height:3020,//加20算上滚动条的宽度
    };
  },
  created () {
    /*this.width = document.body.offsetWidth;
    if (window.innerHeight)
      this.height = window.innerHeight;
    else if ((document.body) && (document.body.clientHeight))
      this.height = document.body.clientHeight;*/


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
      top: 900,
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
    //设置辅助线
    setLine(data){
      this.value = data;
    }
  }
};
</script>

<style lang='scss' scoped>
.container{
  margin-top:100px;
  margin-left:50px;
  border:1px solid #666;
  width: 1000px;
  height:600px;
  overflow: scroll;
}

</style>
