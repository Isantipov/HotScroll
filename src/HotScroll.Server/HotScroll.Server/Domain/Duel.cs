using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Duel
    {
        public string Id { get; set; }
        public User Player1 { get; set; }
        public User Player2 { get; set; }

        [JsonIgnore]
        public List<Step> Steps { get; set; }

        public Duel()
        {
            Id = Guid.NewGuid().ToString();
            Steps = new List<Step>();
        }
    }
}