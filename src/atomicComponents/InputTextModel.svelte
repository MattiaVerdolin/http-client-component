<script lang="ts">
    import { createEventDispatcher } from 'svelte';

    export let placeholder = "Testo predefinito";
    export let value = "";
    export let isTextArea = false; // Nuova prop per gestire textarea
    const dispatch = createEventDispatcher();

    function handleInput(e) {
        value = e.target.value;
        // Se l'evento è blur, dispatcha l'evento "input"
        if (e.type === 'blur') {
            dispatch('input', e);
        }
    }
</script>

<div class="input-container">
    <div class="icon"> <slot name="icon"/> </div>

    {#if isTextArea}
        <textarea placeholder={placeholder} bind:value on:input={handleInput} on:blur={handleInput}></textarea>
    {:else}
        <input type="text" placeholder={placeholder} bind:value on:input={handleInput} on:blur={handleInput}/>
    {/if}
</div>


<style>
    /* Stili di base per InputTextModel */
    .input-container {
        position: relative;
        display: flex;
        align-items: center;
        background-color: #f9f9f9;
        border-radius: 4px;
        padding: 0 8px;
        border: 1px solid #ccc;
    }

    .input-container input[type="text"],
    .input-container textarea {
        flex: 1;
        border: none;
        background: transparent;
        outline: none;
        padding: 8px;
        font-size: 0.9rem;
        color: #333;
    }

    .icon {
        margin-right: 3px;
        color: #888;
    }
</style>
