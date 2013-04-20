

using Newtonsoft.Json;

namespace HotScroll.Server.Domain
{
    public class User
    {
        public string Name { get; set; }

        public string Id { get; set; }

        [JsonIgnore]
        public int Score { get; set; }

        [JsonIgnore]
        public UserStatus Status { get; set; }

        [JsonIgnore]
        public string ConnectionId { get; set; }
    }

    public enum UserStatus
    {
        Pending = 1,
        Playing = 2,
    }
}