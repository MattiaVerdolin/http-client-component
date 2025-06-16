import { writable, type Writable } from 'svelte/store';
import  { MyRequest } from '../model/MyRequest';

export class HttpClientContext {
    // Store reattivo per contenere l'oggetto della richiesta HTTP
    private readonly _requestStore: Writable<MyRequest | null>;

    // Store reattivo per contenere la risposta HTTP come stringa
    private readonly _responseStore: Writable<string>;

    constructor() {
        this._requestStore = writable(null);
        this._responseStore = writable('');
    }

    get requestStore(): Writable<MyRequest | null> {
        return this._requestStore;
    }

    get responseStore(): Writable<string> {
        return this._responseStore;
    }
}

