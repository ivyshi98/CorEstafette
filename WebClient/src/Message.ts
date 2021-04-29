import { IMessage } from "./IMessage";

export class Message implements IMessage {
    private correlationId: string;
    private content: string;
    private sender: string;
    private topic: string;

    constructor(id: string, content: string, sender: string, topic: string) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
    }

    get Topic() {
        return this.topic;
    }

    get CorrelationId() {
        return this.correlationId;
    }

    get Sender() {
        return this.sender;
    }

    get Content() {
        return this.content;
    }
}