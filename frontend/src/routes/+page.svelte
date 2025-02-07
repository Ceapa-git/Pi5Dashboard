<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { writable } from "svelte/store";

  const intervals = $state([
    {id: 1, value: "10s", text: "10 seconds"},
    {id: 2, value: "30s", text: "30 seconds"},
    {id: 3, value: "60s", text: "1 minute"},
    {id: 4, value: "60m", text: "1 hour"},
    {id: 5, value: "24h", text: "1 day"},
  ]);
  let selected = $state(intervals[0]);

  let message = writable<string>("Fetching data...");
  let data = writable<object>({});
  let timer: number;

  const fetchData = async() => {
    message.set("Fetching data...");
    try {
      const response = await fetch("http://192.168.1.140:5000/stats?view=" + selected.value);
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

  const fetchNow = () => {
    clearInterval(timer);
    fetchData();
    timer = setInterval(fetchData, 5000);
  }

  onMount(() => {
    fetchData();
    timer = setInterval(fetchData, 5000);
  });
  onDestroy(() => {
    clearInterval(timer);
  });
</script>

<div class="main">
  <div class="top">
    <div>
      RaspberryPi5
    </div>
    <div>
      <label for="interval">Show last: </label>
      <select id="interval" bind:value={selected} onchange={fetchNow}>
        {#each intervals as interval}
        <option value={interval}>
          {interval.text}
        </option>
        {/each}
      </select>
    </div>
  </div>

  <div class="section">
    <div class="subsection">cpu usage</div>
    <div class="subsection">memory usage</div>
    <div class="subsection">disk io</div>
  </div>

  <div class="section">
    <div class="subsection">temp+fan</div>
    <div class="subsection">network</div>
    <div class="subsection">disk usage</div>
  </div>
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
    flex: 1;
    background: lightgreen;
    padding: 0;
  }
</style>