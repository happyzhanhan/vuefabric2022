<template>
    <div>
        <h1>我是test2</h1>
        <GeminiScrollbar
                class="my-scroll-bar">
            <div style="width: 120px; height: 300px; background: red;">
                <div>
                    我是内容
                </div>

            </div>
        </GeminiScrollbar>
        <test></test>
    </div>
</template>

<script>
    import test from './test'
    export default {
        name: "test2",
        components:{
            test
        }
    }
</script>

<style scoped>
    .my-scroll-bar{width: 100px; height: 100px;}
</style>
