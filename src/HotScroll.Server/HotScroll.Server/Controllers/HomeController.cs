using System.Web.Mvc;
using HotScroll.Server.ViewModels;

namespace HotScroll.Server.Controllers
{
    public class HomeController : Controller
    {
        private readonly Game game;

        public HomeController(): this(Game.Instance)
        {
        }

        public HomeController(Game game)
        {
            this.game = game;
        }

        public ActionResult Index()
        {
            return View();
        }

        public ActionResult JoinDuel(string id)
        {
            var duel = game.DuelService.Get(id);
            if (duel != null)
            {
                var joinDuelModel = new JoinDuelViewModel(duel);

                return View(joinDuelModel);
            }
            return Content("No such duel");
        }

        public ActionResult Privacy()
        {
            return View();
        }

        private string GetApplicatioLink(string id)
        {
            return string.Format("scrollcat:joinduel-{0}", id);
        }
    }
}
