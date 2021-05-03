﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;

namespace SignalRCommunicator
{
    internal class Communicator :ICommunicator
    {
        private readonly HubConnection connection;
        private readonly Dictionary<string, Func<string, Task>> callBackTopics;
        private readonly string UserId;
        
        public Communicator()
        {
            callBackTopics = new Dictionary<string, Func<string, Task>>();
            UserId = "User" + new Random().Next(1, 50);
            connection = new HubConnectionBuilder()
                .WithUrl("https://localhost:44392/testhub")
                .Build();

            _ = Task.Run(async () => { await connection.StartAsync(); });
            connection.Closed += async (error) =>
            {
                await Task.Delay(new Random().Next(0, 5) * 1000);
                await connection.StartAsync();
            };

            connection.On<Message>(nameof(OnPublish), OnPublish);
        }

        private async Task OnPublish(Message message)
        {
            await callBackTopics[message.Topic]($"{message.Sender} published : {message.Content} on topic {message.Topic}");
        }
        
        public async Task<Response> SubscribeAsync(string topic, Func<string, Task> callBack)
        {
            if (callBackTopics.ContainsKey(topic))
                return null;
            
            Message message = new Message(topic, null, UserId);
            Task<Response> subscribeTask = connection.InvokeAsync<Response>("SubscribeTopicAsync", message);
            Response response = await subscribeTask;
            var timeOutTask = Task.Delay(2000);
            await timeOutTask;
            var completed = Task.WhenAny(subscribeTask, timeOutTask);

            if (completed.Result != subscribeTask)
                return new Response(topic,
                    $"Subscription to topic {message.Topic} failed du to a Timeout error.",
                    false);
                        
            callBackTopics[topic] = callBack;
            return response;
        }

        public async Task<Response> UnsubscribeAsync(string topic)
        {
            if (!callBackTopics.ContainsKey(topic))
                return new Response(topic,
                    $"Can't unsubscribe from {topic} since it wasn't subscribed to", 
                    false);

            Message message = new Message(topic, null, UserId);
            Task<Response> unsubscribeTask = connection.InvokeAsync<Response>("UnsubscribeTopicAsync", message);
            Response response = await unsubscribeTask;
            var timeOutTask = Task.Delay(2000);
            await timeOutTask;

            var completed = Task.WhenAny(unsubscribeTask, timeOutTask);

            if (completed.Result != unsubscribeTask)
                return new Response(topic,
                    $"Unsubscription from topic {topic} failed du to a timeout error.",
                    false);

            callBackTopics.Remove(topic);
            return response;
        }

        public async Task PublishAsync(string topic, string content)
        {
            IMessage message = new Message(topic, content, UserId);
            await connection.InvokeAsync("PublishAsync", message);
        }
    }
}
