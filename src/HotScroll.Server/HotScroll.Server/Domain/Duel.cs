using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Duel
    {
        public string Id { get; set; }

        public List<User> Players { get; set; }

        public LevelMap Level { get; set; }

        [JsonIgnore]
        public bool IsGameOver { get; set; }

        [JsonIgnore]
        public List<Step> Steps { get; set; }

        public Duel()
        {
            Id = Guid.NewGuid().ToString();
            Steps = new List<Step>();
            Players = new List<User>();
        }

        public DuelProjection ToProjection(string userId)
        {
            return new DuelProjection
                       {
                           Id = Id,
                           Opponent = GetOpponent(userId), 
                           Opponents = GetOpponents(userId),
                       };
        }

        public User GetOpponent(string userId)
        {
            return Players.FirstOrDefault(t => t.Id != userId);
        }

        public IEnumerable<User> GetOpponents(string userId)
        {
            return Players.Where(t => t.Id != userId);
        }

    }
}