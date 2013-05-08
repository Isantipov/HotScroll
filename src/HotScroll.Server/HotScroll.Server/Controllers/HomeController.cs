using System.Web.Mvc;

namespace HotScroll.Server.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult JoinDuel(string id)
        {
            var applicatioLink = GetApplicatioLink(id);

            return View();
        }

        private string GetApplicatioLink(string id)
        {
            return string.Format("scrollcat:joinduel-{0}", id);
        }
    }
}
