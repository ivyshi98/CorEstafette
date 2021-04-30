import { IMessage } from "./IMessage";

export class Message implements IMessage {
    private correlationId: string;
    private content: string;
    private sender: string;
    private topic: string;
    private timeStamp: Date;

    constructor(id: string, content: string, sender: string, topic: string) {
        this.correlationId = id;
        this.content = content;
        this.sender = sender;
        this.topic = topic;
        this.timeStamp = new Date();
    }

    get Topic() { return this.topic; }
    set Topic(value: string) { this.topic = value;}

    get CorrelationId() { return this.correlationId; }
    set CorrelationId(value: string) { this.correlationId = value; }

    get Sender() { return this.sender; }
    set Sender(value: string) { this.sender = value; }

    get Content() { return this.content; }
    set Content(value: string) { this.content = value; }

    get TimeStamp() { return this.timeStamp; }
    set TimeStamp(value: Date) { this.timeStamp = value; }
}