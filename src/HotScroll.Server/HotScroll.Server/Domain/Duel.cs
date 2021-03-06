﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Duel
    {
        private const int MinPlayersPerDuel = 2;
        private readonly object _lockObject = new object();

        public string Id { get; set; }

        public string RetriedDuelId { get; set; }

        public object LockObject
        {
            get { return _lockObject; }
        }

        public List<DuelPlayer> Players { get; private set; }

        public LevelMap Level { get; set; }

        protected Random Random { get; set; }

        [JsonIgnore]
        public bool IsGameOver
        {
            get { return Status == DuelStatus.GameOver; }
        }

        [JsonIgnore]
        public DuelStatus Status { get; set; }

        public bool HasEnoughPlayersToStart
        {
            get { return Players.Count == MinPlayersPerDuel; }
        }

        public Duel(Random random, IEnumerable<Player> players, string retriedDuelId = null)
        {
            RetriedDuelId = retriedDuelId;
            Id = Guid.NewGuid().ToString();
            Players = new List<DuelPlayer>();
            AddPlayers(players);
            Level = new LevelMap();
            Random = random;
            Status = DuelStatus.WaitingForPlayers;
            Level.GenerateRandom(Random);
        }

        public DuelProjection ToProjection(string userId)
        {
            return new DuelProjection
                       {
                           DuelId = Id,
                           Level = Level.Clone(),
                           Opponent = GetOpponent(userId), 
                           Opponents = GetOpponents(userId),
                           PlayerTemplate = GetPlayerTemplate(userId),
                       };
        }

        private PlayerTemplate GetPlayerTemplate(string userId)
        {
            return Players.First(t => t.Player.ConnectionId == userId).Template;
        }

        public Player GetOpponent(string playerId)
        {
            return Players.FirstOrDefault(t => t.Player.ConnectionId != playerId).Player;
        }

        public IEnumerable<Player> GetOpponents(string connectionId)
        {
            return Players.Where(t => t.Player.ConnectionId != connectionId).Select(i => i.Player);
        }

        public string ToJoinLink()
        {
            var helper = new UrlHelper(HttpContext.Current.Request.RequestContext);

            return helper.Action("JoinDuel", "Home", new {Id}, "http");
        }

        /// <summary>
        /// Checks if the <paramref name="step"/> finishes the game.
        /// </summary>
        /// <param name="step">Step to examine.</param>
        /// <returns>True, if step finishes the game, otherwise, false.</returns>
        public bool IsGameOverStep(Step step)
        {
            return step.Points >= LevelMap.MaximumScore;
        }

        private void AddPlayers(IEnumerable<Player> players)
        {
            foreach (var player in players)
            {
                AddPlayer(player);
            }
        }

        public void AddPlayer(Player player)
        {
            var duelPlayer = new DuelPlayer(player, GetPlayerTemplate());
            Players.Add(duelPlayer);
        }

        private PlayerTemplate GetPlayerTemplate()
        {
            if (Players.Any(i => i.Template == PlayerTemplate.GreenCat))
            {
                return PlayerTemplate.PinkCat;
            }

            return PlayerTemplate.GreenCat;
        }
    }
}