using System;
using System.Collections.Generic;
using HotScroll.Server.Domain;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class GameHub : Hub
    {

        private readonly Game _game;

        public GameHub() : this(Game.Instance) { }

        public GameHub(Game game)
        {
            _game = game;
        }

        public Duel CreateDuel(Player player)
        {
            throw new NotImplementedException();
        }

        public Duel JoinDuel(Player player, string duelId)
        {
            throw new NotImplementedException();
        }

        public Player Connect(Player player)
        {
            player.ConnectionId = Context.ConnectionId;
            _game.PlayerService.Add(player);
            Clients.All.playerConnected(player);
            return player;
        }

        public DuelProjection WaitPartner(Player player)
        {
            var serverPlayer = _game.PlayerService.Get(player.ConnectionId);
            serverPlayer.Status = PlayerStatus.WaitingForPartner;
            var oponent = _game.PlayerService.GetFreePlayer(serverPlayer);
            
            if (oponent != null)
            {
                serverPlayer.Status = oponent.Status = PlayerStatus.Playing;
                var duel = new Duel(new List<Player> {serverPlayer, oponent});
                _game.DuelService.Add(duel);

                var proj1 = duel.ToProjection(serverPlayer.ConnectionId);
                Clients.Client(serverPlayer.ConnectionId).play(proj1);

                var proj2 = duel.ToProjection(oponent.ConnectionId);
                Clients.Client(oponent.ConnectionId).play(proj2);
                return proj1;
            }

            return null;
        }
        
        public void RecordStep(Step step)
        {
            var player = _game.PlayerService.Get(step.PlayerId);
            var duel = _game.DuelService.GetDuelForPLayer(player.ConnectionId);
            if (duel == null || duel.IsGameOver)
            {
                return;
            }

            var opponent = duel.GetOpponent(player.ConnectionId);
            Clients.Client(opponent.ConnectionId).receiveStep(step);
        }

        /// <summary>
        ///     Record finished event. The one, which sends it first, wins.
        ///     Everyone gets notified.
        /// </summary>
        public void RecordFinished()
        {
            var player = _game.PlayerService.Get(Context.ConnectionId);
            var duel = _game.DuelService.GetDuelForPLayer(player.ConnectionId);
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

                _game.DuelService.FinishAndRemove(duel);
                var opponent = duel.GetOpponent(player.ConnectionId);

                Clients.Client(opponent.ConnectionId).gameOver(hasWon: false);
                Clients.Caller.gameOver(hasWon: true);

                player.Status = opponent.Status = PlayerStatus.Pending;
            }
        }
    }
}