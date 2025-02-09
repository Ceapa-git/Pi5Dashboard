<script lang="ts">
  import { Graph } from "$lib/components/graph";
  import { Loader } from "$lib/components/loader";
  import { Panel } from "$lib/components/panel";
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";

  const intervals = $state([
    { id: 1, value: "10s", text: "10 seconds" },
    { id: 2, value: "30s", text: "30 seconds" },
    { id: 3, value: "60s", text: "1 minute" },
    { id: 4, value: "60m", text: "1 hour" },
    { id: 5, value: "24h", text: "1 day" },
  ]);
  let selected = $state(intervals[0]);

  let message = writable<string>("Fetching data...");
  let data = writable<object>({});
  let timer: number;

  let loading = writable<boolean>(true);

  let graphTest = {
    data: [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 3 },
      { x: 4, y: 0 },
    ],
    xTags: [1, 4],
    yTags: [0, 2, 4],
  };

  const fetchData = async () => {
    message.set("Fetching data...");
    try {
      const response = await fetch(
        "http://192.168.1.140:5000/stats?view=" + selected.value,
      );
      if (response.ok) {
        const result = await response.json();
        message.set("");
        data.set(result);
      } else {
        message.set("Error fetching data");
      }
    } catch (error) {
      message.set("Error fetching data");
    }
  };

  const fetchNow = async () => {
    clearInterval(timer);
    await fetchData();
    timer = setInterval(fetchData, 5000);
  };

  const changeInterval = async () => {
    loading.set(true);
    data.set([]);
    await fetchNow();
    loading.set(false);
  };

  onMount(() => {
    timer = setInterval(fetchData, 5000);
    changeInterval();
  });
  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<div class="main">
  <div class="top">
    <div>RaspberryPi5</div>
    <div>
      <label for="interval">Show last: </label>
      <select id="interval" bind:value={selected} onchange={changeInterval}>
        {#each intervals as interval}
          <option value={interval}>
            {interval.text}
          </option>
        {/each}
      </select>
    </div>
  </div>

  <Panel row={true}>
    <Panel title={"cpu usage"} isLoading={$loading}>
      <Graph
        data={graphTest.data}
        xTags={graphTest.xTags}
        yTags={graphTest.yTags}
      />
      <Graph
        data={graphTest.data}
        xTags={graphTest.xTags}
        yTags={graphTest.yTags}
      />
    </Panel>
    <Panel title={"memory usage"} isLoading={$loading}></Panel>
    <Panel title={"disk io"} isLoading={$loading}></Panel>
  </Panel>
  <Panel row={true}>
    <Panel title={"temp+fan"} isLoading={$loading}></Panel>
    <Panel title={"network"} isLoading={$loading}></Panel>
    <Panel title={"disk usage"} isLoading={$loading}></Panel>
  </Panel>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    height: 100%;
  }
  .main {
    background: gray;
    min-height: 100vh;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .top {
    background: lightblue;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }
  .section {
    display: flex;
    flex: 1;
  }
  .subsection {
    display: flex;
    flex: 1;
    background: lightgreen;
    padding: 0;
  }
  .verticalFlex {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
