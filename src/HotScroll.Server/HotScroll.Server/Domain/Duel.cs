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

        public Random Random { get; set; }

        [JsonIgnore]
        public bool IsGameOver { get; set; }

        public Duel(List<Player> players)
        {
            Id = Guid.NewGuid().ToString();
            Players = players;
            Level = new LevelMap();
            Random = new Random();
            Level.GenerateRandom(Random);
        }

        public DuelProjection ToProjection(string userId)
        {
            return new DuelProjection
                       {
                           Level = Level,
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