using System;
using System.Threading.Tasks;

namespace SignalRCommunicator
{
    public interface ICommunicator
    {
        /// <summary>
        /// Subscribe to a topic to receive the messages from this topic
        /// </summary>
        /// <param name="topic">The name of the topic to be subscribed to</param>
        /// <param name="callBack">Handles the response</param>
        /// <returns>
        /// A response confirming if the operation was a success or not
        /// </returns>
        Task<IResponse> SubscribeAsync(string topic, Func<string, Task> callBack);

        /// <summary>
        /// Unsuscribe for a topic to stop receiving the messages from this topic
        /// </summary>
        /// <param name="topic">The name of the topic to unsubscribe from</param>
        /// <returns>
        /// A response confirming if the operation was a success or not
        /// </returns>
        Task<IResponse> UnsubscribeAsync(string topic);

        /// <summary>
        /// Send a message to a specific topic to be broadcast to all the users registered
        /// to that topic
        /// </summary>
        /// <param name="topic"></param>
        /// <param name="message"></param>
        /// <returns></returns>
        Task PublishAsync(string topic, string message);

        /// <summary>
        /// Add a responder to the list of quierable clients
        /// </summary>
        /// <param name="responder"></param>
        /// <param name="callBack"></param>
        /// <returns>
        /// REturn the response that a client has been successfully added as a responder or not
        /// </returns>
        Task<IResponse> AddResponder(string responder, Func<IRequest, Task<Object>> callBack);

        /// <summary>
        /// Send a query to a client and receive the data
        /// </summary>
        /// <param name="responder"></param>
        /// <param name="additionalData"></param>
        /// <returns>
        /// Return the response from the querying client
        /// </returns>
        Task<IResponse> QueryAsync(string responder, string additionalData);
    }
}