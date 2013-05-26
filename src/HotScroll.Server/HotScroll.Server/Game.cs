using System;
using System.Collections.Generic;
using System.Linq;
using HotScroll.Server.Hubs;
using HotScroll.Server.Services;
using Microsoft.AspNet.SignalR;
using HotScroll.Server.Domain;

namespace HotScroll.Server
{
    public class Game
    {
        #region [Constants]

        const string DuelHasAlreadyStartedError = "Duel has already been started with another player";
        const string NoSuchPlayer = "No such player";
        const string NoSuchDuel = "No such duel";

        #endregion

        private readonly static Lazy<Game> InstanceInternal = new Lazy<Game>(() => new Game());

        public static Game Instance { get { return InstanceInternal.Value; } }

        public PlayerService PlayerService { get; private set; }
        public DuelService DuelService { get; private set; }

        public Game()
        {
            PlayerService = new PlayerService();
            DuelService = new DuelService();
        }
        
        public IHubContext GetContext()
        {
            return GlobalHost.ConnectionManager.GetHubContext<GameHub>();
        }

        public Player AddNewPlayer(string connectionId)
        {
            return PlayerService.New(connectionId);
        }

        public void RemovePlayer(string connectionId)
        {
            var player = PlayerService.Get(connectionId);
            if (player == null)
            {
                return;
            }
            PlayerService.Remove(player);
            Duel duel;
            if ((duel = DuelService.GetDuelForPLayer(player.ConnectionId)) != null)
            {
                var duelPlayer = duel.Players.First(i => i.Player == player);
                duelPlayer.Disconnected = true;

                if (duel.Players.All(i => i.Disconnected))
                {
                    DuelService.FinishAndRemove(duel);
                }
            }
        }

        public Player ChangePlayerName(string connactionId, string playerName)
        {
            var player = PlayerService.Get(connactionId);
            if (player != null)
            {
                player.Name = playerName;
            }
            return player;
        }

        public Duel CreateDuel(string connectionId)
        {
            var player = PlayerService.Get(connectionId);
            if (player == null)
            {
                return null;
            }
            var duel = new Duel(new List<Player> { player });
            DuelService.Add(duel);

            return duel;
        }

        public string JoinDuel(string connectionId, string duelId)
        {
            var player = PlayerService.Get(connectionId);
            if (player == null)
            {
                return NoSuchPlayer;
            }
            var duel = DuelService.Get(duelId);
            if (duel == null)
            {
                return NoSuchDuel;
            }
            lock (duel.LockObject)
            {
                if (duel.Status != DuelStatus.WaitingForPlayers)
                {
                    return DuelHasAlreadyStartedError;
                }

                duel.AddPlayer(player);
                PrepareDuel(duel);

                return null;
            }
        }

        public void WaitPartner(string connectionId)
        {
            Player player = PlayerService.Get(connectionId);
            player.Status = PlayerStatus.WaitingForPartner;
            Player oponent = PlayerService.GetFreePlayer(player);

            if (oponent != null)
            {
                var duel = new Duel(new List<Player> { player, oponent });
                DuelService.Add(duel);

                PrepareDuel(duel);
            }
        }

        public void RecordStep(string connectionId, Step step)
        {

            Player player = PlayerService.Get(connectionId);
            Duel duel = DuelService.GetDuelForPLayer(player.ConnectionId);
            if (duel == null || duel.IsGameOver)
            {
                return;
            }

            Player opponent = duel.GetOpponent(player.ConnectionId);
            GetContext().Clients.Client(opponent.ConnectionId).receiveStep(step);

            if (duel.IsGameOverStep(step))
            {
                TryWinDuel(duel, player);
            }
        }

        public void ReadyToPlay(string connectionId)
        {
            var player = PlayerService.Get(connectionId);
            if (player == null)
            {
                return;
            }
            var duel = DuelService.GetDuelForPLayer(player.ConnectionId);
            if (duel == null)
            {
                return;
            }
            player.Status = PlayerStatus.ReadyToPlay;
            var opponents = duel.GetOpponents(player.ConnectionId).ToList();
            var allready = opponents.Any() && opponents.All(t => t.Status == PlayerStatus.ReadyToPlay);
            if (allready)
            {
                StartDuel(duel);
            }
        }

        public void RetryDuel(string connectionId, string duelId)
        {
            Player player = PlayerService.Get(connectionId);
            Duel retryDuel = DuelService.GetRetryDuel(duelId);

            retryDuel.AddPlayer(player);
            if (retryDuel.HasEnoughPlayersToStart)
            {
                PrepareDuel(retryDuel);
            }
        }

        #region Helpers

        private void TryWinDuel(Duel duel, Player player)
        {
            lock (duel.LockObject)
            {
                if (duel.IsGameOver)
                {
                    return;
                }

                DuelService.FinishAndRemove(duel);
                Player opponent = duel.GetOpponent(player.ConnectionId);

                GetContext().Clients.Client(opponent.ConnectionId).gameOver(hasWon: false);
                GetContext().Clients.Client(player.ConnectionId).gameOver(hasWon: true);

                player.Status = opponent.Status = PlayerStatus.Pending;
            }
        }

        private void StartDuel(Duel duel)
        {
            duel.Status = DuelStatus.IsPreparing;

            foreach (var duelPlayer in duel.Players)
            {
                duelPlayer.Player.Status = PlayerStatus.Playing;
                GetContext().Clients.Client(duelPlayer.Player.ConnectionId).play();
            }
        }

        /// <summary>
        ///     Starts the duel and sends Play notifications to
        ///     participating players.
        /// </summary>
        /// <param name="duel">Duel to start.</param>
        private void PrepareDuel(Duel duel)
        {
            duel.Status = DuelStatus.IsPreparing;

            foreach (DuelPlayer duelPlayer in duel.Players)
            {
                var player = duelPlayer.Player;
                player.Status = PlayerStatus.PreparingToPlay;

                DuelProjection proj = duel.ToProjection(player.ConnectionId);
                GetContext().Clients.Client(player.ConnectionId).prepare(proj);
            }
        }

        #endregion
    }
}