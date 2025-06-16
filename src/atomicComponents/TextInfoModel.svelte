<script>
    export let text = "Default Text";
    export let isTextarea = false;

    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
</script>

{#if isTextarea}
  <textarea
          class="text-area"
          readonly
          value={text}
          on:click={(e) => dispatch('click', e)} />
{:else}
    <div class="text-area" on:click={(e) => dispatch('click', e)}>
        {text}
    </div>
{/if}

<style>
    .text-area:focus {
        outline: none;
    }
</style>