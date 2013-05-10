﻿using System.Collections.Generic;
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
                return null;
            }
            var duel = game.DuelService.Get(duelId);
            lock (duel.LockObject)
            {
                if (duel.Status != DuelStatus.WaitingForPlayers)
                {
                    return DuelHasAlreadyStartedError;
                }

                duel.Players.Add(player);
                StartDuel(duel);

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
                foreach (var opp in duel.GetOpponents(player.ConnectionId))
                {
                    Clients.Client(opp.ConnectionId).opponentDisconnected(opp);
                }
                game.DuelService.FinishAndRemove(duel);
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
            Player serverPlayer = game.PlayerService.Get(player.ConnectionId);
            serverPlayer.Status = PlayerStatus.WaitingForPartner;
            Player oponent = game.PlayerService.GetFreePlayer(serverPlayer);

            if (oponent != null)
            {
                var duel = new Duel(new List<Player> {serverPlayer, oponent});
                game.DuelService.Add(duel);

                StartDuel(duel);
            }
        }

        public void RecordStep(Step step)
        {
            Player player = game.PlayerService.Get(step.PlayerId);
            Duel duel = game.DuelService.GetDuelForPLayer(player.ConnectionId);
            if (duel == null || duel.IsGameOver)
            {
                return;
            }

            Player opponent = duel.GetOpponent(player.ConnectionId);
            Clients.Client(opponent.ConnectionId).receiveStep(step);
        }

        /// <summary>
        ///     Record finished event. The one, which sends it first, wins.
        ///     Everyone gets notified.
        /// </summary>
        public void RecordFinished()
        {
            Player player = game.PlayerService.Get(Context.ConnectionId);
            Duel duel = game.DuelService.GetDuelForPLayer(player.ConnectionId);
            if (duel == null)
            {
                return;
            }

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

        #region [Help Methods]

        /// <summary>
        ///     Starts the duel and sends Play notifications to
        ///     participating players.
        /// </summary>
        /// <param name="duel">Duel to start.</param>
        private void StartDuel(Duel duel)
        {
            duel.Status = DuelStatus.InProgress;

            foreach (Player player in duel.Players)
            {
                player.Status = PlayerStatus.Playing;

                DuelProjection proj = duel.ToProjection(player.ConnectionId);
                Clients.Client(player.ConnectionId).play(proj);
            }
        }

        #endregion
    }
}