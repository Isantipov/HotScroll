using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using HotScroll.Server.Services;

namespace HotScroll.Server
{
    public class Game
    {
        private readonly static Lazy<Game> _instance = new Lazy<Game>(() => new Game());

        public static Game Instance { get { return _instance.Value; } }

        public PlayerService PlayerService { get; private set; }
        public DuelService DuelService { get; private set; }

        public Game()
        {
            PlayerService = new PlayerService();
            DuelService = new DuelService();
        }
    }
}