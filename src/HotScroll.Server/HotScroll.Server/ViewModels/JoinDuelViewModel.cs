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

        public string BuyFromStorURL
        {
            get { return "http://apps.microsoft.com/windows/en-US/app/twitter/8289549f-9bae-4d44-9a5c-63d9c3a79f35"; }
        }

        private string GetApplicatioLink(string id)
        {
            return string.Format("scrollcat:joinduel/{0}", id);
        }
    }
}