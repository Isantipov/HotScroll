using System;

namespace HotScroll.Server.Domain.Attributes
{
    public class BackgroundAttribute : Attribute
    {
        public int Size { get; set; }
        public bool OverlapAllowed { get; set; }

        public BackgroundAttribute(int size, bool overlapAllowed = true)
        {
            Size = size;
            OverlapAllowed = overlapAllowed;
        }
    }
}