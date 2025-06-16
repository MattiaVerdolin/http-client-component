<script lang="ts">
    import TextInfoModel from "../atomicComponents/TextInfoModel.svelte";
    import ButtonModel from "../atomicComponents/ButtonModel.svelte";
    import {HttpClientContext} from '../contexts/context';

    export let onMessageClick = () => {};

    //FIELDS
    export let context: HttpClientContext;
    const responseStore = context.responseStore; // Store per salvare e mostrare la risposta ricevuta

    let status = "";  //stato della risposta
    let time = ""; //tempo di risposta
    let memory = ""; //quantità di dati nella pagina
    let responseBody = "";  //contenitore corpo della risposta

    let isPreview = false; //toggle modalità preview

    let url = "";
    let contentType = 0; // 0: null, 1: html, 2: image, 3: pdf

    $: responseStore.subscribe(response => {
        if (!response) return; //se la response è null return

        resetPreviewFlags();

        try {
            //estrazione dei parametri dalla response del context
            const parsedResponse = JSON.parse(response);
            status = parsedResponse.status || "Unknown Status";
            time = parsedResponse.time || "N/A";
            memory = parsedResponse.size || "N/A";
            responseBody = parsedResponse.body || "";

            //assegnazione del content type in base al tipo della risposta nello store
            switch (parsedResponse.type) {
                case "html":
                    contentType = 1;
                    break;

                case "image":
                    contentType = 2;
                    url = createBlobUrl(responseBody, 'image/png');
                    break;

                case "pdf":
                    contentType = 3;
                    url = createBlobUrl(responseBody, 'application/pdf');
                    break;

                default:
                    break;
            }

        } catch (error) {
            //parametri assegnati di default in caso di errore
            status = "Error";
            time = "N/A";
            memory = "N/A";
            responseBody = "Invalid response format or content";
        }
    });


    function resetPreviewFlags() {
        contentType = 0;
        url = "";
    }

    function createBlobUrl(base64String, mimeType) {
        const byteArrays = [];

        for (let offset = 0; offset < base64String.length; offset += 512) {
            const slice = base64String.slice(offset, offset + 512);
            const byteNumbers = Array.from(slice).map((char: string)  => char.charCodeAt(0));
            byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: mimeType });
        return URL.createObjectURL(blob);
    }

    //switch della modalità preview
    function togglePreview() {
        isPreview = !isPreview;
    }
</script>

<div class="response-handler">
    <!-- Info sulla risposta -->
    <div class="response-info-container">
        <div class="info-box">{status}</div>
        <div class="info-box">{time}</div>
        <div class="info-box">{memory}</div>

        <div class="preview-button">
            <ButtonModel
                    buttonText={isPreview ? "Show RAW" : "Preview"}
                    onClick={togglePreview}>
                <i class={isPreview ? "" : "bi bi-eye"} slot="icon"/>
            </ButtonModel>
        </div>
    </div>

    <!-- Sezione per il corpo della risposta -->
    <div class="response-box">
        {#if isPreview}
            <div class="preview-content">
                {#if contentType == 1}
                    <iframe srcdoc={responseBody} class="html-preview-frame"></iframe>
                {:else if contentType == 2}
                    <img src={url} alt="Preview Image" class="image-preview"/>
                {:else if contentType == 3}
                    <iframe src={url} class="pdf-preview-frame"></iframe>
                {:else}
                    <p>No preview available</p>
                {/if}
            </div>
        {:else}
            <!-- Modalità RAW (JSON grezzo) -->
            <TextInfoModel
                    text={responseBody}
                    isTextarea={true}
                    on:click={() => onMessageClick()}
            />
        {/if}
    </div>
</div>

<style>
    @import '../style/ResponseHanlderStyle.css';
</style>
