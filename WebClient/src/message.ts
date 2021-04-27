export class Message {
    private CorrelationId: string;
    private Content: string;
    private Sender: string;
    private Topic: string;

    constructor(id: string, content: string, sender: string, topic: string) {
        this.CorrelationId = id;
        this.Content = content;
        this.Sender = sender;
        this.Topic = topic;
    }

}
