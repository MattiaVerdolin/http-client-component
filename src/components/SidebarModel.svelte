<script lang="ts">
    import InputTextModel from "../atomicComponents/InputTextModel.svelte";
    import DropdownButtonModel from "../atomicComponents/DropdownButtonModel.svelte";
    import ButtonModel from "../atomicComponents/ButtonModel.svelte";
    import { Collection } from "../model/Collection.js";
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { MyRequest } from "../model/MyRequest";

    import {
        createNewRequest,
        updateRequest,
        getRequestsByCollection,
        getCollections,
        deleteRequestAPI
    } from "../APIservices/apiServices"
    import {HttpClientContext} from "../contexts/context";

    //FIELDS

    let searchTerm = ""; // filtro per la ricerca delle richieste
    let collections = []; // array che conterrà le collezioni e le richieste
    let apiKey = "GROUP10"; // chiave API

    // Props passate al componente
    export let url = "";
    export let search: boolean = true;

    export let context: HttpClientContext;
    const selectedRequestStore = context.requestStore; // Store contenente la richiesta corrente selezionata

    //Eseguito al montaggio del componente per caricare le collezioni e le richieste associate
    onMount(async () => {
        try {
            const collectionsData = await getCollections(url);  //ricaviamo le collections con API services GET
            if (collectionsData) {
                //inserimento delle collections nell'array
                collections = await Promise.all(
                    collectionsData.map(async (collection) => {
                        const newCollection = new Collection(collection.id, collection.name); //creiamo una collection con i dati estratti
                        const requestsData = await getRequestsByCollection(url, collection.id, apiKey) || []; //ricaviamo i dati delle request con API

                        //creazione della request con i dati estratti sopra
                        const requests = requestsData.map(req =>
                            new MyRequest(req.headers || [], req.uri, req.body || "", req.method, req.id)
                        );

                        //inserimento della request nella collection corretta
                        newCollection.requests = requests;
                        return newCollection;
                    })
                );
            }
        } catch (error) {
            console.error("Errore nel caricamento delle collection e delle richieste:", error);
        }
    });

    //aggiunta di una colection alla lista
    function addCollection() {
        const newId = collections.length + 1;
        const newCollection = new Collection(newId, `Collection ${newId}`);
        collections = [...collections, newCollection]; //inserimento della collection nell'array
    }

    //metodo per trovare una request con ricerca (param: lista delle collections)
    function getFilteredRequests(collection) {
        if (!searchTerm) {
            //se il termine di ricerca non è inserito mostriamo le request formattate con Request + id
            return collection.requests.map(req => `Request ${req.id}`);
        } else {
            const term = searchTerm.trim(); //eliminazione di spazi inizio e fine del search term
            // Controlla se il termine inserito è composto solo da cifre
            if (/^\d+$/.test(term)) {

                // Converte il termine in numero intero
                const id = parseInt(term, 10);

                // Filtra le richieste della collezione per id esatte e le restituisce formattate come "Request <id>"
                return collection.requests
                    .filter(req => req.id === id)
                    .map(req => `Request ${req.id}`);
            } else {
                // Se il termine di ricerca non è un numero valido, ritorna comunque tutte le richieste
                return collection.requests.map(req => `Request ${req.id}`);
            }
        }
    }

    function selectRequest(requestString) {
        const id = parseInt(requestString.split(" ")[1], 10);
        let foundRequest = null;

        //ricerca il tutte le collection di una richiesta con l'id passato
        for (const c of collections) {
            for (const r of c.requests) {
                //comparazione con id delle richieste
                if (r.id === id) {
                    foundRequest = r;
                    break;
                }
            }
        }

        //se la richiesta viene trovata la setto nello store come richiesta corrente
        if (foundRequest) {
            selectedRequestStore.set(foundRequest);
        } else {
            console.error("Request non trovata per ID:", id);
        }
    }

    async function saveRequestInCollection(selectedCollectionName: string) {
        //cerca se esiste la collection confrontando i nomi
        const foundCollection = collections.find(c => c.name === selectedCollectionName);
        if (!foundCollection) return;

        //get della richiesta corrente nello store
        let currentRequest = get(selectedRequestStore);
        if (!currentRequest) return;

        const headersObject = currentRequest.headers.reduce((acc, header) => {
            if (header.header && header.value) acc[header.header] = [header.value];
            return acc;
        }, {});

        //settiamo i parametri da salvare con quelli della richiesta corrente passata dallo store
        const requestData = {
            id: currentRequest.backendId,
            name: `Request ${currentRequest.id}`,
            uri: currentRequest.url,
            method: currentRequest.method,
            headers: headersObject,
            body: currentRequest.body || "",
            collectionId: Number(foundCollection.id)
        };

        try {
            const idAssigned = await createNewRequest(url, foundCollection.id, apiKey, requestData); //metodo POST di api service per creare una request

            if (idAssigned) {
                currentRequest.backendId = String(idAssigned); //set del backend id con il return del servizio API in idAssigned (id request del db = backend id)
                foundCollection.addRequest(currentRequest); //aggiunta della request creata  alla collection cercata
                collections = [...collections]; //aggiornamento dinamico collections
            }
        } catch (error) {
            console.error("Errore nella creazione della request:", error);
        }
    }

    async function saveRequest() {
        //get della richiesta corrente dallo store
        const currentRequest = get(selectedRequestStore);
        if (!currentRequest) return;

        //ricerca della collection dove c'è la request che vogliamo salvare con confronto per id
        const foundCollection = collections.find(c =>
            c.requests.some(r => r.id === currentRequest.id)
        );

        if (!foundCollection) return;

        try {
            //format degli header
            const headersObject = currentRequest.headers.reduce((acc, header) => {
                if (header.header && header.value) acc[header.header] = [header.value];
                return acc;
            }, {});

            //set deinuovi dati aggiornati
            const updatedData = {
                uri: currentRequest.url,
                method: currentRequest.method,
                headers: headersObject,
                body: currentRequest.body
            };

            //richiesta UPDATE con API serice
            const result = await updateRequest(url, foundCollection.getRequestById(currentRequest.id).backendId, apiKey, updatedData);
            if (result) {
                console.log(`Request ${currentRequest.id} aggiornata con successo in ${foundCollection.name}`);
            }
        } catch (error) {
            console.error("Errore nell'aggiornamento della request:", error);
        }
    }

    async function deleteRequest(requestString: string, event?: Event) {
        if (event) event.stopPropagation();

        //estrazione dell'id dalla stringa passata
        const id = parseInt(requestString.split(" ")[1], 10);

        //ricerca della collections tramite check su id delle request dove voglio eliminare
        const foundCollection = collections.find(c =>
            c.requests.some(r => r.id === id)
        );

        if (!foundCollection) return;

        //richiesta di DELETE tramite API service
        const result = await deleteRequestAPI(url, foundCollection.getRequestById(id).backendId, apiKey);

        if (result) {
            //se la richiesta va a buon fine rimuoviamo quella specifica richiesta dalla collection cercata inizialmente
            foundCollection.removeRequest(id);
            collections = [...collections];
        }
    }

    function exportCollections() {
        // Costruisce la struttura dei dati da esportare in JSON
        const exportData = collections.map((col) => ({
            id: col.id,
            name: col.name,
            requests: col.requests.map((req) => ({
                id: req.id,
                backendId: req.backendId,
                headers: req.headers,
                url: req.url,
                body: req.body,
                method: req.method
            }))
        }));

        // Crea un Blob con i dati JSON formattati con indentazione (2 spazi)
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: "application/json"
        });

        // Crea un URL temporaneo per il file JSON
        const url = URL.createObjectURL(blob);

        // Crea dinamicamente un elemento <a> per effettuare il download
        const link = document.createElement("a");
        link.href = url;
        link.download = "collections_export.json"; // nome del file esportato

        // Aggiunge il link al DOM, simula il click e lo rimuove subito dopo
        document.body.appendChild(link);
        link.click(); // Trigger download
        document.body.removeChild(link);

        // Libera la memoria rilasciando l’oggetto URL creato
        URL.revokeObjectURL(url);
    }

    async function importCollections(event) {
        // Ottiene il file selezionato dall'utente (input type="file")
        const file = event.target.files[0];
        if (!file) return; // Se nessun file è stato selezionato, esci

        try {
            // Legge il contenuto del file come testo
            const text = await file.text();

            // Parsea il contenuto in formato JSON
            const importedData = JSON.parse(text);

            // Per ogni collezione contenuta nel file importato...
            for (const colData of importedData) {
                // Controlla se esiste già una collezione con lo stesso nome
                let existingCollection = collections.find(c => c.name === colData.name);

                // Se non esiste, crea una nuova collezione con un ID univoco
                if (!existingCollection) {
                    const newId = Math.max(0, ...collections.map(c => c.id)) + 1;
                    existingCollection = new Collection(newId, colData.name);
                    collections = [...collections, existingCollection]; // aggiorna lo stato reattivo
                }

                // Per ogni richiesta nella collezione importata...
                for (const reqData of colData.requests) {
                    // Verifica se esiste già (controllo su backendId)
                    const alreadyExists = existingCollection.requests.some(r => r.backendId === reqData.backendId);

                    // Se non esiste, crea e aggiunge la nuova richiesta alla collezione
                    if (!alreadyExists) {
                        const newRequest = new MyRequest(
                            reqData.headers,
                            reqData.url,
                            reqData.body,
                            reqData.method,
                            reqData.backendId
                        );
                        newRequest.id = reqData.id; // imposta ID interno
                        existingCollection.addRequest(newRequest);
                    }
                }
            }

            // Forza l'aggiornamento reattivo della lista delle collezioni
            collections = [...collections];
        } catch (error) {
            // In caso di errore (es. file non valido), stampa un messaggio
            console.error("Errore durante l'importazione:", error);
        }
    }
</script>

<div class="sidebar-container">
    <h3>Collections</h3>

    <!-- Sezione per salvare la request -->
    <div class="save-section">

        <!-- Pulsante Salva: aggiorna la request se già presente -->
        <ButtonModel buttonText="" onClick={saveRequest}>
            <i class="bi bi-floppy" slot="icon"></i>
        </ButtonModel>

        <!-- Dropdown per 'Salva con nome': scegli la collection in cui salvare la request -->
        <div class="save-as">
            <DropdownButtonModel
                    title="Save in"
                    data={collections.map(c => c.name)}
                    on:select={(e) => saveRequestInCollection(e.detail)}
            />
        </div>
    </div>

    <!-- Sezione search delle requests -->
    {#if search}
        <div class="search-container">
            <InputTextModel placeholder="Search" bind:value={searchTerm}>
                <i class="bi bi-search icon" slot="icon"></i>
            </InputTextModel>
        </div>
    {/if}

    {#each collections as collection}
        <div class="dropDownComponent">

            <!-- Drop down menu delle collections -->
            <DropdownButtonModel
                    title={collection.name}
                    data={getFilteredRequests(collection)}
                    isOpen={searchTerm && getFilteredRequests(collection).length > 0}
                    on:select={(e) => selectRequest(e.detail)}>

                <i class="bi bi-folder" slot="icon"></i>

                <svelte:fragment slot="item" let:item>
                    <!-- item è una stringa tipo "Request 3" -->
                    <div class="request-row" on:click={() => selectRequest(item)}>
                        <span>{item}</span>

                        <!-- Pulsante di rimozione -->
                        <div class="delete-request-btn">
                            <ButtonModel buttonText="" onClick={() => deleteRequest(item)}>
                                <i class="bi bi-file-earmark-minus-fill" slot="icon"></i>
                            </ButtonModel>
                        </div>
                    </div>
                </svelte:fragment>

            </DropdownButtonModel>
        </div>
    {/each}

    <div class="add-collection">
        <ButtonModel buttonText="" onClick={addCollection}>
            <i class="bi bi-folder-plus" slot="icon"></i>
        </ButtonModel>
    </div>

    <!-- Pulsanti Import ed Export -->
    <div class="import-export-buttons">
        <!-- EXPORT -->
        <ButtonModel buttonText="Download" onClick={exportCollections}>
            <i class="bi bi-download" slot="icon"></i>
        </ButtonModel>

        <!-- IMPORT -->
        <ButtonModel buttonText="Upload" onClick={() => document.getElementById('import-file').click()}>
            <i class="bi bi-upload" slot="icon"></i>
        </ButtonModel>

        <!-- Input file nascosto per import -->
        <input
                id="import-file"
                type="file"
                accept=".json"
                on:change={importCollections}
                hidden
        />
    </div>
</div>

<style>
    @import '../style/SideBarStyle.css';
</style>