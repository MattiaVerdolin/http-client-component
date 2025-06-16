const PROXY_URL = 'https://supsi-ticket.cloudns.org/supsi-http-client/proxy/execute'; /** * Esegue una richiesta HTTP passando per il proxy */

export async function proxyService(payload) {
    try {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            throw new Error(`Error ${res.status}: ${await res.text()}`);
        }
        const responseText = await res.text();
        const contentLength = res.headers.get('content-length');
        return {
            responseText,
            size: contentLength ? `${(+contentLength / 1024).toFixed(2)} KB` : `${(new Blob([responseText]).size / 1024).toFixed(2)} KB`
        };
    } catch (error) {
        throw error;
    }
}

//Ottiene la lista delle collection
export async function getCollections(baseUrl) {

    try {
        const res = await fetch(`${baseUrl}/collections`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error(`Errore ${res.status}: ${await res.text()}`);

        return await res.json();
    } catch (error) {
        console.error('Errore nella richiesta delle collection:', error);
        return null;
    }
}

//Ottiene la lista delle richieste per una collection specifica
export async function getRequestsByCollection(baseUrl, collectionId, apiKey) {
    try {
        const res = await fetch(`${baseUrl}/collections/${collectionId}/requests?apiKey=${apiKey}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error(`Errore ${res.status}: ${await res.text()}`);

        return await res.json();
    } catch (error) {
        console.error('Errore nella richiesta delle richieste per collection:', error);
        return null;
    }
}

//Crea una nuova richiesta in una collection specifica
export async function createNewRequest(baseUrl, collectionId, apiKey, requestData) {
    try {
        const res = await fetch(`${baseUrl}/collections/${collectionId}/requests?apiKey=${apiKey}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!res.ok) {
            throw new Error(`Errore ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        return data.id;
    } catch (error) {
        console.error('Errore nella creazione della richiesta:', error);
    }
}


//Modifica una richiesta esistente
export async function updateRequest(baseUrl, requestId, apiKey, updatedData) {
    try {
        const res = await fetch(`${baseUrl}/requests/${requestId}?apiKey=${apiKey}`, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!res.ok) throw new Error(`Errore ${res.status}: ${await res.text()}`);

        return await res.json();
    } catch (error) {
        console.error('Errore nell\'aggiornamento della richiesta:', error);
        return null;
    }
}


//Elimina una richiesta specifica
export async function deleteRequestAPI(baseUrl, requestId, apiKey) {
    try {
        const res = await fetch(`${baseUrl}/requests/${requestId}?apiKey=${apiKey}`, {
            method: 'DELETE',
            headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error(`Errore ${res.status}: ${await res.text()}`);

        console.log(`Request ${requestId} eliminata con successo`);
        return true; // Indica che l'eliminazione ha avuto successo
    } catch (error) {
        console.error(`Errore durante l'eliminazione della request ${requestId}:`, error);
        return false;
    }
}
