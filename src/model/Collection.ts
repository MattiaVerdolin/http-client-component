import { MyRequest } from './MyRequest';

export class Collection {
    id: number;
    name: string;
    requests: MyRequest[];

    constructor(id: number, name: string) {
        this.id = id;
        this.name = name;
        this.requests = [];
    }

    addRequest(request: MyRequest): void {
        this.requests = [...this.requests, request];
    }

    getRequestById(id: number): MyRequest {
        return this.requests.find(request => request.id === id);
    }

    removeRequest(requestId: number): void {
        this.requests = this.requests.filter(req => req.id !== requestId);
    }

}
