namespace HotScroll.Server.Domain
{
    public class Step
    {
        public int Points { get; set; }
        public long Timestamp { get; set; }
        public string PlayerId { get; set; }
        public bool IsInert { get; set; }
    }
}