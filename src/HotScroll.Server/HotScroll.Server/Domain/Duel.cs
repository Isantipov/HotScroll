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
        public bool IsGameOver { get; set; }

        [JsonIgnore]
        public List<Step> Steps { get; set; }

        public Duel()
        {
            Id = Guid.NewGuid().ToString();
            Steps = new List<Step>();
        }

        public DuelProjection ToProjection(string userId)
        {
            return new DuelProjection { Opponent = GetOpponent(userId), Id = Id };
        }

        public User GetOpponent(string userId)
        {
            return Player1.Id == userId ? Player2 : Player1;
        }
    }
}