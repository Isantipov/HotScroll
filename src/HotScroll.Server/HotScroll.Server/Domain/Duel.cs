using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Duel
    {
        public string Id { get; set; }

        public List<Player> Players { get; set; }

        public LevelMap Level { get; set; }

        [JsonIgnore]
        public bool IsGameOver { get; set; }

        [JsonIgnore]
        public List<Step> Steps { get; set; }

        public Duel()
        {
            Id = Guid.NewGuid().ToString();
            Steps = new List<Step>();
            Players = new List<Player>();
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

        public Player GetOpponent(string playerId)
        {
            return Players.FirstOrDefault(t => t.Id != playerId);
        }

        public IEnumerable<Player> GetOpponents(string userId)
        {
            return Players.Where(t => t.Id != userId);
        }

    }
}