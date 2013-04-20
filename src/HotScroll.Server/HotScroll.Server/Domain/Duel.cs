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

        public Direction Direction { get; set; }

        [JsonIgnore]
        public bool IsGameOver { get; set; }

        [JsonIgnore]
        public List<Step> Steps { get; set; }

        public Duel()
        {
            Id = Guid.NewGuid().ToString();
            Steps = new List<Step>();
            Direction = Direction.Right;
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
    
    public enum Direction
    {
        Right = 1,
        Left = 2,
    }
}