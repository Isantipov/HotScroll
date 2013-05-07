using System;
using System.Collections.Generic;
using System.Linq;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Duel
    {
        private readonly object _lockObject = new object();

        public string Id { get; set; }

        public object LockObject
        {
            get { return _lockObject; }
        }

        public List<Player> Players { get; set; }

        public LevelMap Level { get; set; }

        protected Random Random { get; set; }

        [JsonIgnore]
        public bool IsGameOver
        {
            get { return Status == DuelStatus.GameOver; }
        }

        [JsonIgnore]
        public DuelStatus Status { get; set; }

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
            return Players.FirstOrDefault(t => t.ConnectionId != playerId);
        }

        public IEnumerable<Player> GetOpponents(string userId)
        {
            return Players.Where(t => t.ConnectionId != userId);
        }
    }
}