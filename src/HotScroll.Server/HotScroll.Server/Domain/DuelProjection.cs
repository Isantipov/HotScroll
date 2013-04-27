using System.Collections.Generic;

namespace HotScroll.Server.Domain
{
    public class DuelProjection
    {
        public string Id { get; set; }
        public User Opponent { get; set; }
        public IEnumerable<User> Opponents { get; set; }
    }
}