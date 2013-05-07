using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class Player
    {
        private PlayerStatus _status = PlayerStatus.Pending;

        public string Name { get; set; }

        public string ConnectionId { get; set; }

        [JsonIgnore]
        public int Score { get; set; }

        [JsonIgnore]
        public PlayerStatus Status
        {
            get { return _status; }
            set { _status = value; }
        }
    }

    public enum PlayerStatus
    {
        Pending = 1,
        WaitingForPartner = 2,
        Playing = 3,
    }
}