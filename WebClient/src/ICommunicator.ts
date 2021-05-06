import { IResponse } from "./IResponse";
import { IMessage } from "./IMessage";
import { IRequest } from "./IRequest";

export interface ICommunicator {
    //publish message under certain topic
    publish: (topic: string, message: string) => void;
    //subscribe to a topic, store the callback function for that topic, and return a promise of IResponse
    subscribeAsync: (topic: string, topicCallback: (message: IMessage) => any) => Promise<IResponse>;
    //unsubscribe from a topic, remove the cached callback, and return a promise of IResponse
    unsubscribeAsync: (topic: string) => Promise<IResponse>;


    queryAsync: (responder: string, additionalData: string) => Promise<IResponse>;
    addResponder: (responder: string, respondCallback: (request: IRequest) => Promise<Object>) => Promise<IResponse>;
    //addResponder: (responder: string, respondCallback: (request: IRequest) => string) => void;
    //stop the connection to SignalRHub
    disconnectAsync: () => Promise<IResponse>;

}