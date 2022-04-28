<template>
    <div>

        <ruler-component :value="value" :contentLayout="contentLayout"
                         :step-length="stepLength"  :xLeft="xLeft" :yTop="yTop" :parent="parent"
                         @setLine="setLine"></ruler-component>

        <div style="position: fixed; z-index:9999; left: 50px; top:50px;">我是内容区域 我要怎么显示呢</div>
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
                parent:false,
                stepLength:10,
                xLeft:-80,
                yTop:-20,
                value:[{ type: 'v', site: 80 },{ type: 'h', site: 20 }],
                contentLayout:{ top: 0, left: 0 }
            }
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
