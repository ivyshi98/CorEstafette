import { IMessage } from "./IMessage";

export interface IResponse extends IMessage {
    Success: boolean;
}
