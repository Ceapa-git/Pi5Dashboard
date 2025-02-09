<script lang="ts">
  import { onMount } from "svelte";

  const { isLoading = true, children = undefined } = $props();

  let loaderContainer: HTMLElement;
  const style = $state({ flexDirection: "column" });

  onMount(() => {
    if (loaderContainer) {
      const parent = loaderContainer.parentElement;
      if (parent) {
        console.log(parent.classList);
        console.log(getComputedStyle(parent).flexDirection);

        style.flexDirection =
          getComputedStyle(parent).flexDirection || "column";
      }
    }
  });
</script>

<div
  class="loader"
  bind:this={loaderContainer}
  style="flex-direction: {style.flexDirection};"
>
  {#if isLoading}
    <p>Loading</p>
  {:else if children}
    {@render children()}
  {:else}
    <p>empty</p>
  {/if}
</div>

<style>
  .loader {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
</style>
