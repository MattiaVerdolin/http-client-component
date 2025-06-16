<script>
    import HttpClient from "./components/HttpClient.svelte";
    import CustomAlert from "./atomicComponents/CustomAlert.svelte";

    let show = false;

    function showCloseAlert() {
        show = !show;
    }

</script>

<HttpClient
        url="https://supsi-ticket.cloudns.org/supsi-http-client/bff"
        search={true}
        collections={true}
        onResponseMessageClick={showCloseAlert}
/>
<HttpClient
        url="https://supsi-ticket.cloudns.org/supsi-http-client/bff"
        search={false}
        collections={true}
/>
<HttpClient
        url="https://supsi-ticket.cloudns.org/supsi-http-client/bff"
        search={false}
        collections={false}
/>

{#if show}
    <CustomAlert alertClass="modal"
                 title="Hai vinto un iPhone 16 pro max!"
                 message="Clicca qui per riceverlo" onClose={showCloseAlert} />
{/if}

