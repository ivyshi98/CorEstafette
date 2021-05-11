using System;
using Newtonsoft.Json;

namespace SignalRCommunicator
{
    [Serializable]
    public class Response : IResponse
    {
        [JsonProperty]
        public string CorrelationId { get; set; }

        [JsonProperty]
        public string Topic { get; set; }

        [JsonProperty]
        public string Content { get; set; }

        [JsonProperty]
        public string Sender { get; set; }

        [JsonProperty]
        public DateTime Timestamp { get; set; }
        
        [JsonProperty]
        public bool Success { get; set; }

        public Response()
        {
            CorrelationId = Guid.NewGuid().ToString();
            Timestamp = DateTime.Now;
        }
        public Response( 
            bool success,
            string correlationId,
            string topic,
            string content,
            string sender,
            DateTime timestamp
            ) :this()
        {
            CorrelationId = correlationId;
            Topic = topic;
            Content = content;
            Sender = sender;
            Success = success;
        }

        public Response(string topic, bool success) 
            :this()
        {
            Topic = topic;
            Success = success;
        }
        public Response(string topic, string content, bool success)
            : this(topic, success)
        {
            Content = content;
        }

        public Response(string sender, string topic, string content, bool success)
            : this(topic, content, success)
        {
            Sender = sender;
        }

        public Response(Message message, bool success)
            : this(success, message.CorrelationId, message.Topic, message.Content, message.Sender, message.Timestamp)
        {

        }


        /*public Response( string content, string sender, DateTime timestamp, bool success ) : this()
        {
            Content = content;
            Sender = sender;
            Timestamp = timestamp;
            Success = success;
        }*/
    }
}
