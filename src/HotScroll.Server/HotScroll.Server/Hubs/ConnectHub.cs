﻿using System.Collections.Generic;
using HotScroll.Server.Domain;
using HotScroll.Server.Services;
using Microsoft.AspNet.SignalR;

namespace HotScroll.Server.Hubs
{
    /// <summary>
    ///     Manage connections.
    /// </summary>
    public class ConnectHub : Hub
    {
        public Player Connect(Player player)
        {
            player.ConnectionId = Context.ConnectionId;
            PlayerService.Add(player);
            Clients.All.playerConnected(player);
            return player;
        }

        public DuelProjection WaitPartner(Player player)
        {
            var serverPlayer = PlayerService.Get(player.Id);
            serverPlayer.Status = PlayerStatus.WaitingForPartner;
            var oponent = PlayerService.GetFreePlayer(serverPlayer);
            
            if (oponent != null)
            {
                serverPlayer.Status = oponent.Status = PlayerStatus.Playing;
                var duel = DuelService.AddDuel(new List<Player> {serverPlayer, oponent});

                var proj1 = duel.ToProjection(serverPlayer.Id);
                Clients.Client(serverPlayer.ConnectionId).play(proj1);

                var proj2 = duel.ToProjection(oponent.Id);
                Clients.Client(oponent.ConnectionId).play(proj2);
                return proj1;
            }

            return null;
        }
        
        public void RecordStep(Step step)
        {
            var player = PlayerService.Get(step.PlayerId);
            var duel = DuelService.GetDuelForPLayer(player.Id);
            if (duel == null || duel.IsGameOver)
            {
                return;
            }

            var opponent = duel.GetOpponent(player.Id);
            Clients.Client(opponent.ConnectionId).receiveStep(step);
        }

        /// <summary>
        ///     Record finished event. The one, which sends it first, wins.
        ///     Everyone gets notified.
        /// </summary>
        public void RecordFinished()
        {
            Player player = PlayerService.GetByConnectionId(Context.ConnectionId);
            Duel duel = DuelService.GetDuelForPLayer(player.Id);
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

                DuelService.FinishAndRemove(duel);
                var opponent = duel.GetOpponent(player.Id);

                Clients.Client(opponent.ConnectionId).gameOver(hasWon: false);
                Clients.Caller.gameOver(hasWon: true);

                player.Status = opponent.Status = PlayerStatus.Pending;
            }
        }
    }
}