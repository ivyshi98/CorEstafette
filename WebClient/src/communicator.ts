import * as signalR from "@microsoft/signalr";
import { Guid } from "guid-typescript";
import { Message } from "./message";
import { IMessage } from "./IMessage";
import { ICommunicator } from "./ICommunicator";
import { IResponse } from "./IResponse";


export class Communicator implements ICommunicator {

    //singlr connection cannot be started in a constructor; use a wrapper to setup connection
    private connectionWrapper = new class {

        connection: any;

        establishConnection(url: string) {
            this.connection = new signalR.HubConnectionBuilder().withUrl(url).build();
            this.connection.start();
        }

        //register the handler to the hub method
        registerCallback(hubMethod: string, handler: Function) {
            this.connection.on(hubMethod, handler);
        }

        //deregister all callbacks from the hub method
        deregisterAllCallbacks(hubMethod: string) {
            this.connection.off(hubMethod);
        }

    }

    private callbacksByTopics: Map<string, (topic: string, message: string)=> any>;
    private responseByCorrelationIds: Map<string, (statusCode: number) => any>;

    //status code
    SUCCEEDED = 0;
    REJECTED = 1;
    DUPLICATE_SUB = 2;
    DUPLICATE_UNSUB = 3;

    constructor() {
        this.connectionWrapper.establishConnection("https://localhost:5001/testhub");
        this.callbacksByTopics = new Map();
      

    //    //New code for receiving message
    //    this.connectionWrapper.registerCallback("ReceiveMessage", (objectReceived: IMessage) => {   
    //        console.log("inside receiveHandler");
    //        console.log("objectReceived" + objectReceived);
    //        const messageReceived: IMessage = <IMessage>objectReceived;
     
    //        let topicReceived = messageReceived.topic;
    //        console.log("topicReceived:" + topicReceived);

    //        let topicCallback = this.callbacksByTopics.get(topicReceived);
    //        console.log("get callback:" + topicCallback);

    //        topicCallback(messageReceived.sender, messageReceived.content);
    //    });
    //}

        this.responseByCorrelationIds = new Map();
        this.connectionWrapper.registerCallback("onPublish", (objectReceived: IMessage) => {
            console.log("inside receiveHandler");//test
            console.log(this.callbacksByTopics);//test
            const messageReceived: IMessage = <IMessage>objectReceived;

            let topicCallback = this.callbacksByTopics.get(messageReceived.Topic);
            topicCallback(messageReceived.topic, messageReceived.content);//invoke callback
            //TODO: does callback have more parameters
        });
    }

    //publish message under certain topic
    publish(topic: string, message: string) {
        console.log("Client called publish method");
        let correlationID = Guid.create().toString();
        console.log("correlationID" + correlationID);
        let messageToSend = new Message(correlationID, message, "user1", topic);
        console.log(messageToSend)
        this.connectionWrapper.connection.invoke("PublishAsync", messageToSend);
    }


    async subscribeAsync(topic: string, topicCallback: (topic: string, message: string) => any): Promise<IResponse>{
        console.log("Client called subscribe method");

        if (this.callbacksByTopics.has(topic)) {
            return new Promise<IResponse>((resolve, reject) => {
                reject("You have subscribed to this topic");
            });
        } else {
            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", "user1", topic);
            let result = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", messageToSend);
            console.log(result);//test

            result.then(() => {
                console.log("sub success");//test
                //add callback function to the dictionary
                this.callbacksByTopics.set(topic, topicCallback);

                return new Promise<IResponse>((resolve, reject) => {
                    resolve(this.SUCCEEDED);//TODO: change this to IResponse
                });
                //subResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("sub rejected");//test
                return new Promise<IResponse>((resolve, reject) => {//TODO: change this to IResponse Promise
                    reject("Service rejected the subscription");
                });
                //subResponseCallback(this.REJECTED);
            });
        }

    }

    async unsubscribeAsync(topic: string): Promise<IResponse>{
        console.log("Client called unsubscribe method");

        if (!this.callbacksByTopics.has(topic)) {
            return new Promise<IResponse>((resolve, reject) => {
                reject("You need to subscribe first before unsubscribing");
            });
            //unsubResponseCallback(this.DUPLICATE_UNSUB);
        } else {

            let correlationID = Guid.create().toString();
            let messageToSend = new Message(correlationID, "", "user1", topic);
            let result = this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", messageToSend);
            console.log(result);//test

            result.then(() => {
                console.log("unsub success");//test
                //remove from dictionary
                this.callbacksByTopics.delete(topic);

                return new Promise<IResponse>((resolve, reject) => {
                    resolve(this.SUCCEEDED);
                });
                //unsubResponseCallback(this.SUCCEEDED);
            }).catch((err: any) => {
                console.log("unsub rejected");//test
                return new Promise<IResponse>((resolve, reject) => {
                    reject("Service rejected unsubscription");
                });
                //unsubResponseCallback(this.REJECTED);
            });
        }
    }

}