<script setup lang="ts">
import { nextTick, ref } from "vue";

const props = defineProps({
    path: String
})
const path = ref("loading...")
nextTick(async () => {
    path.value = "/"
    import('/example/js/' + props.path)
});
</script>
<template>
    <div class="body">
        <canvas id="canvas" width="500" height="500"></canvas>
    </div>
    <a :href="path" target="_blank">Code (Github)</a>
</template>
<style scoped>
.body {
    border: 1px solid;
    height: 100%;
    width: 100%;
}

#canvas {
    width: 100%;
}
</style>