<script lang="ts">
    import InputTextModel from "../atomicComponents/InputTextModel.svelte";
    import ButtonModel from "../atomicComponents/ButtonModel.svelte";
    import DropdownButtonModel from "../atomicComponents/DropdownButtonModel.svelte";
    import {HttpClientContext} from '../contexts/context';
    import { MyRequest } from "../model/MyRequest";
    import { get } from "svelte/store";
    import { proxyService } from "../APIservices/apiServices";

    //FIELDS
    const methods = ["GET", "POST", "PUT", "DELETE"]; //lista di metodi possibili
    let selectedMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET'; //metodo di default GET
    let requestBody = ""; //corpo della richiesta
    let url = ""; //url richiesta
    let headersList = [{ header: "", value: "" }]; //lista degli header con chiave string e valore string

    export let context: HttpClientContext; //contesto
    const selectedRequest = context.requestStore;  // Store contenente la richiesta corrente selezionata
    const responseStore = context.responseStore; // Store per salvare e mostrare la risposta ricevuta

    // Quando cambia la request selezionata, aggiorna i dati visibili nello store
    $: selectedRequest.subscribe(request => {
        if (!request) return; //se non esiste return

        //aggiornamento dati della request selezionata
        url = request.url;
        selectedMethod = request.method;
        requestBody = request.body || "";
        headersList = request.headers?.length ? request.headers : [{ header: "", value: "" }];
    });

    //modifica del metodo selezionato
    function handleMethodSelect(method: typeof selectedMethod) {
        selectedMethod = method;
        updateCurrentRequest(); //aggiornamento dati richiesta con i nuovi valori
    }

    //Aggiorna lo store con i dati attuali
    function updateCurrentRequest() {
        let req = get(selectedRequest);

        if (!req) {
            req = new MyRequest(headersList, url, requestBody, selectedMethod);
        } else {
            req.url = url;
            req.method = selectedMethod;
            req.body = requestBody;
            req.headers = headersList;
        }

        selectedRequest.set(req);
    }

    //aggiunge una nuova riga nella porzione degli header con val. vuoti di default
    function addRow() {
        headersList = [...headersList, { header: "", value: "" }];
        updateCurrentRequest(); //aggiornamento dati richiesta con i nuovi valori
    }

    //rimozione di una riga nella porzione di header
    function removeRow(index: number) {
        //controllo la preenza di almeno una riga che rimane per default non cancellabile
        if (headersList.length > 1) {
            headersList = headersList.filter((_, i) => i !== index);
            updateCurrentRequest(); //aggiornamento dati richiesta con i nuovi valori
        }
    }

    async function sendRequest() {
        updateCurrentRequest();  //aggiornamento dati richiesta con i nuovi valori

        const startTime = performance.now();  //ricavo il tempo iniziale del send
        const payload = buildPayload();

        try {
            //corpo della richiesta formato con la chiamata al proxy in API service
            const { responseText, size } = await proxyService(payload);

            const duration = `${(performance.now() - startTime).toFixed(2)} ms`;

            //estrazione dei dati in rawData
            const rawData = tryParseJSON(responseText) ?? { body: responseText };

            const contentType = getHeader(rawData.headers, 'Content-Type');
            const decodedBody = tryDecodeBase64(rawData.body);
            const type = detectContentType(contentType);

            const enrichedData = {
                ...rawData,
                body: decodedBody,
                time: duration,
                size,
                type
            };

            responseStore.set(JSON.stringify(enrichedData, null, 2));
        } catch (error: any) {
            responseStore.set(`Request failed: ${error.message}`);
        }
    }

    //crea una richiesta vuota di default e la setta nello stato
    function newRequest() {
        const req = new MyRequest([{ header: "", value: "" }], "", "", "GET");
        selectedRequest.set(req);
    }

    //estrae il valore di un header (case-insensitive)
    function getHeader(headers: Record<string, string[]>, key: string): string {
        const foundKey = Object.keys(headers).find(h => h.toLowerCase() === key.toLowerCase());
        return foundKey ? headers[foundKey][0] : "";
    }

    //Costruisce il payload da inviare al proxyService (headers, uri, body, method)
    function buildPayload() {
        //formattazione degli header
        const formattedHeaders = headersList.reduce((acc, { header, value }) => {
            if (header && value) acc[header] = [value];
            return acc;
        }, {} as Record<string, string[]>);

        //return dei valori della richiesta
        return {
            method: selectedMethod,
            uri: url,
            headers: formattedHeaders,
            body: requestBody || null
        };
    }

    //Prova a fare il parsing JSON del testo; restituisce null se fallisce
    function tryParseJSON(json: string): any | null {
        try {
            return JSON.parse(json);
        } catch {
            return null;
        }
    }

    function tryDecodeBase64(str: string): string {
        return /^[A-Za-z0-9+/=]+$/.test(str) ? safeAtob(str) : str;
    }

    function safeAtob(str: string): string {
        try {
            return atob(str);
        } catch {
            return str;
        }
    }

    //Riconoscimento del tipo di contenuto (HTML, immagine, PDF, ecc.) a partire dal content-type
    function detectContentType(contentType: string): string {
        if (contentType.includes("image/")) return "image";
        if (contentType.includes("application/pdf")) return "pdf";
        if (contentType.includes("text/html")) return "html";
        return "";
    }

</script>

<div class="request-handler">
    <!-- Barra superiore: metodo, URL, Send e New Request -->
    <div class="upper-bar">
        <div class="new-request-button">
            <ButtonModel buttonText="" onClick={newRequest}>
                <i class="bi bi-file-earmark-plus-fill" slot="icon"></i>
            </ButtonModel>
        </div>
        <div class="top-section">
            <div class="method-selection">
                <DropdownButtonModel
                        title={selectedMethod}
                        data={methods.filter(method => method !== selectedMethod)}
                        on:select={(e) => handleMethodSelect(e.detail)}
                />
            </div>

            <div class="uri-input">
                <InputTextModel
                        placeholder="http://example.com"
                        bind:value={url}
                        on:input={updateCurrentRequest} />
            </div>

            <div class="send-button">
                <ButtonModel buttonText="Send" onClick={sendRequest}>
                    <i class="bi bi-send" slot="icon"></i>
                </ButtonModel>
            </div>
        </div>
    </div>

    <!-- Sezione inferiore: tabella degli header e area per il body -->
    <div class="bottom-section">
        <div class="headers">
            <table>
                <thead>
                <tr>
                    <th>Header</th>
                    <th>Value</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {#each headersList as headerItem, index}
                    <tr>
                        <td>
                            <InputTextModel
                                    placeholder="Content-Type"
                                    bind:value={headersList[index].header}
                                    on:input={updateCurrentRequest}/>
                        </td>
                        <td>
                            <InputTextModel
                                    placeholder="application/json"
                                    bind:value={headersList[index].value}
                                    on:input={updateCurrentRequest}/>
                        </td>
                        <td>
                            <div class="delete-btn">
                                <ButtonModel buttonText="" onClick={() => removeRow(index)}>
                                    <i class="bi bi-trash" slot="icon"></i>
                                </ButtonModel>
                            </div>
                        </td>
                    </tr>
                {/each}
                <tr>
                    <td colspan="3">
                        <div class="add-btn">
                            <ButtonModel buttonText="+" onClick={addRow} />
                        </div>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

        <div class="request-body">
            <InputTextModel
                    placeholder="Request body content"
                    bind:value={requestBody}
                    isTextArea={true}
                    on:input={updateCurrentRequest} />
        </div>
    </div>
</div>

<style>
    @import '../style/RequestHandlerStyle.css';
</style>