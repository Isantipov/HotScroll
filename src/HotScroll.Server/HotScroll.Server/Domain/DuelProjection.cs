using System.Collections.Generic;

namespace HotScroll.Server.Domain
{
    public class DuelProjection
    {
        public LevelMap Level { get; set; }
        public Player Opponent { get; set; }
        public IEnumerable<Player> Opponents { get; set; }
        public PlayerTemplate PlayerTemplate { get; set; }
    }
}