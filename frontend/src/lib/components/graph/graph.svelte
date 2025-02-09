<script lang="ts">
  import { onMount } from "svelte";

  interface Prosp {
    data: { x: any; y: any }[];
    xTags: string[];
    yTags: string[];
  }
  const { data = [], xTags = [], yTags = [] } = $props();

  let svg: SVGSVGElement;
  const size = $state({ width: 0, height: 0 });

  onMount(() => {
    function updateSize() {
      if (
        svg &&
        (size.width !== svg.clientWidth || size.height !== svg.clientHeight)
      ) {
        size.width = svg.clientWidth;
        size.height = svg.clientHeight;
      }
    }

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(svg);

    return () => observer.disconnect();
  });
</script>

<div class="graph">
  <svg width="100%" height="100%" bind:this={svg}> </svg>
</div>

<style>
  .graph {
    width: 100%;
    height: 100%;
  }
</style>
