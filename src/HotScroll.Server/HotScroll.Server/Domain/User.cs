

namespace HotScroll.Server.Domain
{
    public class User
    {
        public string Name { get; set; }

        public string Id { get; set; }

        public int Score { get; set; }

        public UserStatus Status { get; set; }
    }

    public enum UserStatus
    {
        Pending = 1,
        Playing = 2,
    }
}