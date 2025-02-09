<script lang="ts">
  import { Loader } from "../loader";

  const {
    title = "",
    isLoading = false,
    children = undefined,
    row = false,
  } = $props();
</script>

<div class="panel">
  {#if title !== ""}
    <div class="title">
      {title}
    </div>
  {/if}
  <div class="content" class:row>
    <Loader {isLoading}>
      {#if children}
        {@render children()}
      {/if}
    </Loader>
  </div>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }
  .title {
    flex: 0;
    display: flex;
    justify-content: center;
    padding: 10px;
    font-family: sans-serif;
    font-weight: bold;
    background: #ddd;
    border-bottom: 1px solid #bbb;
  }
  .content {
    display: flex;
    flex: 1;
    justify-content: center;
    flex-direction: column;
  }
  .row {
    flex-direction: row;
  }
</style>
