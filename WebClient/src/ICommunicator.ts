import { IResponse } from "./IResponse";
import { IMessage } from "./IMessage";
import { IRequest } from "./IRequest";

export interface ICommunicator {

    getConnectionState: () => Promise<IResponse>;
    publish: (topic: string, message: string) => void;
    subscribeAsync: (topic: string, topicCallback: (message: IMessage) => any) => Promise<IResponse>;
    unsubscribeAsync: (topic: string) => Promise<IResponse>;

    queryAsync: (responder: string, additionalData: string) => Promise<IResponse>;
    addResponder: (responder: string, respondCallback: (request: IRequest) => Promise<any>) => Promise<IResponse>;
    disconnectAsync: () => Promise<IResponse>;

}