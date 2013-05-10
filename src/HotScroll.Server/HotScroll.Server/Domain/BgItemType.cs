namespace HotScroll.Server.Domain
{
    public class BgItemType
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsOverlapping { get; set; }
        public bool IsReplicable { get; set; }
        public int? Margin { get; set; }
        public int WidthPx { get; set; }
        public int Size { get { return WidthPx/14; } }
    }
}