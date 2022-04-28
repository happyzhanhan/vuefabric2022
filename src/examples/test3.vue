<template>
  <div class="box">
      <div class="head">

      </div>
      <div class="boxcenter">
          <div class="top">
              top
          </div>
          <div class="con">
              <div class="neir">
                  aaaaaaaaaaaaaa
              </div>
          </div>
      </div>

  </div>
</template>

<script>

</script>

<style scoped lang="scss">
.box{
    background: #eee;
}
.head{
    height: 800px;
    background: green;
}
.boxcenter{
    position: relative;
    width: 500px;
    height:500px;
    background: yellow;
    margin:10px auto;
    overflow: hidden;
}
.con{
    position: relative;
    width: 500px;
    height:500px;
    background: red;
    overflow: auto;
}
.top{
    position: absolute;
    top:5px;
    color: #fff;
    left:0;
    z-index: 999;
}
.neir{
    width: 1000px;
    height:1000px;
    background: blue;
}
</style>
