namespace HotScroll.Server.Domain
{
    public class BackgroundObject
    {
        public BackgroundType Type { get; set; }
        public int Offset { get; set; }

        public void GenerateRandom()
        {
            
        }
    }

    public enum BackgroundType
    {
        []
        Bench = 1,
        Tree = 2,
        Tree2 = 3,
        Bush = 4,
        Hydrant = 5,
        Flower = 6,
        Flower2 = 7,
    }
}