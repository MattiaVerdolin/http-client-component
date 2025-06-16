<script lang="ts">
    import "bootstrap-icons/font/bootstrap-icons.css";
    import { createEventDispatcher } from 'svelte';

    export let title = "Default Title";  // Nome del componente (dinamico)
    export let data : string[];                // Array di oggetti (flessibile)
    export let isOpen = false;
    type ItemType = string;

    const dispatch = createEventDispatcher();

    function changeButtonState() {
        isOpen = !isOpen;
    }

    // Evento personalizzato per segnalare la selezione
    function selectOption (item) {
        dispatch('select', item);
        isOpen = false;
    }
</script>

<div class="dropdown">
    <button on:click={changeButtonState}>
        <slot name="icon" />
        {title}
        {#if isOpen}
            <i class="bi bi-caret-down-fill"></i>
        {:else}
            <i class="bi bi-caret-right-fill"></i>
        {/if}
    </button>

    {#if isOpen}
        <div class="dropdown-menu">
            {#each data as item}
                <slot name="item" {item}>
                    <!-- Fallback predefinito -->
                    <div class="dropdown-item" on:click={() => selectOption(item)}>
                        {item}
                    </div>
                </slot>
            {/each}
        </div>
    {/if}

    <slot />
</div>


<style>
    .dropdown button {
        width: 100%;
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 8px 12px;
        text-align: left;
        font-size: 0.9rem;
        color: #333;
        cursor: pointer;
        display: block;
        align-items: center;
        justify-content: space-between;
        transition: background-color 0.2s;
    }

    .dropdown button:hover {
        background-color: #f0f0f0;
    }

    /* Icone caret */
    .dropdown button .bi-caret-down-fill,
    .dropdown button .bi-caret-right-fill {
        float: right;
        margin-left: 8px;
        color: #007BFF;
    }

    /* Ogni voce del menu */
    .dropdown-menu .item {
        padding: 8px 12px;
        font-size: 14px;
        color: #333;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    /* Hover su una voce */
    .dropdown-menu .item:hover {
        background-color: #f0f0f0;
    }

    /* Eventuale stile al testo (es. allineamento) */
    .dropdown-menu .item p {
        margin: 0;
        line-height: 1.2;
    }
</style>