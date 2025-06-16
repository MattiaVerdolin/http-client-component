<script lang="ts">
    import SidebarModel from "./SidebarModel.svelte";
    import RequestHandler from "./RequestHandler.svelte";
    import ResponseHandler from "./ResponseHandler.svelte"
    import {HttpClientContext} from "../contexts/context";

    export let url: string = "";               // URL base
    export let search: boolean = true;         // Mostra o nasconde search bar
    export let collections: boolean = true;    // Mostra o nasconde sidebar
    export let onResponseMessageClick = () => {} // Funzione di callback

    // Istanzia un nuovo context indipendente per questa HttpClient
    const context = new HttpClientContext();

</script>

<div class="main-container">
    {#if collections}
        <SidebarModel {search} url={url} context={context}/>
    {/if}
    <div class="request-section">
        <RequestHandler context={context}/>
        <ResponseHandler context={context} onMessageClick={onResponseMessageClick}/>
    </div>
</div>

<style>
    @import '../style/HttpClientStyle.css';
</style>


