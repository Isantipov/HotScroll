using System.Linq;
using HotScroll.Server.Domain;

namespace HotScroll.Server.ViewModels
{
    public class JoinDuelViewModel
    {
        private readonly Duel duel;

        public JoinDuelViewModel(Duel duel)
        {
            this.duel = duel;
        }

        public string OpponentName
        {
            get { return duel.Players.First().Name; }
        }

        public string LaunchScrollCatUrl
        {
            get { return GetApplicatioLink(duel.Id); }
        }

        private string GetApplicatioLink(string id)
        {
            return string.Format("scrollcat:joinduel-{0}", id);
        }
    }
}