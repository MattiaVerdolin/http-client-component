export interface Header {
    header: string;
    value: string;
}

export class MyRequest {
    private static nextId = 1;

    id: number;
    backendId: string;
    headers: Header[];
    url: string;
    body: string | null;  // Può essere `string` o `null`
    method: 'GET' | 'POST' | 'PUT' | 'DELETE'; // Tipi specifici per i metodi HTTP

    constructor(
        headers: Header[] | Record<string, string[]>,
        url: string,
        body: string | null,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        backendId ? : string
    ) {
        this.id = MyRequest.nextId++; // Assegna e incrementa il contatore
        this.backendId = backendId;
        this.headers = Array.isArray(headers)
            ? headers
            : this.convertHeaders(headers);
        this.url = url;
        this.body = body;
        this.method = method;
    }

    private convertHeaders(serverHeaders: Record<string, string[]>): Header[] {
        return Object.entries(serverHeaders).map(([key, values]) => ({
            header: key,
            value: values.join(', ') // Unisce i valori se l'array ha più elementi
        }));
    }
}


