using System;

using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace SignalRCommunicator
{
    [Serializable]
    public class Request : IRequest
    {
        [JsonProperty]
        public string Responder { get; set; }

        [JsonProperty]
        public string CorrelationId { get; set; }

        [JsonProperty]
        public string Content { get; set; }

        [JsonProperty]
        public string Sender { get; set; }

        [JsonProperty]
        public DateTime Timestamp { get; set; }

        [JsonProperty]
        public string Topic { get; set; }

        public Request()
        {
            CorrelationId = Guid.NewGuid().ToString();
        }

        public Request(Message message, string responder)
            : this(responder, message.CorrelationId, message.Content, message.Sender, message.Timestamp)
        {

        }

        public Request(string responder, string content, string sender)
            :this()
        {
            Responder = responder;
            Content = content;
            Sender = sender;
            Timestamp = DateTime.Now;
        }

        public Request(
            string responder,
            string correlationId,
            string content,
            string sender,
            DateTime timestamp) : this()
        {
            Responder = responder;
            CorrelationId = correlationId;
            Content = content;
            Sender = sender;
            Timestamp = timestamp;
        }
    }
}