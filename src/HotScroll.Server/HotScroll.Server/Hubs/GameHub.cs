using System.Collections.Generic;
using System.Linq;
using HotScroll.Server.Domain;
using Microsoft.AspNet.SignalR;
using System.Threading.Tasks;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class GameHub : Hub
    {
        #region [Constants]

        const string DuelHasAlreadyStartedError =
                "Duel has already been started with another player";

        #endregion

        private readonly Game game;

        public GameHub() : this(Game.Instance)
        {
        }

        public GameHub(Game game)
        {
            this.game = game;
        }

        public string CreateDuel()
        {
            var player = game.PlayerService.Get(Context.ConnectionId);
            if (player == null)
            {
                return string.Empty;
            }
            var duel = new Duel(new List<Player> {player});
            game.DuelService.Add(duel);

            return duel.ToJoinLink();
        }

        public string JoinDuel(string duelId)
        {
            var player = game.PlayerService.Get(Context.ConnectionId);
            if (player == null)
            {
                return "No such player";
            }
            var duel = game.DuelService.Get(duelId);
            if (duel == null)
            {
                return "No such duel";
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

        public override Task OnConnected()
        {
            game.PlayerService.New(Context.ConnectionId);
            return base.OnConnected();
        }

        public override Task OnDisconnected()
        {
            Disconnect();
            return base.OnDisconnected();
        }

        public void Disconnect()
        {
            var player = game.PlayerService.Get(Context.ConnectionId);
            if (player == null)
            {
                return;
            }
            game.PlayerService.Remove(player);
            Duel duel;
            if ((duel = game.DuelService.GetDuelForPLayer(player.ConnectionId)) != null)
            {
                var duelPlayer = duel.Players.First(i => i.Player == player);
                duelPlayer.Disconnected = true;

                if (duel.Players.All(i => i.Disconnected))
                {
                    game.DuelService.FinishAndRemove(duel);
                }
            }
        }

        public Player ChangeName(string playerName)
        {
            var player = game.PlayerService.Get(Context.ConnectionId);
            if (player != null)
            {
                player.Name = playerName;
            }
            return player;
        }

        public void WaitPartner(Player player)
        {
            Player serverPlayer = game.PlayerService.Get(Context.ConnectionId);
            serverPlayer.Status = PlayerStatus.WaitingForPartner;
            Player oponent = game.PlayerService.GetFreePlayer(serverPlayer);

            if (oponent != null)
            {
                var duel = new Duel(new List<Player> {serverPlayer, oponent});
                game.DuelService.Add(duel);

                PrepareDuel(duel);
            }
        }

        public void RecordStep(Step step)
        {
            Player player = game.PlayerService.Get(Context.ConnectionId);
            Duel duel = game.DuelService.GetDuelForPLayer(player.ConnectionId);
            if (duel == null || duel.IsGameOver)
            {
                return;
            }

            Player opponent = duel.GetOpponent(player.ConnectionId);
            Clients.Client(opponent.ConnectionId).receiveStep(step);

            if (duel.IsGameOverStep(step))
            {
                TryWinDuel(duel, player);
            }
        }

        private void TryWinDuel(Duel duel, Player player)
        {
            lock (duel.LockObject)
            {
                if (duel.IsGameOver)
                {
                    return;
                }

                game.DuelService.FinishAndRemove(duel);
                Player opponent = duel.GetOpponent(player.ConnectionId);

                Clients.Client(opponent.ConnectionId).gameOver(hasWon: false);
                Clients.Caller.gameOver(hasWon: true);

                player.Status = opponent.Status = PlayerStatus.Pending;
            }
        }

        public void ReadyToPlay()
        {
            var player = game.PlayerService.Get(Context.ConnectionId);
            if (player == null)
            {
                return;
            }
            var duel = game.DuelService.GetDuelForPLayer(player.ConnectionId);
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

        public void RetryDuel(string duelToRetryId)
        {
            Player player = game.PlayerService.Get(Context.ConnectionId);
            Duel retryDuel = game.DuelService.GetRetryDuel(duelToRetryId);

            retryDuel.AddPlayer(player);
            if (retryDuel.HasEnoughPlayersToStart)
            {
                PrepareDuel(retryDuel);
            }
        }

        #region [Help Methods]

        private void StartDuel(Duel duel)
        {
            duel.Status = DuelStatus.IsPreparing;

            foreach (var duelPlayer in duel.Players)
            {
                duelPlayer.Player.Status = PlayerStatus.Playing;
                Clients.Client(duelPlayer.Player.ConnectionId).play();
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
                Clients.Client(player.ConnectionId).prepare(proj);
            }
        }

        #endregion
    }
}