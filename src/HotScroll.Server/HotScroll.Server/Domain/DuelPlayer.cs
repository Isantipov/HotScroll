namespace HotScroll.Server.Domain
{
    public class DuelPlayer
    {
        private readonly PlayerTemplate template;
        private readonly Player player;

        public Player Player
        {
            get { return player; }
        }

        public PlayerTemplate Template
        {
            get { return template; }
        }

        public DuelPlayer(Player player, PlayerTemplate template)
        {
            this.player = player;
            this.template = template;
        }
    }
}