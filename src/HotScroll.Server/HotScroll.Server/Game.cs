using System;
using System.Collections.Generic;
using System.Linq;
using System.Timers;
using HotScroll.Server.Hubs;
using HotScroll.Server.Services;
using Microsoft.AspNet.SignalR;
using HotScroll.Server.Domain;

namespace HotScroll.Server
{
    public class Game
    {
        #region [Constants]

        private const string DuelHasAlreadyStartedError = "Duel has already been started with another player";
        private const string NoSuchPlayer = "No such player";
        private const string NoSuchDuel = "No such duel";

        #endregion

        private readonly static Lazy<Game> InstanceInternal = new Lazy<Game>(() => new Game());

        private const int MaxTimeout = 16001;
        private const int MinTimeout = 13000;

        public Random Random { get; set; }

        public static Game Instance { get { return InstanceInternal.Value; } }

        public PlayerService PlayerService { get; private set; }
        public DuelService DuelService { get; private set; }
        public BotService BotService { get; private set; }

        public Game()
        {
            Random = new Random();
            PlayerService = new PlayerService();
            DuelService = new DuelService(Random);
            BotService = new BotService(Random);
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
            if ((duel = DuelService.GetDuelForPlayer(player.ConnectionId)) != null)
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
            var duel = new Duel(Random, new List<Player> { player });
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

            Player opponent = PlayerService.GetFreePlayer(player);

            if (opponent != null)
            {
                TryCreateDuel(player, opponent);
            }
            else
            {
                var timeout = Random.Next(MinTimeout, MaxTimeout);
                
                player.PartnerWaitTimerElapsed += OnWaitPartnerTimerElapsed;
                player.StartWaitingPartner(timeout);
            }
            
        }

        protected void OnWaitPartnerTimerElapsed(object sender, PlayerEventArgs eventArgs)
        {
            var player = eventArgs.Player;
            if (player != null)
            {
                player.StopWaitingPartner();
                player.PartnerWaitTimerElapsed -= OnWaitPartnerTimerElapsed;
                // TODO: try rerun timer if bot limit is exceded at the moment
                TryConnectAIPlayer(player);
            }
        }

        protected void TryCreateDuel(Player player, Player opponent)
        {
            player.StopWaitingPartner();
            player.PartnerWaitTimerElapsed -= OnWaitPartnerTimerElapsed;
            opponent.StopWaitingPartner();
            opponent.PartnerWaitTimerElapsed -= OnWaitPartnerTimerElapsed;

            var duel = new Duel(Random, new List<Player> {player, opponent});
            DuelService.Add(duel);

            PrepareDuel(duel);
        }

        protected void TryConnectAIPlayer(Player opponent)
        {
            var aiPlayer = BotService.AddForPlayer(opponent);
            if (aiPlayer == null)
            {
                // Means we can't create new AI player
                return ;
            }

            PlayerService.Add(aiPlayer);
            aiPlayer.Status = PlayerStatus.WaitingForPartner;
            
            TryCreateDuel(aiPlayer, opponent);
        }

        public void RecordStep(string connectionId, Step step)
        {
            Player player = PlayerService.Get(connectionId);
            if (player == null)
            {
                return;
            }
            Duel duel = DuelService.GetDuelForPlayer(player.ConnectionId);
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
            var duel = DuelService.GetDuelForPlayer(player.ConnectionId);
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

                GameOver(opponent, false);
                GameOver(player, true);
            }
        }

        private void StartDuel(Duel duel)
        {
            duel.Status = DuelStatus.IsPreparing;

            foreach (var duelPlayer in duel.Players)
            {
                Play(duelPlayer.Player);
                
            }
        }

        protected void PrepareToPlay(Player player, Duel duel)
        {
            DuelProjection proj = duel.ToProjection(player.ConnectionId);
            if (player is Bot)
            {
                player.Status = PlayerStatus.ReadyToPlay;
                (player as Bot).Duel = proj;
            }
            else
            {
                player.Status = PlayerStatus.PreparingToPlay;
                GetContext().Clients.Client(player.ConnectionId).prepare(proj);
            }
        }

        protected void Play(Player player)
        {
            player.Status = PlayerStatus.Playing;
            if (player is Bot)
            {
                (player as Bot).Play();
            }
            else
            {
                GetContext().Clients.Client(player.ConnectionId).play();
            }
        }

        protected void GameOver(Player player, bool hasWon)
        {
            player.Status = PlayerStatus.Pending;
            if (player is Bot)
            {
                var bot = player as Bot;
                bot.Stop();
                BotService.Remove(bot);
                PlayerService.Remove(bot);
            }
            else
            {
                GetContext().Clients.Client(player.ConnectionId).gameOver(hasWon: hasWon);
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
                PrepareToPlay(player, duel);
            }
        }

        #endregion
    }
}