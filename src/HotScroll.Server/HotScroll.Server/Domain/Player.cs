

using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Player
    {
        private PlayerStatus status = PlayerStatus.Pending;

        public string Name { get; set; }

        public string Id { get; set; }

        [JsonIgnore]
        public int Score { get; set; }

        [JsonIgnore]
        public PlayerStatus Status
        {
            get { return status; }
            set { status = value; }
        }

        public string ConnectionId { get; set; }
    }

    public enum PlayerStatus
    {
        Pending = 1,
        WaitingForPartner = 2,
        Playing = 3,
    }
}