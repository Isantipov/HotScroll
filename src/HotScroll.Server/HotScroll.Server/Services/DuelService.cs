using System;
using System.Collections.Generic;
using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.Services
{
    public class DuelService
    {
        private static readonly List<Duel> DuelsInternal = new List<Duel>();

        public static List<Duel> Duels
        {
            get { return DuelsInternal; }
        }

        public static Duel AddDuel(User player1, User player2)
        {
            var duel = new Duel {Player1 = player1, Player2 = player2, Id = Guid.NewGuid().ToString()};
            DuelsInternal.Add(duel);
            return duel;
        }

        public static Duel GetDuel(string id)
        {
            return DuelsInternal.FirstOrDefault(t => t.Id == id);
        }

        public static Duel GetDuelForUser(string userId)
        {
            return DuelsInternal.FirstOrDefault(t => !t.IsGameOver && (t.Player1.Id == userId || t.Player2.Id == userId));
        }

        public static bool IsGameOver(Step step)
        {
            const int pointToWin = 1000;

            return step.Points >= pointToWin;
        }
    }
}