import * as signalR from "@microsoft/signalr";

export class Communicator {

    //singlr connection cannot be started in a constructor; use a wrapper to setup connection
    private connectionWrapper = new class {

        connection: any;

        establishConnection() {
            this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
            this.connection.start();
        }

    }

    //TODO: need a better way to map hub function names?
    receiveMethodName: string;
    subResponseMethodName: string;

    callbacksByTopics: Map<string, Function>;

    constructor() {
        this.connectionWrapper.establishConnection();
        this.receiveMethodName = "ReceiveMessage";
        this.subResponseMethodName = "ReceiveGroup";
        this.callbacksByTopics = new Map();
    }

    //TODO: put the register methods in constructor
    registerReceiveCallback(callback: Function) {
        this.connectionWrapper.connection.on(this.receiveMethodName, callback);
    }

    registerResponseCallback(callback: Function) {
        this.connectionWrapper.connection.on(this.subResponseMethodName, callback);
    }

    //sendMessage(user: string, message: string) {
    //    console.log("Client called send message to all method");
    //    this.connectionWrapper.connection.invoke("SendMessageAsync", user, message);
    //}

    publish(user: string, topic: string, message: string) {
        console.log("Client called publish method");
        this.connectionWrapper.connection.invoke("PublishMessageAsync", user, topic, message);
    }
    
    async subscribeAsync(topic: string, callback: Function) {
        console.log("Client called subscribe method");
        await this.connectionWrapper.connection.invoke("SubscribeTopicAsync", topic);
        //TODO: get response here;
        //if success, add callback function to dictionary
        this.callbacksByTopics.set(topic, callback);
        console.log(this.callbacksByTopics);//test
    }

    async unsubscribeAsync(topic: string) {
        console.log("Client called unsubscribe method");
        await this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", topic);
        //if success, remove callback for this topic from dictionary

        if (this.callbacksByTopics.has(topic)) {
            this.callbacksByTopics.delete(topic);
            console.log(this.callbacksByTopics);//test
        }

    }

}