using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;

namespace SignalRCommunicator
{
    internal class Communicator :ICommunicator
    {
        private readonly HubConnection connection;
        private readonly Dictionary<string, Func<string, Task>> callBackTopics;
        private readonly Dictionary<string, Func<IRequest, Object>> callBackByResponder;
        private readonly string UserId;
        
        public Communicator()
        {
            callBackTopics = new Dictionary<string, Func<string, Task>>();
            callBackByResponder = new Dictionary<string, Func<IRequest, object>>();
            UserId = "User" + new Random().Next(1, 50);
            connection = new HubConnectionBuilder()
                .WithUrl("https://localhost:44392/signalrhub")
                .Build();

            _ = Task.Run(async () => { await connection.StartAsync(); });
            connection.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await connection.StartAsync();
            };

            ConnectAsync();
 
            connection.On<Message>(nameof(OnPublish), OnPublish);
        }
        private async Task OnPublish(Message message)
        {
            await callBackTopics[message.Topic]($"{message.Sender} published : {message.Content} on topic {message.Topic}");
        }

        private async void ConnectAsync()
        {
            var response = await connection.InvokeAsync<Response>("ConnectAsync", UserId);
        }
        
        public async Task<IResponse> SubscribeAsync(string topic, Func<string, Task> callBack)
        {
            if (callBackTopics.ContainsKey(topic))
                return null;
            
            IMessage message = new Message(topic, null, UserId);
            Task<Response> subscribeTask = connection.InvokeAsync<Response>("SubscribeTopicAsync", message);
            var timeOutTask = Task.Delay(2000);
            var completed = await Task.WhenAny(subscribeTask, timeOutTask);

            if (completed != subscribeTask)
                return new Response(
                    $"Subscription to topic {message.Topic} failed du to a Timeout error.",
                    false);
                        
            callBackTopics[topic] = callBack;
            return subscribeTask.Result;
        }

        public async Task<IResponse> UnsubscribeAsync(string topic)
        {
            if (!callBackTopics.ContainsKey(topic))
                return new Response(topic,
                    $"Can't unsubscribe from {topic} since it wasn't subscribed to", 
                    false);

            IMessage message = new Message(topic, null, UserId);
            Task<Response> unsubscribeTask = connection.InvokeAsync<Response>("UnsubscribeTopicAsync", message);
            var timeOutTask = Task.Delay(2000);
            
            var completed = await Task.WhenAny(unsubscribeTask, timeOutTask);

            if (completed != unsubscribeTask)
                return new Response(
                    $"Unsubscription from topic {topic} failed du to a timeout error.",
                    false);

            callBackTopics.Remove(topic);
            return unsubscribeTask.Result;
        }

        public async Task PublishAsync(string topic, string content)
        {
            IMessage message = new Message(topic, content, UserId);
            await connection.InvokeAsync("PublishAsync", message);
        }

        public async Task<IResponse> AddResponder(string responder, Func<IRequest, Object> callBack)
        {
            Response response = await connection.InvokeAsync<Response>("VerifyUserRegistered", responder);
            if (!response.Success)
            {
                callBackByResponder.Remove(responder);
                return response;
            }
            bool success = callBackByResponder.TryAdd(responder, callBack);
            return new Response(null, $"{responder} {(success ? "has been successfully added as" : "is already")} a responder.", success);
        }

        public async Task<IResponse> QueryAsync(string responder, string additionalData)
        {
            IRequest request = new Request(responder, additionalData, UserId);
            IResponse response = await connection.InvokeAsync<Response>("QueryAsync", request);
            return response;
            //return callBackByResponder.TryAdd(responder, callBack);
        }
    }
}
