using System.Collections.Generic;

namespace HotScroll.Server.Domain
{
    public class DuelProjection
    {
        public string Id { get; set; }
        public Player Opponent { get; set; }
        public IEnumerable<Player> Opponents { get; set; }
    }
}