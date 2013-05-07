using System;
using HotScroll.Server.Services;

namespace HotScroll.Server
{
    public class Game
    {
        private readonly static Lazy<Game> InstanceInternal = new Lazy<Game>(() => new Game());

        public static Game Instance { get { return InstanceInternal.Value; } }

        public PlayerService PlayerService { get; private set; }
        public DuelService DuelService { get; private set; }

        public Game()
        {
            PlayerService = new PlayerService();
            DuelService = new DuelService();
        }
    }
}