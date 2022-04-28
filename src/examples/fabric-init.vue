<template>
<div>
    <div>
        <div>
            <Fabric-Canvas v-if="showcanvas"
                           ref="canvas" :idno="id" :width="width" :height="height" :boxWidth="boxWidth" :boxHeight="boxHeight"
                           :showRuler="showRuler" :stepLengthp="stepLength"
                           @idAdd="idAdd" @preview ="preview" @setlefttop="setlefttop"
                           @object:selected = "objectselected"
                           @selection:updated="selectionupdated"
                           @object:scaled = "objectscaled"
                           @object:moved = "objectmoved"
                           @object:rotating = "objectrotating"

                           @canvasToData = "canvasToData"

                           @changeZoomTo="changeZoomTo"
                           @copydata="copydata"
                           @deleteidsdata="deleteidsdata"
                           id="can"></Fabric-Canvas>

        </div>
    </div>
</div>
</template>

<script>
    export default {
        name: "index",
        data(){
            return{
                showcanvas:true,
                id: 1,
                width: 800,      //标尺、画布的宽
                height: 600,     //标尺、画布的高
                boxWidth: document.documentElement.clientWidth-250,  //外框宽
                boxHeight: document.documentElement.clientHeight-160,   //外框高
                stepLength: 50,  //标尺单位 每格
                showRuler: [true, true],  //横纵标尺是否显示
                showR:true,
            }
        },
        methods:{
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
            changeZoomTo(){

            },
            copydata(){

            },
            deleteidsdata(){

            },
        }
    }
</script>

<style scoped>

</style>
